import React, { useState, useEffect } from 'react';
import {Table,  Button, Modal, message, Tag, Space,Card, Input, Select,  
  Divider,Descriptions,Badge,  Tooltip, Layout} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined, 
  SearchOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const { Search } = Input;
const { Option } = Select;
const { Footer } = Layout;

// 模拟数据（基于成果详情页结构提取关键字段）
const mockData = [
  {
    id: 1,
    title: "基于深度学习的校园垃圾分类系统",
    studentName: "张明",
    category: "科研项目",
    createTime: "2023-10-01 14:30:00",
    status: "pending", // pending, approved, rejected
    rejectReason: "",
    description: "通过CNN实现垃圾图像分类...",
    keywords: ["深度学习", "垃圾分类"]
  },
  {
    id: 2,
    title: "校园二手交易平台开发",
    studentName: "李华",
    category: "软件开发",
    createTime: "2023-10-05 09:15:00",
    status: "approved",
    rejectReason: "",
    description: "基于SpringBoot的校园二手平台...",
    keywords: ["Java", "SpringBoot"]
  },
  {
    id: 3,
    title: "大学生心理健康调研报告",
    studentName: "王芳",
    category: "论文",
    createTime: "2023-10-08 16:45:00",
    status: "rejected",
    rejectReason: "数据样本量不足",
    description: "针对500名大学生的心理状况调研...",
    keywords: ["心理学", "数据分析"]
  },
  // 继续补充类似结构的数据...
].map(item => ({ ...item, key: item.id }));

const AchievementReviewPage = () => {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const navigate = useNavigate();

  // 模拟API获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 过滤逻辑
      let result = [...mockData];
      
      // 状态筛选
      if (params.status && params.status !== 'all') {
        result = result.filter(item => item.status === params.status);
      }
      
      // 搜索筛选
      if (params.search) {
        const lowerSearch = params.search.toLowerCase();
        result = result.filter(item => 
          item.title.toLowerCase().includes(lowerSearch) || 
          item.studentName.toLowerCase().includes(lowerSearch) ||
          item.keywords.some(kw => kw.toLowerCase().includes(lowerSearch))
        );
      }
      
      // 分页处理
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const pageData = result.slice(start, end);
      
      setData(pageData);
      setFilteredData(result);
      setPagination({
        ...pagination,
        total: result.length,
      });
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // 1. 同步加载用户数据
  const role = localStorage.getItem('user_role') || 'visitor';
  const username = localStorage.getItem('username') || '访客';
  const avatar = `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200`; 
  setCurrentUser({ role, username, avatar });

  // 2. 异步加载审核数据
  const loadData = async () => {
    setLoading(true);
    try {
      const filtered = mockData.filter(item => {
        const matchesStatus = filterStatus ? item.status === filterStatus : true;
        const matchesSearch = searchText 
          ? item.title.includes(searchText) || item.studentName.includes(searchText)
          : true;
        return matchesStatus && matchesSearch;
      });

      setData(filtered);
      setPagination(prev => ({
        ...prev,
        total: filtered.length
      }));
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [pagination.current, filterStatus, searchText]);

  // 处理分页变化
  const handleTableChange = (pag) => {
    setPagination(pag);
  };

  // 审核通过
  const handleApprove = async (id) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 更新状态
      const updatedData = mockData.map(item => 
        item.id === id ? { ...item, status: 'approved' } : item
      );
      mockData.splice(0, mockData.length, ...updatedData);
      
      message.success('审核通过');
      fetchData({ status: filterStatus, search: searchText });
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 审核驳回
  const handleReject = async () => {
    if (!rejectReason) {
      message.warning('请填写驳回理由');
      return;
    }
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 更新状态
      const updatedData = mockData.map(item => 
        item.id === selectedItem.id ? { 
          ...item, 
          status: 'rejected',
          rejectReason 
        } : item
      );
      mockData.splice(0, mockData.length, ...updatedData);
      
      message.success('已驳回该成果');
      setReviewModalVisible(false);
      setRejectReason('');
      fetchData({ status: filterStatus, search: searchText });
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 查看成果详情
  const viewDetail = (item) => {
    navigate(`/achievement/detail/${item.id}`);
  };

  // 状态标签渲染
  const statusTag = (status, reason) => {
    switch(status) {
      case 'approved':
        return <Tag color="success">已通过</Tag>;
      case 'rejected':
        return (
          <Tooltip title={`驳回原因: ${reason}`}>
            <Tag color="error">已驳回</Tag>
          </Tooltip>
        );
      default:
        return <Tag color="processing">待审核</Tag>;
    }
  };

  const columns = [
    {
      title: '成果标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/achievement/detail`)}>
          {text}
        </a>
      ),
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '成果类型',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => statusTag(status, record.rejectReason),
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedItem(record);
                  setReviewModalVisible(true);
                }}
              >
                驳回
              </Button>
            </>
          )}
          <Button
            icon={<EyeOutlined />}
            onClick={() => viewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
    <Navbar currentUser={currentUser}/>
    <Card 
      title={
        <Space>
          <span>成果审核</span>
          <Badge 
            count={filteredData.filter(d => d.status === 'pending').length} 
            style={{ backgroundColor: '#1890ff' }} 
          />
        </Space>
      }
      bordered={false}
      extra={
        <Space>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 120 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">全部状态</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已驳回</Option>
          </Select>
          <Search
            placeholder="搜索成果/学生/关键词"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={(value) => setSearchText(value)}
          />
        </Space>
      }
    >
      <Table
        columns={columns}
        rowKey="id"
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />
      
      {/* 驳回理由弹窗 */}
      <Modal
        title="驳回理由"
        visible={reviewModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setReviewModalVisible(false);
          setRejectReason('');
        }}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="成果标题">{selectedItem?.title}</Descriptions.Item>
          <Descriptions.Item label="提交学生">{selectedItem?.studentName}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <p style={{ marginBottom: 8 }}>请填写驳回理由：</p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请详细说明驳回原因（至少20字）"
          showCount
          maxLength={200}
        />
      </Modal>
    </Card>
    <Footer style={{ textAlign: 'center' }}>
            学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
          </Footer>
    </Layout>
  );
};

export default AchievementReviewPage;