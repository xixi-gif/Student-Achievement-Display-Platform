import React, { useState, useEffect } from 'react';
import { Layout, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker, message, Card, Tabs, Badge, Divider, Skeleton, Tooltip, Rate, Empty, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined, SearchOutlined, FilterOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileImageOutlined, FileTextOutlined, VideoCameraOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar';
import { achievementApi, adminApi } from '../../service/api'; // 接口导入路径

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// 级别映射
const levels = [
  { value: '校级', label: '校级' },
  { value: '市级', label: '市级' },
  { value: '省级', label: '省级' },
  { value: '国家级', label: '国家级' },
  { value: '国际级', label: '国际级' }
];

// 状态映射（与后端保持一致：0草稿 1待审核 2已发布 3驳回 4老师已审核）
const statusMap = {
  "draft": { text: '草稿', color: 'gray', icon: <ClockCircleOutlined /> },
  "pending": { text: '审核中', color: 'gold', icon: <ClockCircleOutlined /> },
  "published": { text: '已发布', color: 'green', icon: <CheckCircleOutlined /> },
  "rejected": { text: '未通过', color: 'red', icon: <CloseCircleOutlined /> },
  "approved": { text: '老师已审核', color: 'blue', icon: <CheckCircleOutlined /> }
};

// 前端标签页 => 后端状态值映射
const tabStatusMap = {
  published: "published",  
  pending: "pending",
  draft: "draft",
  rejected: "rejected",
  approved: "approved"
};

// 定义等级选项
const recommendOptions = [
  { value: 0, label: '无' },
  { value: 1, label: '⭐ 不错' },
  { value: 2, label: '⭐⭐ 良好' },
  { value: 3, label: '⭐⭐⭐ 优秀' },
  { value: 4, label: '⭐⭐⭐⭐ 重点' },
  { value: 5, label: '⭐⭐⭐⭐⭐ 强烈' }
];



const MyAchievements = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // 获取我的成果列表
  const fetchMyAchievements = async () => {
    try {
      setLoading(true);
      // 对接后端 /achievement/my/achievements 接口
      const response = await achievementApi.getMyAchievements();
      // 转换接口返回数据格式以适配前端
      const formattedData = response.data.map(item => ({
        ...item,
        date: item.date || null,
        createTime: item.createTime ? moment(item.createTime) : null,
        updateTime: item.updateTime ? moment(item.updateTime) : null
      }));
      setAchievements(formattedData);
    } catch (error) {
      console.error('获取成果列表失败:', error);
      message.error(error.message || '获取成果列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类数据
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await adminApi.getCategoryList(); 
      if (response.code === 0) {
        // 后端分类字段为id和name，映射为前端需要的value和label
        setCategories(
          response.data.map((item) => ({
            value: item.name, // 与后端返回的category名称匹配
            label: item.name
          }))
        );
      }
    } catch (error) {
      console.error("获取分类失败:", error);
      message.error("获取分类数据失败");
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  // 初始化时获取数据
  useEffect(() => {
    // 获取当前用户信息
    const role = localStorage.getItem('user_role') || 'student';
    const username = localStorage.getItem('username') || '学生';
    setCurrentUser({ role, username, realName: username });
    
    // 获取分类数据
    fetchCategories();
    // 获取成果列表
    fetchMyAchievements();
  }, []);
  
  // 筛选逻辑
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          (achievement.participants && achievement.participants.some(p => 
                            p.toLowerCase().includes(searchText.toLowerCase())
                          ));
    const matchesType = !filterType || achievement.category === filterType;  // 按分类名称筛选
    const matchesLevel = !filterLevel || achievement.level === filterLevel;  // 按级别值筛选
    const matchesDate = !dateRange || (
      achievement.date && 
      achievement.date.isSameOrAfter(dateRange[0]) && 
      achievement.date.isSameOrBefore(dateRange[1])
    );
    
    // 标签页与后端状态匹配（数字状态）
    let matchesTab = true;
    if (currentTab !== 'all') {
      matchesTab = achievement.status === tabStatusMap[currentTab];
    }
    
    return matchesSearch && matchesType && matchesLevel && matchesDate && matchesTab;
  });
  
  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (text, record) => (
        <span style={{ fontWeight: 500 }} onClick={() => handleViewDetail(record)}>
          {text}
        </span>
      )
    },
    {
      title: '分类',
      dataIndex: 'category', 
      key: 'category',
      filters: categories.map(cat => ({
        text: cat.label,
        value: cat.value
      })),
      onFilter: (value, record) => record.category === value,
      render: category => (
        <Tag color="blue">{category}</Tag> // 显示后端返回的分类名称
      )
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      filters: levels.map(level => ({
        text: level.label,
        value: level.value
      })),
      onFilter: (value, record) => record.level === value,
      render: level => (
        <Tag color="cyan">
          {levels.find(l => l.value === level)?.label || level}
        </Tag>
      )
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date - b.date,
      render: date => date || '未知'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const statusInfo = statusMap[status] || { text: status, color: 'gray' };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
        );
      }
    },
    {
      title: '推荐等级',
      dataIndex: 'recommendLevel',
      key: 'recommendLevel',
      render: level => {
        // 处理null和undefined情况
      if (level == null) return '无';
       // 确保数字比较（后端可能返回字符串类型数字）
       const numLevel = Number(level);
       const option = recommendOptions.find(opt => opt.value === numLevel);
       return option ? option.label : `等级 ${numLevel}`;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="编辑成果">
            <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/student/achievements/edit?id=${record.id}`)} />
          </Tooltip>
          {record.status !== 1 && ( // 审核中（状态1）不可删除
            <Popconfirm
              title="确定要删除此成果吗?"
              onConfirm={() => handleDelete(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];
  
  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedAchievement(record);
    setIsDetailVisible(true);
  };
  
  // 删除成果
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // 对接后端 /achievement/delete 接口（POST请求，参数为{id}）
      await achievementApi.deleteAchievement(id); 
      message.success('成果删除成功');
      fetchMyAchievements(); // 重新获取列表
    } catch (error) {
      console.error('删除成果失败:', error);
      message.error(error.message || '删除成果失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 添加成果
  const handleAddAchievement = () => {
    navigate('/student/achievement/create');
  };
  
  // 重置筛选条件
  const handleResetFilters = () => {
    setSearchText('');
    setFilterType(null);
    setFilterLevel(null);
    setDateRange(null);
  };
  
  // 搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
  // 切换标签页
  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  return (
    <Layout>
      <Navbar />
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px - 64px)' }}>
        <Card title="我的成果" bordered={false} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>成果管理</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAchievement}>
              添加成果
            </Button>
          </div>
          
          <div style={{ background: '#fafafa', padding: '16px', borderRadius: 8, marginBottom: 24 }}>
            <Form layout="inline" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <Form.Item label="搜索">
                <Input.Search
                  placeholder="搜索成果标题或参与者"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  suffix={<SearchOutlined />}
                  style={{ width: 240 }}
                />
              </Form.Item>
              
              <Form.Item label="分类">
                <Select
                  placeholder="选择成果分类"
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: 160 }}
                  loading={categoriesLoading}
                >
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="级别">
                <Select
                  placeholder="选择成果级别"
                  value={filterLevel}
                  onChange={setFilterLevel}
                  style={{ width: 160 }}
                >
                  {levels.map(level => (
                    <Option key={level.value} value={level.value}>{level.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="日期范围">
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: 240 }}
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<FilterOutlined />}>
                    筛选
                  </Button>
                  <Button onClick={handleResetFilters}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
          
          <Tabs activeKey={currentTab} onChange={handleTabChange} style={{ marginBottom: 24 }}>
            <TabPane 
              tab={
                <Badge count={achievements.length}>
                  <span>全部</span>
                </Badge>
              } 
              key="all"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === "published").length}>
                  <span>已发布</span>
                </Badge>
              } 
              key="published"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === "pending").length}>
                  <span>审核中</span>
                </Badge>
              } 
              key="pending"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === "rejected").length}>
                  <span>未通过</span>
                </Badge>
              } 
              key="rejected"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === "approved").length}>
                  <span>老师已审核</span>
                </Badge>
              } 
              key="approved"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === "draft").length}>
                  <span>草稿</span>
                </Badge>
              } 
              key="draft"
            />
          </Tabs>
          
          {loading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : filteredAchievements.length > 0 ? (
            <Table 
              columns={columns} 
              dataSource={filteredAchievements} 
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30', '50']
              }}
            />
          ) : (
            <Empty 
              description="暂无成果记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAchievement}>
                添加第一个成果
              </Button>
            </Empty>
          )}
        </Card>
        
        {/* 详情弹窗 */}
        <Modal
          title="成果详情"
          visible={isDetailVisible}
          onCancel={() => setIsDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          {selectedAchievement && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{selectedAchievement.title}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <Tag color="blue">{selectedAchievement.category}</Tag>
                  <Tag color="cyan">{levels.find(l => l.value === selectedAchievement.level)?.label || selectedAchievement.level}</Tag>
                  <Tag color={statusMap[selectedAchievement.status]?.color || 'gray'}>
                    {statusMap[selectedAchievement.status]?.text || selectedAchievement.status}
                  </Tag>
                  <span><CalendarOutlined /> {selectedAchievement.date || '未知日期'}</span>
                </div>
                {selectedAchievement.recommendLevel !== undefined && selectedAchievement.recommendLevel !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ marginRight: 8 }}>推荐等级:</span>
                    <Rate value={Number(selectedAchievement.recommendLevel)} disabled />
                  </div>
                )}
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>成果描述</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedAchievement.description || '无描述信息'}</p>
              </div>
              
              <Divider />
              
              {selectedAchievement.participants && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>参与者</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedAchievement.participants.map((participant, index) => (
                      <Tag key={index}>{participant}</Tag>
                    ))}
                  </div>
                </div>
              )}
              
              <Divider />
              
              {selectedAchievement.instructor && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>指导老师</h4>
                  <Tag>{selectedAchievement.instructor}</Tag>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default MyAchievements;