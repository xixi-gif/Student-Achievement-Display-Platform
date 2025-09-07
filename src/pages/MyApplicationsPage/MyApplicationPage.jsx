import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Table, Avatar, Tag, Button, Space, 
  Input, Select, Spin, message, Empty, Pagination,
  Popconfirm
} from 'antd';
import { 
  MessageOutlined, SearchOutlined, EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const applicationStatusMap = {
  textToNum: {
    all: undefined,
    pending: 0,
    accepted: 1,
    rejected: 2
  },
  numToText: {
    0: { color: 'orange', text: '待审核' },
    1: { color: 'green', text: '已接受' },
    2: { color: 'red', text: '已拒绝' },
    3: { color: 'gray', text: '已取消' }
  }
};

const roleMap = {
  admin: '超级管理员',
  teacher: '教师',
  student: '学生',
  guest: '访客'
};

const roleColorMap = {
  admin: 'red',
  teacher: 'orange',
  student: 'green',
  guest: 'gray'
};

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    return true;
  };

  const fetchMyApplications = async () => {
    if (!checkLoginStatus()) return;

    try {
      setLoading(true);
      const params = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        sortField: 'applyTime',
        sortOrder: 'desc',
        status: applicationStatusMap.textToNum[statusFilter],
        keyword: searchText.trim() || undefined
      };

      const response = await authApi.getMyApplicationList(params);

      if (response.code !== 0) {
        throw new Error(response.message || '获取申请列表失败');
      }

      const { records, total, current, pageSize } = response.data;
 
      const formattedApplications = records.map(item => ({
        id: item.userId?.toString() || '', 
        publisherId: item.publisherId?.toString() || '',
        requirementId: item.requirementId?.toString() || '',
        requirementTitle: item.requirementTitle || '未知需求',
        status: item.status || 0,
        introduction: item.introduction || '无申请说明',
        publisher: {
          id: item.publisherId?.toString() || '', 
          name: item.publisherName || '未知发布者',
          role: item.publisherRole || 'guest',
          avatar: item.publisherAvatar || ''
        }
      }));

      setApplications(formattedApplications);
      filterApplications(formattedApplications);
      setPagination(prev => ({
        ...prev,
        total,
        current: current || 1,
        pageSize: pageSize || 10
      }));
    } catch (error) {
      console.error('获取我的申请失败:', error);
      message.error(error.message || '网络错误，无法加载申请列表');
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = (apps) => {
    let result = [...apps];
    
    if (statusFilter !== 'all') {
      const statusNum = applicationStatusMap.textToNum[statusFilter];
      result = result.filter(app => app.status === statusNum);
    }
    
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(app => 
        app.requirementTitle.toLowerCase().includes(keyword) ||
        app.publisher.name.toLowerCase().includes(keyword)
      );
    }
    
    setFilteredApplications(result);
  };

  const handleCancelApplication = async (requirementId) => {
    if (!requirementId) {
      message.error('需求ID无效，无法取消申请');
      return;
    }

    try {
      setCancelLoading(requirementId);

      const response = await authApi.cancelApplication({ requirementId: Number(requirementId) });

      if (response.code !== 0) {
        throw new Error(response.message || '取消申请失败');
      }

      message.success('申请已成功取消');
      fetchMyApplications();
    } catch (error) {
      console.error('取消申请失败:', error);
      message.error(error.message || '网络错误，取消申请失败');
    } finally {
      setCancelLoading('');
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    filterApplications(applications);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [statusFilter, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const handleTableChange = (current, pageSize) => {
    setPagination(prev => ({ ...prev, current, pageSize }));
  };

  const handleViewDetail = (requirementId) => {
    if (!requirementId) {
      message.warning('需求ID无效');
      return;
    }
    navigate(`/requirements/${requirementId}`);
  };

  const handleContactPublisher = (publisherId, publisherName) => {
    if (!checkLoginStatus()) return;
    if (!publisherId) {
      message.warning('发布者信息无效，无法发起联系');
      return;
    }
    navigate(`/messages?toUserId=${publisherId}&toUserName=${encodeURIComponent(publisherName)}`);
  };

  const columns = [
    {
      title: '需求标题',
      key: 'requirementTitle',
      dataIndex: 'requirementTitle',
      render: (title, record) => (
        <div style={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => handleViewDetail(record.requirementId)}>
          {title}
        </div>
      ),
      width: 200,
    },
    {
      title: '申请状态',
      key: 'appStatus',
      render: (_, record) => {
        const statusInfo = applicationStatusMap.numToText[record.status] || { color: 'gray', text: '未知状态' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      width: 120,
    },
    {
      title: '发布者',
      key: 'publisher',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar 
            src={record.publisher.avatar || undefined} 
            size="small"
          >
            {!record.publisher.avatar && record.publisher.name.charAt(0)}
          </Avatar>
          <div>
            <div>{record.publisher.name}</div>
            <Tag 
              color={roleColorMap[record.publisher.role]} 
              size="small"
              style={{ marginTop: 2 }}
            >
              {roleMap[record.publisher.role]}
            </Tag>
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: '申请说明',
      key: 'introduction',
      dataIndex: 'introduction',
      render: (introduction) => (
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4 }}>
          {introduction.length > 60 ? `${introduction.slice(0, 60)}...` : introduction}
        </div>
      ),
      width: 250,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.requirementId)}
            size="small"
          >
            查看详情
          </Button>
          <Button 
            icon={<MessageOutlined />} 
            onClick={() => handleContactPublisher(record.publisher.id, record.publisher.name)}
            size="small"
          >
            联系
          </Button>
          <Popconfirm
            title="确认取消申请吗？"
            description="取消后不可恢复，是否继续？"
            onConfirm={() => handleCancelApplication(record.requirementId)}
            okText="是"
            cancelText="否"
            disabled={record.status !== 0}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              loading={cancelLoading === record.requirementId}
              disabled={record.status !== 0}
            >
              取消申请
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 220,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navbar />
      <Content style={{ padding: '24px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>我的申请</h2>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Search
                  placeholder="搜索需求标题/发布者"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  style={{ width: 300 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                />
                
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={handleStatusChange}
                  value={statusFilter}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="pending">待审核</Option>
                  <Option value="accepted">已接受</Option>
                  <Option value="rejected">已拒绝</Option>
                </Select>
              </div>
            </div>
          </Card>

          {loading ? (
            <Card style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spin size="large" tip="正在加载我的申请..." />
            </Card>
          ) : filteredApplications.length === 0 ? (
            <Card style={{ padding: '80px 0', textAlign: 'center' }}>
              <Empty 
                description="暂无符合条件的申请记录" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => {
                  setStatusFilter('all');
                  setSearchText('');
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}>
                  重置筛选
                </Button>
              </Empty>
            </Card>
          ) : (
            <Card>
              <Table
                columns={columns}
                dataSource={filteredApplications}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
                bordered
              />
              
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Pagination 
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger
                  showQuickJumper
                  showTotal={total => `共 ${total} 条申请`}
                  onChange={handleTableChange}
                  onShowSizeChange={(current, size) => handleTableChange(1, size)}
                  size="small"
                />
              </div>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default MyApplicationsPage;
