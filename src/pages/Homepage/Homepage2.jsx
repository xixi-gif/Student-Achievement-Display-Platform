import React, { useState, useEffect } from 'react';
import { 
  Layout, Carousel, Card, Statistic, Row, Col, 
  Tabs, Tag, Button, Space, Input, Typography,
  Divider, Spin, message
} from 'antd';
import { 
  TrophyOutlined, UserOutlined, CalendarOutlined,
  SearchOutlined, ArrowRightOutlined, StarOutlined,
  BookOutlined, ProjectOutlined, TeamOutlined,
  InboxOutlined, FilePdfOutlined, TagOutlined,
  CodeOutlined, ExperimentOutlined, BulbOutlined,
  CrownOutlined, ApiOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { achievementApi,adminApi } from '../../service/api';
import moment from 'moment';

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

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 分类颜色和图标映射配置
const CATEGORY_CONFIG = {
  '软件开发': {
    color: '#1890ff', // 蓝色
    icon: <CodeOutlined />,
    badgeColor: '#1890ff'
  },
  '学术论文': {
    color: '#52c41a', // 绿色
    icon: <BookOutlined />,
    badgeColor: '#52c41a'
  },
  '创新设计': {
    color: '#faad14', // 橙色
    icon: <BulbOutlined />,
    badgeColor: '#faad14'
  },
  '竞赛成果': {
    color: '#f5222d', // 红色
    icon: <TrophyOutlined />,
    badgeColor: '#f5222d'
  },
  '科研项目': {
    color: '#722ed1', // 紫色
    icon: <ExperimentOutlined />,
    badgeColor: '#722ed1'
  },
  // 默认配置（用于未知分类）
  'default': {
    color: '#8c8c8c', // 灰色
    icon: <TagOutlined />,
    badgeColor: '#8c8c8c'
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取用户信息
        const token = localStorage.getItem('token');
        const role = token ? localStorage.getItem('user_role') : 'visitor';
        const username = token ? localStorage.getItem('username') : '访客';
        setCurrentUser({ role, username });

        // 获取统计数据
        const statsResponse = await adminApi.getStatistics();
        if (statsResponse.code === 0) {
          setStatistics([
            { title: '总成果数', value: statsResponse.data.approvedCount, icon: <TrophyOutlined />, color: '#1890ff' },
            { title: '展示学生', value: statsResponse.data.hasAchievementStudentCount, icon: <UserOutlined />, color: '#52c41a' },
            { title: '成果分类', value: statsResponse.data.categoryCount, icon: <TagOutlined />, color: '#faad14' },
            { title: '本月成果', value: statsResponse.data.currentMonthAchievementCount, icon: <CalendarOutlined />, color: '#f5222d' }
          ]);
        }

        // 获取分类数据
        const categoriesResponse = await adminApi.getCategoryList();
        if (categoriesResponse.code === 0) {
          // 根据图片中的分类名称映射配置
          const formattedCategories = categoriesResponse.data.map(cat => {
            const config = CATEGORY_CONFIG[cat.name] || CATEGORY_CONFIG.default;
            return {
              key: cat.id,
              name: cat.name,
              count: cat.achievementCount || 0,
              color: config.color,
              icon: config.icon,
              badgeColor: config.badgeColor
            };
          });
          setCategories(formattedCategories);
        }

        // 只请求一次，获取所有已发布的成果
        const achievementsResponse = await achievementApi.getList({
          page: 1,
          size: 8
        });

        if (achievementsResponse.code === 0) {
          const allData = achievementsResponse.data.records;
          setAllAchievements(allData);
        }

      } catch (error) {
        console.error('获取数据失败:', error);
        message.error('获取数据失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取分类配置
  const getCategoryConfig = (categoryName) => {
    return CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG.default;
  };

  // 根据 recommended 字段筛选数据
  const getLatestAchievements = () => {
    return allAchievements
      .sort((a, b) => moment(b.createTime).valueOf() - moment(a.createTime).valueOf())
      .slice(0, 4);
  };

  const getFeaturedAchievements = () => {
    return allAchievements
      .filter(item => item.recommended)
      .sort((a, b) => (b.recommendLevel || 0) - (a.recommendLevel || 0))
      .slice(0, 4);
  };

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
                        onClick={() => navigate(`/achievements?category=featured`)}
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
                          onClick={() => navigate(`/achievements?category=${category.name}`)}
                          style={{ 
                            justifyContent: 'space-between', 
                            padding: '12px 16px',
                            borderLeft: `3px solid ${category.color}`,
                            color: category.color,
                            fontWeight: 500
                          }}
                        >
                          <span>{category.name}</span>
                          <Tag color={category.badgeColor}>{category.count}</Tag>
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
                        {getLatestAchievements().map(achievement => {
                          // const categoryConfig = getCategoryConfig(achievement.category);
                          return (
                            <Col xs={24} sm={12} key={achievement.id}>
                              <Card 
                                hoverable
                                cover={
                                  <div style={{ height: 180, overflow: 'hidden',position: 'relative' }}>
                                    <img 
                                      src={achievement.cover || 'https://picsum.photos/id/1/300/200'} 
                                      alt={achievement.title} 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s'
                                      }}
                                    />
                                    {achievement.recommended && (
                                    <Tag icon={<StarOutlined />} color="gold">
                                      精选
                                    </Tag>
                                  )}
                                  </div>
                                }
                                actions={[
                                  <Space size="small">
                                    <UserOutlined />
                                    <Text>{achievement.userName || '未知用户'}</Text>
                                  </Space>,
                                  <Space size="small">
                                    <CalendarOutlined />
                                    <Text>{moment(achievement.createTime).format('YYYY-MM-DD')}</Text>
                                  </Space>
                                ]}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <Title level={5} style={{ margin: 0 }}>
                                    {achievement.title}
                                  </Title>
                                  
                                </div>
                                <Paragraph 
                                  ellipsis={{ rows: 2 }} 
                                  style={{ color: '#666', marginBottom: 12 }}
                                >
                                  {/* <Tag color={categoryConfig.color} icon={categoryConfig.icon}>
                                    {achievement.category}
                                  </Tag> */}
                                  {/* {achievement.major && ` · ${achievement.major}`} */}
                                  {achievement.major || '未知专业'} · {achievement.category}
                                </Paragraph>
                                <div style={{ textAlign: 'left' }}>
                                  <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => navigate(`/achievement/detail/${achievement.id}`)}
                                  >
                                    查看详情
                                  </Button>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
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
                      <Row gutter={[16, 16]}>
                        {getFeaturedAchievements().map(achievement => {
                          const categoryConfig = getCategoryConfig(achievement.category);
                          return (
                            <Col xs={24} sm={12} key={achievement.id}>
                              <Card 
                                hoverable
                                cover={
                                  <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                      src={achievement.cover || 'https://picsum.photos/id/1/300/200'} 
                                      alt={achievement.title} 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s'
                                      }}
                                    />
                                    <Tag 
                                      icon={<StarOutlined />} 
                                      color="gold" 
                                      style={{ position: 'absolute', top: 8, right: 8 }}
                                    >
                                      推荐等级: {achievement.recommendLevel || 0}
                                    </Tag>
                                  </div>
                                }
                                actions={[
                                  <Space size="small">
                                    <UserOutlined />
                                    <Text>{achievement.userName || '未知用户'}</Text>
                                  </Space>,
                                  <Space size="small">
                                    <CalendarOutlined />
                                    <Text>{moment(achievement.createTime).format('YYYY-MM-DD')}</Text>
                                  </Space>
                                ]}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <Title level={5} style={{ margin: 0 }}>
                                    {achievement.title}
                                  </Title>
                                  <Tag color={categoryConfig.color} icon={categoryConfig.icon}>
                                    {achievement.category}
                                  </Tag>
                                </div>
                                <Paragraph 
                                  ellipsis={{ rows: 2 }} 
                                  style={{ color: '#666', marginBottom: 12 }}
                                >
                                  {achievement.major || '未知专业'}
                                </Paragraph>
                                <div style={{ textAlign: 'left' }}>
                                  <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => navigate(`/achievement/detail/${achievement.id}`)}
                                  >
                                    查看详情
                                  </Button>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>

                      <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Button 
                          type="dashed" 
                          onClick={() => navigate('/achievements?featured=true')}
                          icon={<ArrowRightOutlined />}
                        >
                          查看更多推荐成果
                        </Button>
                      </div>
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

export default HomePage;