import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Tag, Avatar, Button, Space, Input, Select, Pagination, Layout, Spin, message } from 'antd';
import { SearchOutlined, MessageOutlined, DollarOutlined, UserOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { Search } = Input;
const { Option } = Select;

const statusNumMap = {
  1: 'pending',
  2: 'in_progress',
  3: 'completed'
};

// 角色映射表
const roleMap = {
  admin: '超级管理员',
  teacher: '教师',
  student: '学生',
  guest: '访客'
};

// 角色标签颜色映射
const roleColorMap = {
  admin: 'red',
  teacher: 'orange',
  student: 'green',
  guest: 'gray'
};

const RequirementListPage = () => {
  const [allRequirements, setAllRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
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

  // 获取当前用户信息
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

  // 获取所有需求列表
  const fetchAllRequirements = async () => {
    try {
      setLoading(true);
      
      const userInfo = await fetchCurrentUser();
      const userEmail = userInfo?.userAccount || ''; 
      
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchKeyword || undefined,
        userEmail: userEmail
      };
      
      const response = await authApi.getRequirement(params);
      
      if (response.code === 0 && response.data) {
        const formattedData = response.data.records.map((item, index) => {
          if (!item.publisher?.id) {
            console.warn(`第${index+1}条需求缺少发布者ID`, item);
          }
          
          return {
            id: item.requirementId?.toString() || '',
            title: item.requirementTitle || '无标题',
            type: item.requireType || item.requirementType || item.type || '未知类型',
            description: item.description || '无描述',
            originalStatus: item.status,
            status: statusNumMap[item.status] || 'pending',
            publishTime: item.publishTime || new Date().toISOString(),
            publisher: {
              id: item.publisher?.id?.toString() || '',
              name: item.publisher?.name || item.publisher?.username || '未知用户',
              role: item.publisher?.role || '', 
              avatar: item.publisher?.avatar || ''
            },
            applicants: item.applicants || 0,
            budget: item.budget === 0 ? '无偿' : (item.budget || '面议'),
            urgency: item.urgency || 'normal'
          };
        });
        
        setAllRequirements(formattedData);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      }
    } catch (error) {
      console.error('获取需求列表错误:', error);
      message.error('获取需求列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequirements();
  }, [pagination.current, pagination.pageSize, searchKeyword]);

  // 筛选逻辑
  useEffect(() => {
    let result = [...allRequirements];
    if (statusFilter !== 'all') {
      const statusValue = Object.keys(statusNumMap).find(key => statusNumMap[key] === statusFilter);
      if (statusValue) result = result.filter(item => item.originalStatus == statusValue);
    }
    setFilteredRequirements(result);
  }, [allRequirements, statusFilter]);

  // 状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待接单' },
      in_progress: { color: 'blue', text: '进行中' },
      completed: { color: 'green', text: '已完成' }
    };
    return <Tag color={statusMap[status]?.color || 'gray'}>{statusMap[status]?.text || '未知状态'}</Tag>;
  };

  // 检查是否已登录，如果未登录则跳转到登录页
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    return true;
  };

  // 联系发布者 - 跳转到消息页面并创建会话
  const handleContactPublisher = (publisherId, publisherName) => {
    if (!checkLoginStatus()) return;
    navigate(`/messages?toUserId=${publisherId}&toUserName=${encodeURIComponent(publisherName)}`);
  };

  // 工具方法
  const handleSearch = (value) => {
    setSearchKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };
  const handleTableChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize }));
  };
  const handleDetail = (id) => {
    navigate(`/requirements/${id}`);
  };
  const handleCreateRequirement = () => {
    navigate('/requirements/create');
  };

  // 判断是否有权限删除需求
  const canDeleteRequirement = (publisherId) => {
    if (!currentUser) return false;
    if (currentUser.userRole === 'admin') return true;
    return currentUser.userRole === 'teacher' && currentUser.id === publisherId;
  };

  // 删除需求
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个需求吗？')) {
      try {
        await authApi.deleteRequirement(id);
        message.success('需求删除成功');
        fetchAllRequirements();
      } catch (error) {
        console.error('删除需求失败:', error);
        message.error('删除需求失败，请稍后重试');
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navbar />
      
      {/* 主容器：固定宽度+居中，内部内容按需对齐 */}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '20px 16px', 
        width: '100%', 
        boxSizing: 'border-box' 
      }}>
        {/* 1. 搜索筛选区 - 搜索靠左，发布按钮靠右 */}
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Search
            placeholder="搜索需求标题/描述"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 380 }}
            onSearch={handleSearch}
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
            <Option value="pending">待接单</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          
          <div style={{ marginLeft: 'auto' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateRequirement}
              size="middle"
            >
              发布需求
            </Button>
          </div>
        </div>
        
        {/* 2. 加载状态 */}
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
            {/* 3. 需求列表容器 */}
            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: 6, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
              overflow: 'hidden' 
            }}>
              <List
                itemLayout="vertical"
                size="large"
                dataSource={filteredRequirements}  
                bordered={false}
                renderItem={(item, index) => (
                  <div style={{ 
                    padding: '16px 20px', 
                    borderBottom: index < filteredRequirements.length - 1 ? '1px solid #f0f2f5' : 'none',
                    textAlign: 'left'
                  }}>
                    {/* 3.1 状态+时间 - 靠左 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      {getStatusTag(item.status)}
                      <span style={{ color: '#888', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockCircleOutlined style={{ fontSize: 12 }} />
                        {new Date(item.publishTime).toLocaleString()}
                      </span>
                    </div>

                    {/* 3.2 标题+发布者信息 - 靠左 */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <Avatar 
                        src={item.publisher.avatar || `https://randomuser.me/api/portraits/${
                          item.publisher.role === 'student' ? 'men' : 
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

                    {/* 3.3 需求描述 - 靠左 */}
                    <div style={{ 
                      color: '#555', 
                      fontSize: 14, 
                      lineHeight: 1.5, 
                      marginBottom: 14,
                      whiteSpace: 'pre-line'
                    }}>
                      {item.description.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}
                    </div>

                    {/* 3.4 预算+申请人 - 靠左 */}
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

                    {/* 3.5 操作按钮 - 靠右对齐 核心修改点 */}
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
                locale={{ emptyText: (
                  <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'left', 
                    color: '#999', 
                    fontSize: 14 
                  }}>
                    没有找到匹配的需求
                  </div>
                )}}
              />
            </div>
            
            {/* 4. 分页 - 居中 */}
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