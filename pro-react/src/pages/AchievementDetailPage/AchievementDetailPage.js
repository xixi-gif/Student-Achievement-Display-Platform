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
import moment from 'moment';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const mockAchievement = {
  id: 1,
  title: "基于深度学习的校园垃圾分类系统研究",
  category: "project",
  categoryLabel: "一级项目",
  level: "school",
  levelLabel: "校级",
  date: "2023-09-28",
  description: "本项目旨在通过深度学习技术实现校园垃圾的智能分类，解决传统垃圾分类效率低、识别不准确的问题...",
  participants: [
    {
      id: "1001",
      name: "张明",
      major: "计算机科学与技术",
      grade: "2020级",
      avatar: "https://picsum.photos/id/1001/200/200",
      role: "负责人"
    },
    {
      id: "1002",
      name: "李华",
      major: "软件工程",
      grade: "2020级",
      avatar: "https://picsum.photos/id/1002/200/200",
      role: "核心成员"
    },
    {
      id: "1003",
      name: "王芳",
      major: "人工智能",
      grade: "2021级",
      avatar: "https://picsum.photos/id/1003/200/200",
      role: "核心成员"
    }
  ],
  instructor: {
    name: "陈教授",
    title: "计算机学院 副教授",
    avatar: "https://picsum.photos/id/2001/200/200"
  },
  keywords: ["深度学习", "垃圾分类", "校园应用", "图像识别"],
  price: "99.99",
  status: "published",
  viewCount: 356,
  likeCount: 42,
  commentCount: 3,
  images: [
    "https://picsum.photos/id/1/800/600",
    "https://picsum.photos/id/20/800/600",
    "https://picsum.photos/id/30/800/600"
  ],
  videos: [
    {
      name: "系统演示视频",
      url: "https://example.com/videos/demo.mp4"
    }
  ],
  files: [
    {
      name: "项目报告.pdf",
      url: "/files/report.pdf",
      size: "2.4MB"
    },
    {
      name: "源代码.zip",
      url: "/files/source.zip",
      size: "15.8MB"
    }
  ],
  createTime: "2023-10-01 14:30:00",
  updateTime: "2023-10-10 09:15:00"
};

const mockComments = [
  {
    id: 1,
    user: {
      name: "刘洋",
      avatar: "https://picsum.photos/id/1027/200/200"
    },
    content: "这个项目很有实际应用价值，期待后续进展！",
    time: "2023-10-15 08:30:00"
  },
  {
    id: 2,
    user: {
      name: "赵伟",
      avatar: "https://picsum.photos/id/1025/200/200"
    },
    content: "数据集的规模有多大？模型准确率能达到多少？",
    time: "2023-10-16 15:45:00"
  },
  {
    id: 3,
    user: {
      name: "张明",
      avatar: "https://picsum.photos/id/1001/200/200"
    },
    content: "感谢关注！数据集包含约5万张校园垃圾图片，模型准确率在测试集上达到92.3%。",
    time: "2023-10-17 10:12:00"
  }
];

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
    const timer = setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'visitor';
      const username = localStorage.getItem('username') || '访客';
      setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });
      setAchievement(mockAchievement);
      setComments(mockComments);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id]);

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
    return achievement.participants.some(p => p.name === currentUser.username);
  };

  const isAdminOrTeacher = () => {
    return ['admin', 'teacher'].includes(currentUser?.role);
  };

  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleCommentSubmit = () => {
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

  if (loading || !achievement) {
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
                {achievement.categoryLabel}
              </Tag>
              <Tag color={levelColors[achievement.level]}>
                {achievement.levelLabel}
              </Tag>
              <Tag icon={<CalendarOutlined />}>
                {moment(achievement.date).format('YYYY-MM-DD')}
              </Tag>
              {achievement.keywords && achievement.keywords.map((keyword, idx) => (
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
                
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                  dataSource={achievement.participants}
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
                        onClick={() => navigate(`/user/${member.id}`)}
                      >
                        <Avatar 
                          src={member.avatar} 
                          icon={<UserOutlined />}
                          size={64}
                          style={{ margin: '16px auto 12px', border: '2px solid #fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                        />
                        <h4 style={{ margin: '0 0 4px', fontSize: 16, color: '#222' }}>{member.name}</h4>
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
                      onClick={() => navigate(`/user/${achievement.instructor.id}`)}
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
                            {achievement.instructor.title}
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
                    <span style={{ fontWeight: 600, color: '#222' }}>{achievement.viewCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>点赞次数</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>
                      {liked ? achievement.likeCount + 1 : achievement.likeCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>评论次数</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>{comments.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>最近更新</span>
                    <span style={{ fontWeight: 600, color: '#222' }}>
                      {moment(achievement.updateTime).format('YYYY-MM-DD')}
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
                  {liked ? '已点赞' : '点赞'} ({liked ? achievement.likeCount + 1 : achievement.likeCount})
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
                          {achievement.categoryLabel}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="成果级别">
                        <Tag color={levelColors[achievement.level]}>
                          {achievement.levelLabel}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="完成日期">
                        {moment(achievement.date).format('YYYY-MM-DD')}
                      </Descriptions.Item>
                      <Descriptions.Item label="价格信息">
                        {achievement.price}
                      </Descriptions.Item>
                      <Descriptions.Item label="关键词">
                        {achievement.keywords.map((keyword, idx) => (
                          <Tag key={idx} closable={false} style={{ marginRight: 8 }}>
                            {keyword}
                          </Tag>
                        ))}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间">
                        {moment(achievement.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {moment(achievement.updateTime).format('YYYY-MM-DD HH:mm:ss')}
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
                      <Tabs 
                        type="card" 
                        defaultActiveKey="0"
                        style={{ marginBottom: 24 }}
                      >
                        {achievement.images.map((img, idx) => (
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
                    </div>
                    
                    {achievement.videos && achievement.videos.length > 0 && (
                      <div>
                        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#222' }}>项目视频</h3>
                        {achievement.videos.map((video, idx) => (
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
                                poster={achievement.images[0]}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
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
                    
                    {achievement.files.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={achievement.files}
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
                                  {file.size}
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