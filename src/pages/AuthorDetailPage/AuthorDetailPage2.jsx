import React, { useState, useEffect } from 'react';
import { Layout, Card, Avatar, Badge, Tabs, Table, Tag, Divider, Space, Button, Spin, message } from 'antd';
import { TrophyOutlined, EyeOutlined, UserOutlined, BookOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { authorApi } from '../../service/api';

const { Content } = Layout;
const { TabPane } = Tabs;

const AuthorDetailPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('用户ID参数缺失');
      setLoading(false);
      return;
    }

    fetchAuthorInfo();
  }, [userId]);

  const fetchAuthorInfo = async () => {
    try {
      setLoading(true);
      const response = await authorApi.getUserPublicInfo(userId);
      
      console.log('接口响应:', response);
      
      if (response._isError) {
        throw new Error(response.message || '获取用户信息失败');
      }
      
      if (response.code === 0) {
        setAuthor(response.data || null);
        setError(null);
      } else {
        throw new Error(response.message || '获取用户信息失败');
      }
      
    } catch (err) {
      setError(err.message);
      message.error(`获取用户信息失败: ${err.message}`);
      console.error('获取用户信息错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      '软件开发': '#1890ff',
      '学术论文': '#52c41a',
      '竞赛成果': '#faad14',
      '创新设计': '#f5222d',
      '科研项目': '#722ed1',
      '一级项目': '#13c2c2',
      '教学成果': '#ff7a45'
    };
    return colorMap[category] || '#666';
  };

  const approvedAchievements = author?.achievementList?.filter(achievement => achievement.status === 2) || [];

  const achievementColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/achievement/detail/${record.id}`}>{text}</Link>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => {
        return <Badge status='success' text={'已发布'} />;
      }
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (views) => <span>{views} <EyeOutlined style={{ fontSize: 12 }} /></span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => navigate(`/achievement/detail/${record.id}`)}
        >
          详情
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ background: '#f0f2f5', padding: '24px 5%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </Content>
      </Layout>
    );
  }

  if (error || !author) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ background: '#f0f2f5', padding: '24px 5%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#ff4d4f', fontSize: '16px', marginBottom: '20px' }}>
                {error || '用户信息获取失败'}
              </p>
              <Button type="primary" onClick={() => navigate(-1)}>
                返回上一页
              </Button>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  // 构建完整的头像URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:8090/${avatarPath}`;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <Content style={{ background: '#f0f2f5', padding: '24px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Button 
            type="text" 
            onClick={() => navigate(-1)}
            style={{ marginBottom: 16 }}
          >
            返回上一页
          </Button>
          
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div style={{ marginRight: 40, marginBottom: 24, minWidth: 200, textAlign: 'center' }}>
                <Avatar
                  size={180}
                  src={getAvatarUrl(author.userAvatar)}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 20 }}
                />
                
                <h1 style={{ margin: '0 0 12px', fontSize: 24 }}>{author.realName}</h1>
                <Badge status="success" text={author.userRole || "用户"} />
                
                <Button 
                  type="primary" 
                  style={{ marginTop: 20 }}
                  size="small"
                  onClick={() => navigate(`/chat?userId=${author.userId}`)}
                >
                  联系作者
                </Button>
              </div>
              
              <div style={{ flex: 1, minWidth: 300 }}>
                <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>个人简介</h2>
                
                <div style={{ marginBottom: 32 }}>
                  <p style={{ lineHeight: 1.8, fontSize: 16 }}>
                    {author.bio || '暂无个人简介'}
                  </p>
                </div>
                
                <Divider orientation="left">基本信息</Divider>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20, marginTop: 20 }}>
                  {author.studentNo && (
                    <div>
                      <p style={{ color: '#666', margin: '0 0 6px' }}>学号</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{author.studentNo}</p>
                    </div>
                  )}
                  
                  {author.grade && (
                    <div>
                      <p style={{ color: '#666', margin: '0 0 6px' }}>年级</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{author.grade}</p>
                    </div>
                  )}
                  
                  {author.major && (
                    <div>
                      <p style={{ color: '#666', margin: '0 0 6px' }}>专业</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{author.major}</p>
                    </div>
                  )}
                  
                  {author.email && (
                    <div>
                      <p style={{ color: '#666', margin: '0 0 6px' }}>
                        <MailOutlined style={{ marginRight: 4 }} />邮箱
                      </p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{author.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          <Tabs defaultActiveKey="achievements" size="large">
            <TabPane 
              tab={
                <Space>
                  <TrophyOutlined />
                  <span>发表成果</span>
                  {approvedAchievements.length > 0 && (
                    <Badge count={approvedAchievements.length} />
                  )}
                </Space>
              } 
              key="achievements"
            >
              <Card bordered={false}>
                <Table
                  columns={achievementColumns}
                  dataSource={approvedAchievements}
                  rowKey="id"
                  pagination={{ pageSize: 6 }}
                  locale={{ emptyText: '该作者暂无已展示成果' }}
                />
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthorDetailPage;