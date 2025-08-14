import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Button, Table, Tag, Space, Input, 
  Select, Checkbox, Popconfirm, message, Modal, 
  Spin, Divider, Tooltip, Badge, Dropdown, Menu 
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, EyeOutlined, CheckCircleOutlined,
  FilterOutlined, MoreOutlined, SyncOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
// import { achievementApi } from '../../service/achievementApi'; // 假设的API服务

const { Content, Footer } = Layout;
const { Option } = Select;
const { Search } = Input;

// 模拟成果数据 - 8条测试数据
const mockAchievements = [
  {
    id: 'ach001',
    title: '基于机器学习的图像识别算法研究',
    studentName: '张明',
    category: 'thesis',
    status: 'teacher_approved',
    createTime: '2023-10-15 09:20:30',
    description: '使用深度学习模型实现图像分类，准确率达到92%',
    keywords: ['机器学习', '图像识别', '深度学习']
  },
  {
    id: 'ach002',
    title: '大学生创业计划竞赛金奖项目',
    studentName: '李华',
    category: 'competition',
    status: 'teacher_approved',
    createTime: '2023-10-12 14:30:15',
    description: '基于校园服务的O2O平台创业计划',
    keywords: ['创业', '竞赛', 'O2O']
  },
  {
    id: 'ach003',
    title: '校园图书管理系统设计与实现',
    studentName: '王强',
    category: 'project',
    status: 'published',
    createTime: '2023-10-08 16:45:20',
    description: '基于SpringBoot和Vue的图书管理系统',
    keywords: ['项目', '图书管理', 'SpringBoot']
  },
  {
    id: 'ach004',
    title: '数据结构课程设计报告',
    studentName: '刘芳',
    category: 'coursework',
    status: 'teacher_approved',
    createTime: '2023-10-05 10:10:05',
    description: '二叉树算法优化与实现',
    keywords: ['课程作业', '数据结构', '二叉树']
  },
  {
    id: 'ach005',
    title: '人工智能在教育中的应用研究',
    studentName: '赵伟',
    category: 'thesis',
    status: 'pending',
    createTime: '2023-10-01 08:50:40',
    description: '分析AI技术在智能教学中的实践案例',
    keywords: ['人工智能', '教育', '研究']
  },
  {
    id: 'ach006',
    title: '全国大学生数学建模竞赛二等奖',
    studentName: '孙丽',
    category: 'competition',
    status: 'published',
    createTime: '2023-09-28 15:20:10',
    description: '关于城市交通流量预测的建模与分析',
    keywords: ['数学建模', '竞赛', '交通预测']
  },
  {
    id: 'ach007',
    title: 'Web前端框架比较研究',
    studentName: '周杰',
    category: 'thesis',
    status: 'rejected',
    createTime: '2023-09-25 11:30:50',
    description: '对比React、Vue和Angular的性能差异',
    keywords: ['Web前端', '框架', '比较研究'],
    rejectReason: '内容深度不足，缺乏实际测试数据'
  },
  {
    id: 'ach008',
    title: '操作系统课程设计 - 进程调度算法模拟',
    studentName: '吴敏',
    category: 'coursework',
    status: 'teacher_approved',
    createTime: '2023-09-20 13:45:30',
    description: '模拟实现多种进程调度算法并进行性能对比',
    keywords: ['操作系统', '课程作业', '进程调度']
  }
];

// 状态映射
const statusMap = {
  pending: { text: '待教师审核', color: 'orange' },
  teacher_approved: { text: '待管理员发布', color: 'blue' },
  published: { text: '已发布', color: 'green' },
  rejected: { text: '已驳回', color: 'red' }
};

// 成果分类
const categories = [
  { value: 'project', label: '项目' },
  { value: 'competition', label: '竞赛' },
  { value: 'thesis', label: '论文' },
  { value: 'coursework', label: '课程作业' }
];

const AchievementManage = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 用于批量操作
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('teacher_approved'); // 默认显示待发布
  const [filterCategory, setFilterCategory] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // 获取用户信息和成果数据
  useEffect(() => {
    // 获取当前用户信息
    const role = localStorage.getItem('user_role') || 'admin';
    const username = localStorage.getItem('username') || '管理员';
    setCurrentUser({ role, username });

    // 加载成果数据
    fetchAchievements();
  }, [pagination.current, pagination.pageSize, filterStatus, filterCategory, searchText]);

  // 获取成果列表，使用模拟数据
    const fetchAchievements = async () => {
  setLoading(true);
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟筛选逻辑
    let result = [...mockAchievements];
    
    // 状态筛选
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    
    // 分类筛选
    if (filterCategory) {
      result = result.filter(item => item.category === filterCategory);
    }
    
    // 搜索筛选
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.studentName.toLowerCase().includes(lowerSearch)
      );
    }
    
    // 分页处理
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const pageData = result.slice(start, end);
    
    setAchievements(pageData);
    setPagination({
      ...pagination,
      total: result.length
    });
  } catch (error) {
    message.error('加载成果数据失败');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  // 表格选择逻辑
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 批量发布 - 模拟实现
  const handleBatchPublish = async () => {
  if (selectedRowKeys.length === 0) {
    message.warning('请选择要发布的成果');
    return;
  }
  
  setLoading(true);
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟更新状态
    for (let i = 0; i < mockAchievements.length; i++) {
      if (selectedRowKeys.includes(mockAchievements[i].id)) {
        mockAchievements[i] = { ...mockAchievements[i], status: 'published' };
      }
    }
    
    message.success(`成功发布 ${selectedRowKeys.length} 个成果`);
    fetchAchievements();
    setSelectedRowKeys([]);
  } catch (error) {
    message.error('批量发布失败');
  } finally {
    setLoading(false);
  }
  };

// 单个发布 - 模拟实现
const handlePublish = async (id) => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 找到并更新状态
    const index = mockAchievements.findIndex(item => item.id === id);
    if (index !== -1) {
      mockAchievements[index] = { ...mockAchievements[index], status: 'published' };
    }
    
    message.success('成果发布成功');
    fetchAchievements();
  } catch (error) {
    message.error('发布失败');
  } finally {
    setLoading(false);
  }
};

// 批量删除 - 模拟实现
const handleBatchDelete = async () => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 过滤掉选中的项
    const newAchievements = mockAchievements.filter(
      item => !selectedRowKeys.includes(item.id)
    );
    
    // 更新模拟数据
    mockAchievements.splice(0, mockAchievements.length, ...newAchievements);
    
    message.success(`成功删除 ${selectedRowKeys.length} 个成果`);
    setDeleteModalVisible(false);
    fetchAchievements();
    setSelectedRowKeys([]);
  } catch (error) {
    message.error('批量删除失败');
  } finally {
    setLoading(false);
  }
};

// 单个删除 - 模拟实现
const handleDelete = async (id) => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 过滤掉要删除的项
    const newAchievements = mockAchievements.filter(item => item.id !== id);
    mockAchievements.splice(0, mockAchievements.length, ...newAchievements);
    
    message.success('成果删除成功');
    fetchAchievements();
  } catch (error) {
    message.error('删除失败');
  } finally {
    setLoading(false);
  }
};
  // 批量删除确认
  const showBatchDeleteConfirm = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的成果');
      return;
    }
    
    const itemsToDelete = achievements.filter(item => 
      selectedRowKeys.includes(item.id)
    );
    setSelectedItems(itemsToDelete);
    setDeleteModalVisible(true);
  };

  // 重置筛选条件
  const resetFilters = () => {
    setSearchText('');
    setFilterStatus('teacher_approved');
    setFilterCategory('');
    setPagination({...pagination, current: 1});
  };

  // 全选处理
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowKeys(achievements.map(item => item.id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  // 单选处理
  const handleSelectOne = (e, id) => {
    const selected = [...selectedRowKeys];
    if (e.target.checked) {
      selected.push(id);
    } else {
      const index = selected.indexOf(id);
      selected.splice(index, 1);
    }
    setSelectedRowKeys(selected);
   };


  // 表格列定义
  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length === achievements.length && achievements.length > 0}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < achievements.length}
          onChange={handleSelectAll}
        />
      ),
      key: 'selection',
      width: 40,
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => handleSelectOne(e, record.id)}
        />
      )
    },
    {
      title: '成果标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => navigate(`/achievement/detail`)}>
          {text}
        </a>
      )
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({
        text: cat.label,
        value: cat.value
      })),
      onFilter: (value) => setFilterCategory(value),
      render: (category) => {
        const cat = categories.find(c => c.value === category);
        return <Tag color="blue">{cat ? cat.label : category}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const info = statusMap[status] || { text: status, color: 'gray' };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
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
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/achievement/detail`)}
            />
          </Tooltip>
          
          <Tooltip title="编辑成果">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/student/achievements/edit`)}
            />
          </Tooltip>
          
          {record.status === 'teacher_approved' && (
            <Tooltip title="发布">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handlePublish(record.id)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="确定要删除此成果吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Layout className="layout">
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: '0 50px', marginTop: 20 }}>
        <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          <Card 
            title={
              <Space>
                <span>成果管理</span>
                <Badge 
                  count={achievements.filter(a => a.status === 'teacher_approved').length} 
                  style={{ backgroundColor: '#1890ff' }} 
                />
              </Space>
            }
            bordered={false}
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/student/achievement/create')}
              >
                添加成果
              </Button>
            }
          >
            {/* 筛选和搜索区域 */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size="middle">
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 180 }}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="pending">待教师审核</Option>
                  <Option value="teacher_approved">待管理员发布</Option>
                  <Option value="published">已发布</Option>
                  <Option value="rejected">已驳回</Option>
                </Select>
                
                <Select
                  value={filterCategory}
                  onChange={setFilterCategory}
                  style={{ width: 150 }}
                  placeholder="成果分类"
                >
                  <Option value="">全部分类</Option>
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
                
                <Button 
                  onClick={resetFilters} 
                  icon={<SyncOutlined spin={false} />}
                >
                  重置
                </Button>
              </Space>
              
              <Search
                placeholder="搜索成果标题或学生姓名"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={fetchAchievements}
              />
            </div>
            
            {/* 批量操作区域 */}
            {selectedRowKeys.length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                <Button 
                  type="primary" 
                  onClick={handleBatchPublish}
                  icon={<CheckCircleOutlined />}
                >
                  批量发布 ({selectedRowKeys.length})
                </Button>
                <Button 
                  danger 
                  onClick={showBatchDeleteConfirm}
                  icon={<DeleteOutlined />}
                >
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </div>
            )}
            
            {/* 成果表格 */}
            <Table
              columns={columns}
              dataSource={achievements}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={(newPagination) => setPagination(newPagination)}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
      
      {/* 批量删除确认弹窗 */}
      <Modal
        title="批量删除确认"
        visible={deleteModalVisible}
        onOk={handleBatchDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>您确定要删除以下 {selectedItems.length} 个成果吗？</p>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 10 }}>
          {selectedItems.map(item => (
            <div key={item.id} style={{ padding: 4 }}>
              - {item.title}
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

export default AchievementManage;