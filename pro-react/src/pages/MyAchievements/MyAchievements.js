import React, { useState, useEffect } from 'react';
import { Layout, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker, Upload, message, Card, Tabs, Badge, Divider, Skeleton, Tooltip, Rate, Empty, Popconfirm, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined, SearchOutlined, FilterOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileImageOutlined, FileTextOutlined, VideoCameraOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const categories = [
  { value: 'thesis', label: '毕业论文' },
  { value: 'project', label: '一级项目' },
  { value: 'competition', label: '竞赛作品' },
  { value: 'patent', label: '技术专利' },
  { value: 'paper', label: '期刊论文' },
  { value: 'coursework', label: '课程作业' }
];

const levels = [
  { value: 'school', label: '校级' },
  { value: 'city', label: '市级' },
  { value: 'province', label: '省级' },
  { value: 'national', label: '国家级' },
  { value: 'international', label: '国际级' }
];

const statusMap = {
  approved: { text: '已通过', color: 'green', icon: <CheckCircleOutlined /> },
  pending: { text: '审核中', color: 'gold', icon: <ClockCircleOutlined /> },
  rejected: { text: '未通过', color: 'red', icon: <CloseCircleOutlined /> }
};

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
  
  useEffect(() => {
    setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'student';
      const username = localStorage.getItem('username') || '学生用户';
      setCurrentUser({ role, username, realName: username });
      
      const mockData = [
        {
          id: uuidv4(),
          title: "校园智能导航APP设计与实现",
          category: "project",
          level: "school",
          status: "approved",
          date: moment("2025-03-15"),
          score: 95,
          participants: ["张三", "李四", "王五"],
          instructor: "陈老师",
          keywords: "校园导航, React Native, 路径规划",
          price: "99.99",
          description: "基于React Native开发的校园导航应用，支持POI搜索、路径规划和校园活动推荐功能，解决了校园内建筑物复杂、导航困难的问题。应用采用了离线地图技术，在没有网络的情况下也能正常使用。",
          attachments: [
            { name: "项目报告.pdf", url: "#" },
            { name: "源代码.zip", url: "#" }
          ],
          images: [
            "https://picsum.photos/seed/app1/400/300",
            "https://picsum.photos/seed/app2/400/300"
          ],
          videos: [
            { name: "演示视频.mp4", url: "#" }
          ],
          createdAt: moment("2025-03-10")
        },
        {
          id: uuidv4(),
          title: "2025年数学建模竞赛作品",
          category: "competition",
          level: "national",
          status: "approved",
          date: moment("2025-05-20"),
          score: 90,
          participants: ["张三", "赵六"],
          instructor: "李老师",
          keywords: "数学建模, 交通优化, 机器学习",
          price: "199.00",
          description: "本次数学建模竞赛中，我们团队针对城市交通优化问题进行了深入研究，提出了一种基于机器学习的交通流量预测模型，最终获得了一等奖。",
          attachments: [
            { name: "论文.pdf", url: "#" },
            { name: "演示文稿.pptx", url: "#" }
          ],
          images: [
            "https://picsum.photos/seed/math1/400/300",
            "https://picsum.photos/seed/math2/400/300"
          ],
          createdAt: moment("2025-05-15")
        },
        {
          id: uuidv4(),
          title: "基于深度学习的图像识别系统",
          category: "project",
          level: "province",
          status: "pending",
          date: moment("2025-06-20"),
          score: null,
          participants: ["张三"],
          instructor: "王老师",
          keywords: "深度学习, 图像识别, 卷积神经网络",
          price: "面议",
          description: "本项目设计并实现了一个基于深度学习的图像识别系统，能够准确识别多种植物种类，具有较高的准确率和鲁棒性。",
          attachments: [
            { name: "项目报告.docx", url: "#" },
            { name: "代码.zip", url: "#" }
          ],
          images: [
            "https://picsum.photos/seed/dl1/400/300",
            "https://picsum.photos/seed/dl2/400/300"
          ],
          videos: [
            { name: "演示视频.mp4", url: "#" }
          ],
          createdAt: moment("2025-06-15")
        },
        {
          id: uuidv4(),
          title: "校园环保志愿者活动",
          category: "coursework",
          level: "city",
          status: "rejected",
          date: moment("2025-04-10"),
          score: 85,
          participants: ["张三"],
          instructor: "",
          keywords: "环保, 志愿者, 校园活动",
          price: "免费",
          description: "组织并参与了校园环保志愿者活动，通过宣传和实践，提高了同学们的环保意识，活动得到了学校和社会的广泛好评。",
          attachments: [
            { name: "活动总结.docx", url: "#" }
          ],
          images: [
            "https://picsum.photos/seed/volunteer1/400/300"
          ],
          createdAt: moment("2025-04-05")
        }
      ];
      
      setAchievements(mockData);
      setLoading(false);
    }, 800);
  }, []);
  
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          (achievement.participants && achievement.participants.some(p => 
                            p.toLowerCase().includes(searchText.toLowerCase())
                          ));
    const matchesType = !filterType || achievement.category === filterType;
    const matchesLevel = !filterLevel || achievement.level === filterLevel;
    const matchesDate = !dateRange || (
      achievement.date.isSameOrAfter(dateRange[0]) && 
      achievement.date.isSameOrBefore(dateRange[1])
    );
    
    let matchesTab = true;
    if (currentTab === 'approved') matchesTab = achievement.status === 'approved';
    if (currentTab === 'pending') matchesTab = achievement.status === 'pending';
    if (currentTab === 'rejected') matchesTab = achievement.status === 'rejected';
    
    return matchesSearch && matchesType && matchesLevel && matchesDate && matchesTab;
  });
  
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
        <Tag color="blue">
          {categories.find(c => c.value === category)?.label || category}
        </Tag>
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
      render: date => date?.format('YYYY-MM-DD') || '未知'
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
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: score => score ? <Rate value={score / 20} disabled /> : '-'
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
            <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/student/achievements/edit`)} />
          </Tooltip>
          {record.status !== 'pending' && (
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
  
  const handleViewDetail = (record) => {
    setSelectedAchievement(record);
    setIsDetailVisible(true);
  };
  
  const handleDelete = (id) => {
    setLoading(true);
    setTimeout(() => {
      setAchievements(achievements.filter(achievement => achievement.id !== id));
      setLoading(false);
      message.success('成果删除成功');
    }, 500);
  };
  
  const handleAddAchievement = () => {
    navigate('/student/achievement/create');
  };
  
  const handleResetFilters = () => {
    setSearchText('');
    setFilterType(null);
    setFilterLevel(null);
    setDateRange(null);
  };
  
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
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
                <Badge count={achievements.filter(a => a.status === 'approved').length}>
                  <span>已通过</span>
                </Badge>
              } 
              key="approved"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === 'pending').length}>
                  <span>审核中</span>
                </Badge>
              } 
              key="pending"
            />
            <TabPane 
              tab={
                <Badge count={achievements.filter(a => a.status === 'rejected').length}>
                  <span>未通过</span>
                </Badge>
              } 
              key="rejected"
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
                  <Tag color="blue">{categories.find(c => c.value === selectedAchievement.category)?.label || selectedAchievement.category}</Tag>
                  <Tag color="cyan">{levels.find(l => l.value === selectedAchievement.level)?.label || selectedAchievement.level}</Tag>
                  <Tag color={statusMap[selectedAchievement.status]?.color || 'gray'}>
                    {statusMap[selectedAchievement.status]?.text || selectedAchievement.status}
                  </Tag>
                  <span><CalendarOutlined /> {selectedAchievement.date?.format('YYYY-MM-DD') || '未知日期'}</span>
                </div>
                {selectedAchievement.score && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ marginRight: 8 }}>评分:</span>
                    <Rate value={selectedAchievement.score / 20} disabled />
                    <span style={{ marginLeft: 8 }}>{selectedAchievement.score}</span>
                  </div>
                )}
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>成果描述</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedAchievement.description}</p>
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>参与者</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedAchievement.participants.map(participant => (
                    <Tag key={participant}>{participant}</Tag>
                  ))}
                </div>
              </div>
              
              <Divider />
              
              {selectedAchievement.attachments && selectedAchievement.attachments.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>附件</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {selectedAchievement.attachments.map(attachment => (
                      <a 
                        key={attachment.name} 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <FileImageOutlined style={{ marginRight: 4 }} />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <Divider />
              
              {selectedAchievement.images && selectedAchievement.images.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>成果图片</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {selectedAchievement.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`成果图片 ${index + 1}`} 
                        style={{ maxWidth: '100%', width: 200, height: 150, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </div>
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