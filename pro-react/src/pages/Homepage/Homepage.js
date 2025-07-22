import React, { useState, useEffect } from 'react';
import { 
  Layout, Carousel, Card, Statistic, Row, Col, 
  Tabs, Tag, Button, Space, Input, Typography,
  Divider, Spin
} from 'antd';
import { 
  TrophyOutlined, UserOutlined, CalendarOutlined,
  SearchOutlined, ArrowRightOutlined, StarOutlined,
  BookOutlined, ProjectOutlined, TeamOutlined,
  InboxOutlined, FilePdfOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const carouselData = [
  {
    title: '2023届优秀毕业论文展',
    description: '展示本年度最具代表性的学术研究成果',
    image: 'https://picsum.photos/id/26/1200/400'
  },
  {
    title: '一级项目成果展示',
    description: '我校重点科研项目取得突破性进展',
    image: 'https://picsum.photos/id/28/1200/400'
  },
  {
    title: '竞赛获奖作品集锦',
    description: '在国家级、省级学科竞赛中屡获佳绩',
    image: 'https://picsum.photos/id/29/1200/400'
  }
];

const categories = [
  { key: 'thesis', name: '毕业论文', count: 86, color: '#1890ff', icon: <FilePdfOutlined /> },
  { key: 'project', name: '一级项目', count: 52, color: '#52c41a', icon: <ProjectOutlined /> },
  { key: 'competition', name: '竞赛作品', count: 78, color: '#faad14', icon: <TrophyOutlined /> },
  { key: 'patent', name: '技术专利', count: 34, color: '#f5222d', icon: <InboxOutlined /> },
  { key: 'paper', name: '期刊论文', count: 67, color: '#722ed1', icon: <BookOutlined /> },
  { key: 'coursework', name: '课程作业', count: 123, color: '#13c2c2', icon: <TeamOutlined /> }
];

const latestAchievements = [
  {
    id: 1,
    title: "基于深度学习的校园垃圾分类系统研究",
    student: "张明",
    major: "计算机科学与技术",
    date: "2023-10-15",
    category: "毕业论文",
    image: "https://picsum.photos/id/1/300/200",
    isFeatured: true
  },
  {
    id: 2,
    title: "智慧城市交通流量预测模型",
    student: "李华",
    major: "电子信息工程",
    date: "2023-10-10",
    category: "一级项目",
    image: "https://picsum.photos/id/20/300/200",
    isFeatured: false
  },
  {
    id: 3,
    title: "全国大学生数学建模竞赛一等奖",
    student: "王芳",
    major: "数学与应用数学",
    date: "2023-09-28",
    category: "竞赛作品",
    image: "https://picsum.photos/id/30/300/200",
    isFeatured: true
  },
  {
    id: 4,
    title: "一种基于区块链的教育资源共享方法及系统",
    student: "刘伟",
    major: "软件工程",
    date: "2023-09-20",
    category: "技术专利",
    image: "https://picsum.photos/id/40/300/200",
    isFeatured: false
  }
];

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'visitor';
      const username = localStorage.getItem('username') || '访客';
      setCurrentUser({ role, username });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const statistics = [
    { title: '总成果数', value: 430, icon: <TrophyOutlined />, color: '#1890ff' },
    { title: '展示学生', value: 215, icon: <UserOutlined />, color: '#52c41a' },
    { title: '成果分类', value: 6, icon: <TagOutlined />, color: '#faad14' },
    { title: '本月新增', value: 18, icon: <CalendarOutlined />, color: '#f5222d' }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />

      <Content style={{ background: '#f0f2f5' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80vh' 
          }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Carousel autoplay effect="fade" style={{ maxHeight: 400, overflow: 'hidden' }}>
              {carouselData.map((item, index) => (
                <div key={index}>
                  <div style={{ 
                    background: `url(${item.image}) center/cover no-repeat`,
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10%'
                  }}>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.9)', 
                      padding: '32px', 
                      borderRadius: 8, 
                      maxWidth: 600 
                    }}>
                      <Title level={2} style={{ margin: 0 }}>{item.title}</Title>
                      <Paragraph style={{ fontSize: 16, marginTop: 16 }}>
                        {item.description}
                      </Paragraph>
                      <Button 
                        type="primary" 
                        size="large" 
                        style={{ marginTop: 16 }}
                        onClick={() => navigate(`/achievements?category=${item.category || 'featured'}`)}
                      >
                        查看详情 <ArrowRightOutlined />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>

            <div style={{ padding: '30px 5%' }}>
              <Row gutter={[16, 16]}>
                {statistics.map((stat, index) => (
                  <Col xs={12} sm={6} key={index}>
                    <Card>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        prefix={stat.icon}
                        valueStyle={{ color: stat.color }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <div style={{ padding: '0 5% 30px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                  <Card title="成果分类浏览" bordered={false}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {categories.map(category => (
                        <Button
                          key={category.key}
                          type="text"
                          icon={category.icon}
                          onClick={() => navigate(`/achievements?category=${category.key}`)}
                          style={{ 
                            justifyContent: 'space-between', 
                            padding: '12px 16px',
                            borderLeft: `3px solid ${category.color}`
                          }}
                        >
                          <span>{category.name}</span>
                          <Tag color={category.color}>{category.count}</Tag>
                        </Button>
                      ))}
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div>
                      <Title level={5} style={{ marginBottom: 12 }}>搜索成果</Title>
                      <Input
                        placeholder="输入关键词搜索"
                        prefix={<SearchOutlined />}
                        onPressEnter={(e) => navigate(`/achievements?search=${e.target.value}`)}
                        style={{ marginBottom: 12 }}
                      />
                      <Button 
                        type="primary" 
                        block
                        onClick={() => navigate('/achievements')}
                      >
                        查看全部成果
                      </Button>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={18}>
                  <Tabs defaultActiveKey="latest" size="large">
                    <TabPane tab="最新成果" key="latest">
                      <Row gutter={[16, 16]}>
                        {latestAchievements.map(achievement => (
                          <Col xs={24} sm={12} key={achievement.id}>
                            <Card 
                              hoverable
                              cover={
                                <div style={{ height: 180, overflow: 'hidden' }}>
                                  <img 
                                    src={achievement.image} 
                                    alt={achievement.title} 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      transition: 'transform 0.3s'
                                    }}
                                  />
                                </div>
                              }
                              actions={[
                                <Space size="small">
                                  <UserOutlined />
                                  <Text>{achievement.student}</Text>
                                </Space>,
                                <Space size="small">
                                  <CalendarOutlined />
                                  <Text>{achievement.date}</Text>
                                </Space>
                              ]}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Title level={5} style={{ margin: 0 }}>
                                  {achievement.title}
                                </Title>
                                {achievement.isFeatured && (
                                  <Tag icon={<StarOutlined />} color="gold">
                                    精选
                                  </Tag>
                                )}
                              </div>
                              <Paragraph 
                                ellipsis={{ rows: 2 }} 
                                style={{ color: '#666', marginBottom: 12 }}
                              >
                                {achievement.major} · {achievement.category}
                              </Paragraph>
                              <Button 
                                type="primary" 
                                size="small"
                                onClick={() => navigate(`/achievement/detail`)}
                              >
                                查看详情
                              </Button>
                            </Card>
                          </Col>
                        ))}
                      </Row>

                      <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Button 
                          type="dashed" 
                          onClick={() => navigate('/achievements')}
                          icon={<ArrowRightOutlined />}
                        >
                          查看更多成果
                        </Button>
                      </div>
                    </TabPane>

                    <TabPane tab="特色推荐" key="featured">
                      <Card bordered={false}>
                        <div style={{ textAlign: 'center', padding: 40 }}>
                          <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                          <Title level={3}>特色成果推荐</Title>
                          <Paragraph style={{ margin: '16px 0 24px' }}>
                            这里展示由老师推荐的优秀学生成果，点击查看更多
                          </Paragraph>
                          <Button 
                            type="primary" 
                            onClick={() => navigate('/achievements?featured=true')}
                          >
                            浏览特色成果
                          </Button>
                        </div>
                      </Card>
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
};

const TagOutlined = Tag;

export default HomePage;    