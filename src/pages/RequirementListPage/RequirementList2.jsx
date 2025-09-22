import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Tag, Avatar, Button, Input, Select, Pagination, Layout, Spin, message } from 'antd';
import { SearchOutlined, MessageOutlined, DollarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { Search } = Input;
const { Option } = Select;

// 状态映射配置
const statusMap = { 
  1: { color: 'orange', text: '待接单' },
  2: { color: 'blue', text: '进行中' },
  3: { color: 'green', text: '已完成' }
};
// 允许显示的状态白名单
const ALLOWED_STATUSES = [1, 2, 3];

const roleMap = { admin: '超级管理员', teacher: '教师', student: '学生', visitor: '访客' };
const roleColorMap = { admin: 'red', teacher: 'orange', student: 'green', visitor: 'gray' };

const RequirementListPage = () => {
  const [requirements, setRequirements] = useState([]);
  const [allRequirements, setAllRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await authApi.getuserlogin({ params: {} });
      if (response.code === 0 && response.data) {
        setCurrentUser(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
    }
    return null;
  };

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      await fetchCurrentUser();

      const params = {
        current: 1,
        pageSize: 1000,
      };

      const response = await authApi.getRequirement(params);
      if (response.code === 0) {
        const { records, total } = response.data;
        // 格式化数据时直接过滤掉不允许的状态
        const formattedData = records
          .filter(item => ALLOWED_STATUSES.includes(item.status))
          .map((item, index) => ({
            id: item.requirementId?.toString() || `req-${index}-${Date.now()}`,
            title: item.title || '无标题',
            type: item.requireType || item.requirementType || item.type || '未知类型',
            description: item.description || '无描述',
            status: item.status || 1,
            publishTime: item.publishTime || new Date().toISOString(),
            publisher: {
              id: item.publisher?.id?.toString() || `pub-${index}-${Date.now()}`,
              name: item.publisher?.name || item.publisher?.username || '未知用户',
              role: item.publisher?.role || '',
              avatar: item.publisher?.avatar || ''
            },
            applicants: item.applicants || 0,
            budget: item.budget === 0 ? '无偿' : (item.budget || '面议'),
            urgency: item.urgency || 'normal'
          }));
        
        setAllRequirements(formattedData);
        setPagination(prev => ({ ...prev, total: formattedData.length }));
        applyFilters(formattedData);
      } else {
        setAllRequirements([]);
        setRequirements([]);
        message.warning('未获取到需求数据');
      }
    } catch (error) {
      console.error('获取需求失败:', error);
      message.error('获取数据失败，请稍后重试');
      setAllRequirements([]);
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((data = allRequirements) => {
    let filteredData = [...data];
    
    // 搜索过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      );
    }

    // 状态筛选（只在允许的状态中筛选）
    if (statusFilter !== 'all') {
      const filterStatus = Number(statusFilter);
      filteredData = filteredData.filter(item => item.status === filterStatus);
    }

    // 分页处理
    const total = filteredData.length;
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setRequirements(paginatedData);
    setPagination(prev => ({ ...prev, total }));
  }, [searchKeyword, statusFilter, pagination.current, pagination.pageSize, allRequirements]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, statusFilter, pagination.current, pagination.pageSize, applyFilters]);

  const getStatusTag = (status) => {
    const config = statusMap[status] || { color: 'gray', text: '未知状态' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleContactPublisher = (publisherId, publisherName) => {
    if (!checkLoginStatus()) return;
    navigate(`/messages?toUserId=${publisherId}&toUserName=${encodeURIComponent(publisherName)}`);
  };

  const handleSearchInput = (value) => {
    setSearchKeyword(value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
  };

  const handleDetail = (id) => {
    navigate(`/requirements/${id}`);
  };

  const handleMyRequirements = () => {
    if (checkLoginStatus()) {
      navigate('/my-requirements');
    }
  };

  const handleMyApplications = () => {
    if (checkLoginStatus()) {
      navigate('/my-applications');
    }
  };

  const canDeleteRequirement = (publisherId) => {
    if (!currentUser) return false;
    if (currentUser.userRole === 'admin') return true;
    return currentUser.userRole === 'teacher' && currentUser.id === publisherId;
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个需求吗？')) {
      try {
        await authApi.deleteRequirement(id);
        message.success('需求删除成功');
        const updatedData = allRequirements.filter(item => item.id !== id);
        setAllRequirements(updatedData);
        applyFilters(updatedData);
      } catch (error) {
        console.error('删除需求失败:', error);
        message.error('删除需求失败，请稍后重试');
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navbar />

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '20px 16px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索需求标题/描述"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 380 }}
            value={searchKeyword}
            onChange={(e) => handleSearchInput(e.target.value)}
            onSearch={() => {
              setPagination(prev => ({ ...prev, current: 1 }));
              applyFilters();
            }}
            size="middle"
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleStatusChange}
            value={statusFilter}
            size="middle"
          >
            <Option value="all">全部状态</Option>
            <Option value="1">待接单</Option>
            <Option value="2">进行中</Option>
            <Option value="3">已完成</Option>
          </Select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <Button type="primary" onClick={handleMyRequirements} size="middle">我的需求</Button>
            <Button type="primary" onClick={handleMyApplications} size="middle">我的申请</Button>
          </div>
        </div>

        {loading ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            padding: '60px 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Spin size="large" tip="正在加载需求列表..." />
            </div>
          </div>
        ) : (
          <>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              <List
                itemLayout="vertical"
                size="large"
                dataSource={requirements}
                bordered={false}
                renderItem={(item, index) => (
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: index < requirements.length - 1 ? '1px solid #f0f2f5' : 'none',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      {getStatusTag(item.status)}
                      <span style={{ color: '#888', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockCircleOutlined style={{ fontSize: 12 }} />
                        {new Date(item.publishTime).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <Avatar
                        src={item.publisher.avatar || `https://randomuser.me/api/portraits/${item.publisher.role === 'student' ? 'men' :
                            item.publisher.role === 'teacher' ? 'women' : 'lego'
                          }/${Math.floor(Math.random() * 10)}.jpg`}
                        alt={item.publisher.name}
                        size="large"
                      />

                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}>
                          <a onClick={() => handleDetail(item.id)} style={{ color: '#1890ff' }}>
                            {item.title}
                          </a>
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                          <span style={{ color: '#666', fontSize: 13 }}>发布者: {item.publisher.name}</span>
                          <Tag color={roleColorMap[item.publisher.role] || 'gray'} size="small">
                            {roleMap[item.publisher.role] || '未知角色'}
                          </Tag>
                          <Tag size="small">{item.type}</Tag>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      color: '#555',
                      fontSize: 14,
                      lineHeight: 1.5,
                      marginBottom: 14,
                      whiteSpace: 'pre-line'
                    }}>
                      {item.description.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 13 }}>
                        <DollarOutlined style={{ fontSize: 13 }} />
                        <span>{item.budget}</span>
                      </div>
                      {item.applicants > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: 13 }}>
                          <UserOutlined style={{ fontSize: 13 }} />
                          <span>{item.applicants}人申请</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <Button
                        type="default"
                        icon={<MessageOutlined />}
                        onClick={() => handleContactPublisher(item.publisher.id, item.publisher.name)}
                        size="small"
                        style={{ padding: '0 12px' }}
                      >
                        联系发布者
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleDetail(item.id)}
                        size="small"
                        style={{ padding: '0 12px' }}
                      >
                        查看详情
                      </Button>
                      {canDeleteRequirement(item.publisher.id) && (
                        <Button
                          danger
                          onClick={() => handleDelete(item.id)}
                          size="small"
                          style={{ padding: '0 12px' }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                locale={{
                  emptyText: (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'left',
                      color: '#999',
                      fontSize: 14
                    }}>
                      没有找到匹配的需求
                    </div>
                  )
                }}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger
                showQuickJumper
                showTotal={total => `共 ${total} 条需求`}
                onChange={handleTableChange}
                onShowSizeChange={(current, size) => handleTableChange(1, size)}
                size="small"
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default RequirementListPage;
