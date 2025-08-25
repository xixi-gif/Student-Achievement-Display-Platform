import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Card, Tabs, Avatar, Badge, Tag, 
  Button, Space, Divider, Image, List, 
  Spin, message, Descriptions,
  Input, Row, Col, Empty
} from 'antd';
import { 
  UserOutlined, CalendarOutlined, BookOutlined, 
  DownloadOutlined, FileTextOutlined, EditOutlined, 
  ShareAltOutlined, HeartOutlined, HeartFilled, 
  TrophyOutlined, MessageOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { achievementApi } from '../../service/api';
import moment from 'moment';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const categoryColors = {
  thesis: "blue",
  project: "green",
  competition: "orange",
  patent: "red",
  paper: "purple",
  coursework: "cyan"
};

const levelColors = {
  school: "default",
  city: "blue",
  province: "orange",
  national: "red",
  international: "purple"
};

const AchievementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [achievement, setAchievement] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const contentRefs = {
    basic: useRef(null),
    details: useRef(null),
    media: useRef(null),
    files: useRef(null),
    comments: useRef(null)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取用户信息
        const token = localStorage.getItem('token');
        const role = token ? localStorage.getItem('user_role') : 'visitor';
        const username = token ? localStorage.getItem('username') : '访客';
        setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });
        
        // 获取成果详情
        const response = await achievementApi.getDetail(id);
        
        if (response.code === 0) {
          setAchievement(response.data);
          
          // 初始化评论数据（实际项目中应该从接口获取）
          setComments([]);
        } else {
          throw new Error(response.message || '获取成果详情失败');
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error(error.message || '获取数据失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // 安全的数组访问函数
  const getSafeArray = (array) => {
    return Array.isArray(array) ? array : [];
  };

  const scrollToSection = (key) => {
    setActiveTab(key);
    contentRefs[key]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLike = () => {
    if (currentUser?.role === 'visitor') {
      message.info('请登录后再进行点赞');
      return;
    }
    setLiked(!liked);
    message.success(liked ? '已取消点赞' : '点赞成功');
  };

  const isCreator = () => {
    if (!currentUser || !achievement) return false;
    return getSafeArray(achievement.participants).some(p => p.realName === currentUser.username);
  };

  const isAdminOrTeacher = () => {
    return ['admin', 'teacher'].includes(currentUser?.role);
  };

  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleCommentSubmit = () =>{
    if (currentUser?.role === 'visitor') {
      message.info('请登录后再发表评论');
      return;
    }
    if (!commentContent.trim()) {
      message.warning('评论内容不能为空');
      return;
    }
    const newComment = {
      id: comments.length + 1,
      user: {
        name: currentUser.username,
        avatar: currentUser.avatar
      },
      content: commentContent,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    setComments([...comments, newComment]);
    setCommentContent("");
    message.success('评论发表成功');
  };

  if (loading && !achievement) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar currentUser={currentUser} />
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!achievement) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar currentUser={currentUser} />
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Empty description="未找到该成果" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ background: '#f8f9fa', padding: '24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24, padding: '16px', backgroundColor: '#fff', borderRadius: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#222' }}>
              {achievement.title}
            </h1>
            <Space size="middle" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' }}>
              <Tag color={categoryColors[achievement.category]}>
                {achievement.category}
              </Tag>
              <Tag color={levelColors[achievement.level]}>
                {achievement.level}
              </Tag>
              <Tag icon={<CalendarOutlined />}>
                {moment(achievement.date).format('YYYY-MM-DD')}
              </Tag>
              {/* 修复关键词map错误 */}
              {getSafeArray(achievement.keywords).map((keyword, idx) => (
                <Tag key={idx} style={{ marginRight: 8, backgroundColor: '#f0f2f5', borderColor: '#d9d9d9' }}>
                  {keyword}
                </Tag>
              ))}
            </Space>
          </div>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={16}>
              <Card 
                bordered={false} 
                style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: 4, 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  padding: '16px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: '#222' }}>
                    <UserOutlined /> 项目成员 & 指导教师
                  </h3>
                  
                  <Space size="small">
                    {(isCreator() || isAdminOrTeacher()) && (
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => navigate(`/achievement/edit/${achievement.id}`)}
                      >
                        编辑
                      </Button>
                    )}
                    <Button icon={<ShareAltOutlined />} size="small">分享</Button>
                  </Space>
                </div>
                <Divider style={{ margin: '16px 0' }} />
                
                {/* 修复参与者列表错误 */}
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                  dataSource={getSafeArray(achievement.participants)}
                  renderItem={member => (
                    <List.Item>
                      <Card 
                        hoverable
                        style={{ 
                          textAlign: 'center', 
                          border: '1px solid #f0f0f0',
                          borderRadius: 4,
                          transition: 'all 0.3s'
                        }}
                        onClick={() => navigate(`/student/profile/${member.studentNo}`)}
                      >
                        <Avatar 
                          src={member.avatar} 
                          icon={<UserOutlined />}
                          size={64}
                          style={{ margin: '16px auto 12px', border: '2px solid #fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                        />
                        <h4 style={{ margin: '0 0 4px', fontSize: 16, color: '#222' }}>{member.realName}</h4>
                        <p style={{ margin: '0 0 8px', color: '#666', fontSize: 12 }}>
                          {member.major} {member.grade}
                        </p>
                        <Badge status="success" text={member.role} />
                      </Card>
                    </List.Item>
                  )}
                />
                
                {achievement.instructor && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 16, color: '#222' }}>
                      <BookOutlined /> 指导教师
                    </h4>
                    <Card 
                      hoverable
                      style={{ 
                        display: 'inline-block', 
                        border: '1px solid #f0f0f0',
                        borderRadius: 4
                      }}
                      onClick={() => navigate(`/teacher/profile`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                        <Avatar 
                          src={achievement.instructor.avatar} 
                          icon={<UserOutlined />}
                          size={48}
                          style={{ marginRight: 16, border: '2px solid #fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                        />
                        <div>
                          <h4 style={{ margin: 0, fontSize: 14, color: '#222' }}>{achievement.instructor.name}</h4>
                          <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
                            {achievement.instructor.department} {achievement.instructor.title}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            </Col>
            
            <Col span={8}>
              <Card 
                bordered={false} 
                style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: 4, 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  padding: '16px' 
                }}
              >
                <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#222' }}>
                  <TrophyOutlined /> 成果数据
                </h3>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>浏览次数</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>{achievement.viewCount || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>点赞次数</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>
                      {liked ? (achievement.likeCount || 0) + 1 : achievement.likeCount || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>评论次数</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>{comments.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>最近更新</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>
                      {moment(achievement.date).format('YYYY-MM-DD')}
                    </span>
                  </div>
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <Button 
                  icon={liked ? <HeartFilled style={{ color: '#1890ff' }} /> : <HeartOutlined />}
                  onClick={handleLike}
                  style={{ 
                    width: '100%', 
                    marginBottom: 12,
                    borderColor: '#d9d9d9',
                    transition: 'all 0.3s'
                  }}
                >
                  {liked ? '已点赞' : '点赞'} ({liked ? (achievement.likeCount || 0) + 1 : achievement.likeCount || 0})
                </Button>
                
                <Button 
                  icon={<DownloadOutlined />}
                  style={{ 
                    width: '100%',
                    borderColor: '#d9d9d9',
                    transition: 'all 0.3s'
                  }}
                >
                  下载 PDF
                </Button>
              </Card>
            </Col>
          </Row>

          <Card 
            bordered={false} 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 4, 
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              marginBottom: 24 
            }}
          >
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => setActiveTab(key)}
              style={{ borderBottom: '1px solid #f0f0f0' }}
              tabBarStyle={{ padding: '0 16px' }}
            >
              <TabPane tab="基本信息" key="basic" />
              <TabPane tab="详细介绍" key="details" />
              <TabPane tab="图片与视频" key="media" />
              <TabPane tab="相关文件" key="files" />
              <TabPane tab="评论" key="comments" />
            </Tabs>
          </Card>

          <Layout>
            <Sider width={220} style={{ background: '#fff', borderRadius: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              <Card bordered={false} style={{ height: '100%', padding: '16px 0' }}>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { key: 'basic', title: '基本信息', icon: <BookOutlined /> },
                    { key: 'details', title: '详细介绍', icon: <FileTextOutlined /> },
                    { key: 'media', title: '图片与视频', icon: <Image /> },
                    { key: 'files', title: '相关文件', icon: <DownloadOutlined /> },
                    { key: 'comments', title: '评论', icon: <MessageOutlined /> }
                  ]}
                  renderItem={item => (
                    <List.Item
                      onClick={() => scrollToSection(item.key)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: activeTab === item.key ? '#f0f2f5' : 'transparent',
                        padding: '8px 16px',
                        transition: 'all 0.3s'
                      }}
                    >
                      <List.Item.Meta
                        avatar={item.icon}
                        title={
                          <span style={{ color: activeTab === item.key ? '#1890ff' : '#222' }}>
                            {item.title}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Sider>
            
            <Content style={{ padding: '0 24px', background: '#f8f9fa' }}>
              <div style={{ padding: 0 }}>
                <div ref={contentRefs.basic} style={{ display: activeTab === 'basic' ? 'block' : 'none' }}>
                  <Card 
                    bordered={false} 
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 4, 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      padding: '16px',
                      marginBottom: 24 
                    }}
                  >
                    <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#222' }}>
                      <BookOutlined style={{ marginRight: 8 }} /> 基本信息
                    </h2>
                    
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="成果标题">{achievement.title}</Descriptions.Item>
                      <Descriptions.Item label="成果分类">
                        <Tag color={categoryColors[achievement.category]}>
                          {achievement.category}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="成果级别">
                        <Tag color={levelColors[achievement.level]}>
                          {achievement.level}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="完成日期">
                        {moment(achievement.date).format('YYYY-MM-DD')}
                      </Descriptions.Item>
                      <Descriptions.Item label="价格信息">
                        {achievement.price || '免费'}
                      </Descriptions.Item>
                      <Descriptions.Item label="关键词">
                        {/* 修复关键词map错误 */}
                        {getSafeArray(achievement.keywords).map((keyword, idx) => (
                          <Tag key={idx} closable={false} style={{ marginRight: 8 }}>
                            {keyword}
                          </Tag>
                        ))}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间">
                        {moment(achievement.date).format('YYYY-MM-DD HH:mm:ss')}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {moment(achievement.date).format('YYYY-MM-DD HH:mm:ss')}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
                
                <div ref={contentRefs.details} style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
                  <Card 
                    bordered={false} 
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 4, 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      padding: '16px',
                      marginBottom: 24 
                    }}
                  >
                    <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#222' }}>
                      <FileTextOutlined style={{ marginRight: 8 }} /> 详细介绍
                    </h2>
                    
                    <div style={{ lineHeight: '1.8', color: '#444' }}>
                      <p style={{ margin: '0 0 16px' }}>{achievement.description}</p>
                    </div>
                  </Card>
                </div>
                
                <div ref={contentRefs.media} style={{ display: activeTab === 'media' ? 'block' : 'none' }}>
                  <Card 
                    bordered={false} 
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 4, 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      padding: '16px',
                      marginBottom: 24 
                    }}
                  >
                    <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#222' }}>
                      <Image style={{ marginRight: 8 }} /> 图片与视频
                    </h2>
                    
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#222' }}>项目图片</h3>
                      {getSafeArray(achievement.images).length > 0 ? (
                        <Tabs 
                          type="card" 
                          defaultActiveKey="0"
                          style={{ marginBottom: 24 }}
                        >
                          {getSafeArray(achievement.images).map((img, idx) => (
                            <TabPane tab={`图片 ${idx + 1}`} key={idx}>
                              <div style={{ textAlign: 'center' }}>
                                <img 
                                  src={img} 
                                  alt={`${achievement.title} 图片 ${idx + 1}`}
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: 500, 
                                    objectFit: 'contain',
                                    borderRadius: 4
                                  }}
                                />
                              </div>
                            </TabPane>
                          ))}
                        </Tabs>
                      ) : (
                        <Empty description="暂无图片" />
                      )}
                    </div>
                    
                    {getSafeArray(achievement.videos).length > 0 ? (
                      <div>
                        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#222' }}>项目视频</h3>
                        {getSafeArray(achievement.videos).map((video, idx) => (
                          <div key={idx} style={{ marginBottom: 24 }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: 14, color: '#222' }}>{video.name}</h4>
                            <div style={{ 
                              position: 'relative', 
                              paddingBottom: '56.25%',
                              height: 0,
                              backgroundColor: '#000',
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}>
                              <video
                                src={video.url}
                                controls
                                style={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%'
                                }}
                                poster={getSafeArray(achievement.images)[0]}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty description="暂无视频" />
                    )}
                  </Card>
                </div>
                
                <div ref={contentRefs.files} style={{ display: activeTab === 'files' ? 'block' : 'none' }}>
                  <Card 
                    bordered={false} 
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 4, 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      padding: '16px',
                      marginBottom: 24 
                    }}
                  >
                    <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#222' }}>
                      <DownloadOutlined style={{ marginRight: 8 }} /> 相关文件
                    </h2>
                    
                    {getSafeArray(achievement.files).length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={getSafeArray(achievement.files)}
                        renderItem={file => (
                          <List.Item
                            style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                          >
                            <List.Item.Meta
                              avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                              title={
                                <span style={{ color: '#222', fontWeight: 500 }}>
                                  {file.name}
                                </span>
                              }
                              description={
                                <span style={{ color: '#666', fontSize: 12 }}>
                                  {file.size ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : '未知大小'}
                                </span>
                              }
                            />
                            <Button 
                              type="link" 
                              icon={<DownloadOutlined />}
                              href={file.url}
                              download
                              style={{ color: '#1890ff' }}
                            >
                              下载
                            </Button>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无相关文件" />
                    )}
                  </Card>
                </div>
                
                <div ref={contentRefs.comments} style={{ display: activeTab === 'comments' ? 'block' : 'none' }}>
                  <Card 
                    bordered={false} 
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 4, 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      padding: '16px',
                      marginBottom: 24 
                    }}
                  >
                    <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#222' }}>
                      <MessageOutlined style={{ marginRight: 8 }} /> 评论 ({comments.length})
                    </h2>
                    
                    <div style={{ marginBottom: 24 }}>
                      <TextArea 
                        rows={4} 
                        placeholder="写下你的评论..."
                        value={commentContent}
                        onChange={handleCommentChange}
                        style={{ marginBottom: 12, borderRadius: 4 }}
                      />
                      <Button 
                        type="primary" 
                        onClick={handleCommentSubmit}
                        style={{ float: 'right' }}
                      >
                        发布评论
                      </Button>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    
                    {comments.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={comments}
                        renderItem={comment => (
                          <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <List.Item.Meta
                              avatar={<Avatar src={comment.user.avatar} icon={<UserOutlined />} />}
                              title={
                                <Space size="small">
                                  <span style={{ fontWeight: 500 }}>{comment.user.name}</span>
                                  <span style={{ color: '#666', fontSize: 12 }}>
                                    {moment(comment.time).format('YYYY-MM-DD HH:mm')}
                                  </span>
                                </Space>
                              }
                              description={<p style={{ marginTop: 8 }}>{comment.content}</p>}
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无评论" />
                    )}
                  </Card>
                </div>
              </div>
            </Content>
          </Layout>
        </div>
      </Content>
    </Layout>
  );
};

export default AchievementDetailPage;