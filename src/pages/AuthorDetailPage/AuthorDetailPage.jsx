import React from 'react';
import { Layout, Card, Avatar, Badge, Tabs, Table, Tag, Divider, Space, Button } from 'antd';
import { TrophyOutlined, EyeOutlined, UserOutlined, BookOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { TabPane } = Tabs;

const AuthorDetailPage = () => {
  const navigate = useNavigate();
  
  // 写死的作者数据 - 张明（学生）
  const author = {
    id: 1,
    username: "zhangming",
    role: "student",
    realName: "张明",
    studentId: "2021001234",
    major: "计算机科学与技术",
    grade: "大三",
    email: "zhangming@example.com",
    phone: "13800138000",
    bio: "热爱编程与人工智能，参与多项校级科研项目，曾获全国大学生数学建模竞赛一等奖。擅长Python、Java和React等技术，目前专注于深度学习在计算机视觉领域的应用研究。",
    avatar: "https://picsum.photos/id/1012/200/200",
    achievements: [
      {
        id: 1,
        title: "基于深度学习的校园垃圾分类系统研究",
        category: "毕业论文",
        status: "已展示",
        date: "2023-10-15",
        views: 128,
        isFeatured: true
      },
      {
        id: 3,
        title: "全国大学生数学建模竞赛一等奖",
        category: "竞赛作品",
        status: "已展示",
        date: "2023-08-12",
        views: 203,
        isFeatured: true
      }
    ]
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      '毕业论文': '#1890ff',
      '一级项目': '#52c41a',
      '竞赛作品': '#faad14',
      '技术专利': '#f5222d',
      '期刊论文': '#722ed1',
      '课程作业': '#13c2c2',
      '教学成果': '#ff7a45'
    };
    return colorMap[category] || '#666';
  };

  // 过滤出已审核的成果
  const approvedAchievements = author.achievements.filter(achievement => achievement.status === '已展示');

  const achievementColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/achievement/${record.id}`}>{text}</Link>
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
      render: (status) => (
        <Badge status="success" text={status} />
      )
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      key: 'date'
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
          onClick={() => navigate(`/achievement/detail`)}
        >
          详情
        </Button>
      )
    }
  ];

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
                  src={author.avatar}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 20 }}
                />
                
                <h1 style={{ margin: '0 0 12px', fontSize: 24 }}>{author.realName}</h1>
                <Badge status="success" text="学生" />
                
                <Button 
                  type="primary" 
                  style={{ marginTop: 20 }}
                  size="small"
                  onClick={() => navigate(`/chat`)}
                >
                  联系作者
                </Button>
              </div>
              
              <div style={{ flex: 1, minWidth: 300 }}>
                <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>个人简介</h2>
                
                <div style={{ marginBottom: 32 }}>
                  <p style={{ lineHeight: 1.8, fontSize: 16 }}>
                    {author.bio}
                  </p>
                </div>
                
                <Divider orientation="left">基本信息</Divider>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20, marginTop: 20 }}>
                  <div>
                    <p style={{ color: '#666', margin: '0 0 6px' }}>学号</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{author.studentId}</p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#666', margin: '0 0 6px' }}>年级</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{author.grade}</p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#666', margin: '0 0 6px' }}>专业</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{author.major}</p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#666', margin: '0 0 6px' }}>
                      <MailOutlined style={{ marginRight: 4 }} />邮箱
                    </p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{author.email}</p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#666', margin: '0 0 6px' }}>
                      <PhoneOutlined style={{ marginRight: 4 }} />电话
                    </p>
                    <p style={{ margin: 0, fontWeight: 500 }}>{author.phone}</p>
                  </div>
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
                  locale={{ emptyText: '该作者暂无已审核成果展示' }}
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