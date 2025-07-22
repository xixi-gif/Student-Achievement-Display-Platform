import React, { useState, useEffect } from 'react';
import { Layout, Card, Tag, Space, Input, Button, Typography, Divider, Spin, Row, Col, Pagination, Empty } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, StarOutlined, FilterOutlined, FileTextOutlined, ExperimentOutlined, TrophyOutlined, InboxOutlined, BookOutlined, FolderOpenOutlined } from '@ant-design/icons'; // 替换 PatentOutlined 为 InboxOutlined
import { useLocation, useNavigate, Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const mockAchievements = [
  { id: 1, title: "基于深度学习的校园垃圾分类系统研究", student: "张明", major: "计算机科学与技术", date: "2023-10-15", type: "thesis", isFeatured: true, image: "https://picsum.photos/id/1/600/400" },
  { id: 2, title: "智慧城市交通流量预测模型", student: "李华", major: "电子信息工程", date: "2023-10-10", type: "project", isFeatured: false, image: "https://picsum.photos/id/20/600/400" },
  { id: 3, title: "全国大学生数学建模竞赛一等奖", student: "王芳", major: "数学与应用数学", date: "2023-09-28", type: "competition", isFeatured: true, image: "https://picsum.photos/id/30/600/400" },
  { id: 4, title: "基于区块链的教育资源共享方法及系统", student: "刘伟", major: "软件工程", date: "2023-09-20", type: "patent", isFeatured: false, image: "https://picsum.photos/id/40/600/400" },
  { id: 5, title: "基于机器学习的股票价格预测模型研究", student: "赵强", major: "金融工程", date: "2023-09-15", type: "paper", isFeatured: true, image: "https://picsum.photos/id/50/600/400" },
  { id: 6, title: "智能语音交互系统设计与实现", student: "陈静", major: "计算机科学与技术", date: "2023-09-10", type: "coursework", isFeatured: false, image: "https://picsum.photos/id/60/600/400" },
  { id: 7, title: "基于物联网的智能家居控制系统", student: "黄晓", major: "自动化", date: "2023-08-25", type: "project", isFeatured: true, image: "https://picsum.photos/id/70/600/400" },
  { id: 8, title: "大数据环境下的用户行为分析", student: "周杰", major: "数据科学与大数据技术", date: "2023-08-20", type: "thesis", isFeatured: false, image: "https://picsum.photos/id/80/600/400" },
  { id: 9, title: "基于虚拟现实的教学辅助系统", student: "吴敏", major: "教育技术学", date: "2023-08-15", type: "competition", isFeatured: true, image: "https://picsum.photos/id/90/600/400" },
  { id: 10, title: "基于计算机视觉的人脸识别技术研究", student: "郑华", major: "人工智能", date: "2023-08-10", type: "patent", isFeatured: false, image: "https://picsum.photos/id/100/600/400" },
  { id: 11, title: "移动应用开发中的用户体验设计研究", student: "孙佳", major: "数字媒体技术", date: "2023-07-28", type: "paper", isFeatured: true, image: "https://picsum.photos/id/110/600/400" },
  { id: 12, title: "电子商务平台的推荐系统优化", student: "林娜", major: "信息管理与信息系统", date: "2023-07-25", type: "coursework", isFeatured: false, image: "https://picsum.photos/id/120/600/400" }
];

const achievementTypes = {
  all: { name: '全部', icon: <FilterOutlined /> },
  thesis: { name: '毕业论文', icon: <FileTextOutlined /> },
  project: { name: '一级项目', icon: <ExperimentOutlined /> },
  competition: { name: '竞赛作品', icon: <TrophyOutlined /> },
  patent: { name: '技术专利', icon: <InboxOutlined /> }, // 替换为 InboxOutlined
  paper: { name: '期刊论文', icon: <BookOutlined /> },
  coursework: { name: '课程作业', icon: <FolderOpenOutlined /> }
};

const AchievementsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('search') || '';
    const category = params.get('category') || 'all';
    
    setSearchText(keyword);
    setSelectedType(category);
    
    setTimeout(() => {
      let filteredData = [...mockAchievements];
      
      if (keyword) {
        filteredData = filteredData.filter(item => 
          item.title.toLowerCase().includes(keyword.toLowerCase()) || 
          item.student.toLowerCase().includes(keyword.toLowerCase()) ||
          item.major.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      
      if (category !== 'all') {
        filteredData = filteredData.filter(item => item.type === category);
      }
      
      setAchievements(filteredData);
      setLoading(false);
    }, 600);
  }, [location.search]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredAchievements(achievements.slice(startIndex, endIndex));
  }, [currentPage, pageSize, achievements]);

  const handleSearch = (value) => {
    setCurrentPage(1);
    if (value) {
      navigate(`/achievements?search=${encodeURIComponent(value)}`);
    } else {
      navigate(`/achievements${selectedType !== 'all' ? `?category=${selectedType}` : ''}`);
    }
  };

  const handleTypeChange = (value) => {
    setCurrentPage(1);
    setSelectedType(value);
    if (value === 'all') {
      navigate(searchText ? `/achievements?search=${encodeURIComponent(searchText)}` : '/achievements');
    } else {
      navigate(searchText 
        ? `/achievements?category=${value}&search=${encodeURIComponent(searchText)}` 
        : `/achievements?category=${value}`
      );
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      <Layout.Header style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '0 24px' }}>
        <Title level={3} style={{ margin: '16px 0', color: '#1677ff', textAlign: 'center' }}>成果展示平台</Title>
      </Layout.Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 32px' }}>
            <Title level={2} style={{ margin: '0 0 24px', textAlign: 'center', color: '#333' }}>成果展示</Title>
            <Divider style={{ margin: '0 0 24px' }} />
            
            <Row gutter={[16, 24]}>
              <Col xs={24}>
                <Input.Search
                  placeholder="搜索成果标题、作者或专业"
                  allowClear
                  enterButton={<Button type="primary">搜索</Button>}
                  size="middle"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  style={{ width: '100%', maxWidth: 600, margin: '0 auto', display: 'block' }}
                />
              </Col>
              
              <Col xs={24}>
                <Space style={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 12px' }}>
                  {Object.keys(achievementTypes).map(key => (
                    <Button
                      key={key}
                      type={selectedType === key ? "primary" : "default"}
                      icon={achievementTypes[key].icon}
                      onClick={() => handleTypeChange(key)}
                      size="middle"
                      style={{ 
                        borderRadius: 20, 
                        padding: '6px 16px',
                        boxShadow: 'none',
                        textTransform: 'none'
                      }}
                    >
                      {achievementTypes[key].name}
                    </Button>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>
          
          <Spin spinning={loading} tip="加载中..." style={{ display: 'block', margin: '40px auto' }}>
            {filteredAchievements.length > 0 ? (
              <>
                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                  {filteredAchievements.map(achievement => (
                    <Col xs={24} sm={12} md={6} key={achievement.id}>
                      <Card
                        hoverable
                        cover={
                          <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                            <img 
                              src={achievement.image} 
                              alt={achievement.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            {achievement.isFeatured && (
                              <Tag 
                                icon={<StarOutlined />} 
                                color="gold" 
                                style={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                精选
                              </Tag>
                            )}
                          </div>
                        }
                        style={{ 
                          borderRadius: 8, 
                          overflow: 'hidden', 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          transition: 'boxShadow 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                      >
                        <Card.Meta
                          title={
                            <Link to={`/achievement/${achievement.id}`} style={{ textDecoration: 'none', color: '#1677ff' }}>
                              <Text strong style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 40 }}>
                                {achievement.title}
                              </Text>
                            </Link>
                          }
                          description={
                            <div style={{ marginTop: 8 }}>
                              <Space size="small" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginBottom: 6 }}>
                                <Tag color="blue" style={{ fontSize: 12, padding: '2px 6px' }}>{achievementTypes[achievement.type].name}</Tag>
                              </Space>
                              
                              <div style={{ fontSize: 12, color: '#666' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span><UserOutlined style={{ fontSize: 12, marginRight: 4 }} />{achievement.student}</span>
                                  <span><CalendarOutlined style={{ fontSize: 12, marginRight: 4 }} />{achievement.date}</span>
                                </div>
                                <div style={{ marginTop: 4, color: '#888' }}>{achievement.major}</div>
                              </div>
                            </div>
                          }
                        />
                        
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => navigate(`/achievement/${achievement.id}`)}
                            style={{ padding: 0, height: 'auto', color: '#1677ff' }}
                          >
                            查看详情 →
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                <div style={{ textAlign: 'center', marginTop: 36 }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={achievements.length}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 项成果`}
                  />
                </div>
              </>
            ) : (
              <div style={{ background: '#fff', borderRadius: 8, padding: 48, textAlign: 'center', marginTop: 24 }}>
                <Empty description={<Text>未找到符合条件的成果</Text>}>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      setSearchText('');
                      setSelectedType('all');
                      navigate('/achievements');
                    }}
                  >
                    查看全部成果
                  </Button>
                </Empty>
              </div>
            )}
          </Spin>
        </div>
      </Content>
      
      <Layout.Footer style={{ textAlign: 'center', background: 'transparent', padding: '24px 16px', color: '#666' }}>
        学生成果展示平台 ©{new Date().getFullYear()}
      </Layout.Footer>
    </Layout>
  );
};

export default AchievementsPage;