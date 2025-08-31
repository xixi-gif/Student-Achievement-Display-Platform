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
        console.log('当前用户信息:', response.data); 
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

  // 搜索、状态变更、分页等方法
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

  // 🔥 核心修复：使用正确的角色字段名userRole
  const canDeleteRequirement = (publisherId) => {
    console.log('删除权限判断:', {
      currentUserRole: currentUser?.userRole, // 现在会正确显示"admin"
      currentUserId: currentUser?.id,
      publisherId: publisherId
    });
    
    // 1. 若用户信息未加载，返回false
    if (!currentUser) return false;
    
    // 2. 管理员（userRole=admin）直接有权限删除所有需求
    if (currentUser.userRole === 'admin') return true;
    
    // 3. 教师仅能删除自己发布的需求（角色是teacher且ID匹配）
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
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '24px', background: '#f7f8fa' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Search
              placeholder="搜索需求"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
            <Select 
              defaultValue="all" 
              style={{ width: 120 }}
              onChange={handleStatusChange}
              value={statusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待接单</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Space>
          

        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="正在加载需求列表..." />
          </div>
        ) : (
          <>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={filteredRequirements}  
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  extra={
                    <Space direction="vertical" align="end">
                      <div>{getStatusTag(item.status)}</div>
                      <div>
                        <Tag icon={<ClockCircleOutlined />}>
                          {new Date(item.publishTime).toLocaleDateString()}
                        </Tag>
                      </div>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={item.publisher.avatar || `https://randomuser.me/api/portraits/${
                          item.publisher.role === 'student' ? 'men' : 
                          item.publisher.role === 'teacher' ? 'women' : 'lego'
                        }/${Math.floor(Math.random() * 10)}.jpg`} 
                        alt={item.publisher.name}
                      />
                    }
                    title={<a onClick={() => handleDetail(item.id)}>{item.title}</a>}
                    description={
                      <Space>
                        <span>发布者: {item.publisher.name}</span>
                        <Tag color={roleColorMap[item.publisher.role] || 'gray'}>
                          {roleMap[item.publisher.role] || '未知角色'}
                        </Tag>
                        <Tag>{item.type}</Tag>
                      </Space>
                    }
                  />
                  <div style={{ margin: '12px 0' }}>
                    {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                  </div>
                  <Space>
                    <Tag icon={<DollarOutlined />}>{item.budget}</Tag>
                    {item.applicants > 0 && <span><UserOutlined /> {item.applicants}人申请</span>}
                  </Space>
                  <div style={{ textAlign: 'right', marginTop: 12 }}>
                    <Button type="text" icon={<MessageOutlined />} onClick={() => navigate('/messages')}>
                      联系发布者
                    </Button>
                    <Button type="primary" onClick={() => handleDetail(item.id)} style={{ marginLeft: 8 }}>
                      查看详情
                    </Button>
                    {/* 权限判断正确，管理员会显示删除按钮 */}
                    {canDeleteRequirement(item.publisher.id) && (
                      <Button danger onClick={() => handleDelete(item.id)} style={{ marginLeft: 8 }}>
                        删除
                      </Button>
                    )}
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '没有找到匹配的需求' }}
            />
            
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination 
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger
                showQuickJumper
                showTotal={total => `共 ${total} 条需求`}
                onChange={handleTableChange}
                onShowSizeChange={(current, size) => handleTableChange(1, size)}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default RequirementListPage;