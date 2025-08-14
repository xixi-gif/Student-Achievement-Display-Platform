import React, { useState, useEffect } from 'react';
import { Layout, Typography, Divider, Card, Button, Space, Badge, BackTop, Spin } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// 写死的公告数据
const fixedAnnouncements = [
  {
    id: 1,
    title: '系统更新通知',
    content: '为提升用户体验，平台将于2023年12月31日23:00-次日02:00进行系统更新维护。维护期间可能无法正常访问，敬请谅解。更新内容包括：1. 优化页面加载速度；2. 修复已知bug；3. 新增数据导出功能。如有紧急问题，请联系技术支持：service@example.com。',
    createTime: '2023-12-28 09:30:00',
    author: '系统管理员'
  },
  {
    id: 2,
    title: '学期成果展示安排',
    content: '本学期成果展示活动将于2024年1月15日至1月20日举行，具体安排如下：1. 1月15日-1月18日：线上展示阶段；2. 1月19日-1月20日：线下评审阶段。请各班级于1月10日前完成成果提交，提交方式：登录平台后进入"成果管理"模块上传相关材料。展示评分标准已更新至平台公告栏，请注意查看。',
    createTime: '2023-12-25 14:20:00',
    author: '教学管理部'
  },
  {
    id: 3,
    title: '平台使用指南',
    content: '欢迎使用学生成果展示平台，为帮助您快速掌握平台功能，现提供以下使用指南：1. 账号注册：使用学号/工号作为用户名，初始密码为身份证后六位；2. 个人中心：可修改个人信息、密码及上传头像；3. 成果管理：支持上传文档、图片、视频等多种格式的成果材料；4. 消息通知：系统会通过站内信推送重要通知，请定期查看。如有使用问题，可通过首页"帮助中心"获取更多信息。',
    createTime: '2023-12-20 10:15:00',
    author: '运营团队'
  }
];

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = { role: 'student', username: '用户' };

  useEffect(() => {
    setLoading(true);
    // 模拟加载延迟
    setTimeout(() => {
      // 从固定数据中查找对应ID的公告
      const targetAnnouncement = fixedAnnouncements.find(item => item.id === Number(id));
      setAnnouncement(targetAnnouncement);
      setLoading(false);
    }, 800);
  }, [id]);

  const formatDate = (dateStr) => {
    return moment(dateStr).format('YYYY年MM月DD日 HH:mm');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ padding: '0 50px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', padding: 32, marginTop: 24, borderRadius: 8, marginBottom: 24 }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ marginBottom: 16 }}
          >
            返回列表
          </Button>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : announcement ? (
            <Card bordered={false}>
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <Title level={2}>{announcement.title}</Title>
                <Space size="middle" style={{ color: '#8c8c8c', marginTop: 12 }}>
                  <Text icon={<CalendarOutlined />}>{formatDate(announcement.createTime)}</Text>
                  <Text>发布者: {announcement.author}</Text>
                </Space>
              </div>
              
              <Divider />
              
              <div style={{ minHeight: 300, padding: '0 24px', lineHeight: '2.0', fontSize: 16 }}>
                <Paragraph>{announcement.content}</Paragraph>
              </div>
              
              <Divider />
              
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Button 
                  type="primary" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate(-1)}
                >
                  返回列表
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Badge status="error" text="该公告不存在或已被删除" />
              <Button 
                type="primary" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                style={{ marginTop: 20 }}
              >
                返回列表
              </Button>
            </div>
          )}
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
      
      <BackTop />
    </Layout>
  );
};

export default AnnouncementDetail;