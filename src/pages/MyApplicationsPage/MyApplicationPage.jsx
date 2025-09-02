import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Table, Avatar, Tag, Button, Space, 
  Input, Select, Spin, message, Empty, Pagination
} from 'antd';
import { 
  MessageOutlined, SearchOutlined, EyeOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

// 状态映射配置
const applicationStatusMap = {
  all: { color: 'gray', text: '全部' },
  pending: { color: 'orange', text: '待审核' },
  accepted: { color: 'green', text: '已接受' },
  rejected: { color: 'red', text: '已拒绝' }
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

// 静态模拟申请数据
const staticApplications = [
  {
    id: 'extra-1',
    requirementId: 'req-1001',
    requirementTitle: '校园活动海报设计',
    requirementType: '设计',
    requirementStatus: 'pending',
    publisher: {
      id: 'pub-201',
      name: '李老师',
      role: 'teacher'
    },
    applyTime: '2024-04-20T10:30:00.000Z',
    status: 'pending',
    introduction: '有3年海报设计经验，熟悉PS、AI工具，可快速交付符合校园风格的设计方案',
    budget: '500元',
    deadline: '2024-04-30T23:59:59.000Z'
  },
  {
    id: 'extra-2',
    requirementId: 'req-1002',
    requirementTitle: 'Python课程作业辅导',
    requirementType: '教育',
    requirementStatus: 'in_progress',
    publisher: {
      id: 'pub-202',
      name: '张明',
      role: 'student'
    },
    applyTime: '2024-04-18T15:45:00.000Z',
    status: 'accepted',
    introduction: '计算机专业大三学生，Python成绩优异，可辅导基础语法和简单项目开发',
    budget: '300元',
    deadline: '2024-04-25T23:59:59.000Z'
  },
  {
    id: 'static-3',
    requirementId: 'req-1003',
    requirementTitle: '毕业答辩PPT制作',
    requirementType: '文案/PPT',
    requirementStatus: 'pending',
    publisher: {
      id: 'pub-203',
      name: '王同学',
      role: 'student'
    },
    applyTime: '2024-04-22T09:15:00.000Z',
    status: 'pending',
    introduction: '擅长学术PPT排版设计，熟悉毕业答辩逻辑框架，可提供内容优化建议',
    budget: '400元',
    deadline: '2024-05-10T23:59:59.000Z'
  },
  {
    id: 'static-4',
    requirementId: 'req-1004',
    requirementTitle: '实验室设备维护',
    requirementType: '技术支持',
    requirementStatus: 'completed',
    publisher: {
      id: 'pub-204',
      name: '刘教授',
      role: 'teacher'
    },
    applyTime: '2024-04-10T14:20:00.000Z',
    status: 'accepted',
    introduction: '电子信息专业研究生，有2年实验室设备维护经验，可处理常规故障排查',
    budget: '800元',
    deadline: '2024-04-15T23:59:59.000Z'
  },
  {
    id: 'static-5',
    requirementId: 'req-1005',
    requirementTitle: '校园志愿者招募文案',
    requirementType: '文案撰写',
    requirementStatus: 'pending',
    publisher: {
      id: 'pub-205',
      name: '校学生会',
      role: 'admin'
    },
    applyTime: '2024-04-25T11:00:00.000Z',
    status: 'rejected',
    introduction: '汉语言文学专业大二学生，有多次校园活动文案撰写经验，可快速产出符合要求的招募文案',
    budget: '200元',
    deadline: '2024-04-30T23:59:59.000Z'
  }
];

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: staticApplications.length
  });

  // 检查登录状态
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    return true;
  };

  // 加载静态数据
  const loadStaticApplications = () => {
    if (!checkLoginStatus()) return;

    setTimeout(() => {
      setApplications(staticApplications);
      setFilteredApplications(staticApplications);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadStaticApplications();
  }, []);

  // 搜索+状态筛选逻辑
  useEffect(() => {
    let result = [...applications];
    
    // 状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    // 文本搜索
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase().trim();
      result = result.filter(app => 
        app.requirementTitle.toLowerCase().includes(keyword) ||
        app.requirementType.toLowerCase().includes(keyword) ||
        app.publisher.name.toLowerCase().includes(keyword)
      );
    }
    
    setFilteredApplications(result);
    setPagination(prev => ({ ...prev, total: result.length, current: 1 }));
  }, [applications, statusFilter, searchText]);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // 处理状态筛选变化
  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  // 处理分页变化
  const handleTableChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  // 查看需求详情
  const handleViewDetail = (id) => {
    message.info(`跳转至需求详情页：${id}`);
    // navigate(`/requirements/${id}`);
  };

  // 联系发布者
  const handleContactPublisher = (publisherId, publisherName) => {
    message.info(`跳转至与 ${publisherName} 的聊天界面`);
    // navigate(`/messages?toUserId=${publisherId}&toUserName=${encodeURIComponent(publisherName)}`);
  };

  // 表格列配置（已移除取消申请功能）
  const columns = [
    {
      title: '需求标题',
      key: 'requirementTitle',
      dataIndex: 'requirementTitle',
      render: (title) => <div style={{ fontWeight: 500 }}>{title}</div>,
      width: 200,
    },
    {
      title: '申请状态',
      key: 'appStatus',
      render: (_, record) => (
        <Tag color={applicationStatusMap[record.status].color}>
          {applicationStatusMap[record.status].text}
        </Tag>
      ),
      width: 120,
    },
    {
      title: '发布者',
      key: 'publisher',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar 
            src={`https://picsum.photos/200/200?random=${record.publisher.id}`} 
            size="small"
          />
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
          {/* 仅保留详情和联系按钮，移除取消申请按钮 */}
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.requirementId)}
            size="small"
          >
            详情
          </Button>
          <Button 
            icon={<MessageOutlined />} 
            onClick={() => handleContactPublisher(record.publisher.id, record.publisher.name)}
            size="small"
          >
            联系
          </Button>
        </Space>
      ),
      width: 140, // 调整操作列宽度以适应剩余按钮
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navbar />
      <Content style={{ padding: '24px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* 筛选和搜索区域 */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>我的申请</h2>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Search
                  placeholder="搜索需求标题/类型/发布者"
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

          {/* 表格区域 */}
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
              
              {/* 外部分页组件 */}
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