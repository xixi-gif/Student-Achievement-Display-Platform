import React, { useState, useEffect } from 'react';
import { Layout, Typography, Divider, Card, Button, Space, Badge, BackTop, Spin, message } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar';
import { announcementApi } from '../../service/api'; // 导入公告接口

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = { 
    role: localStorage.getItem('role') || 'visitor', 
    username: localStorage.getItem('username') || '访客' 
  };

  useEffect(() => {
    fetchAnnouncementDetail();
  }, [id]);

  const fetchAnnouncementDetail = async () => {
    setLoading(true);
    try {
      // 调用公告详情接口
      const response = await announcementApi.getDetail(id);
      
      if (response.code === 0) {
        // 转换接口返回数据格式
        const formattedData = {
          id: response.data.announcementId,
          title: response.data.title,
          content: response.data.content,
          createTime: response.data.createTime,
          author: response.data.author || '管理员',
          viewCount: response.data.viewCount || 0
        };
        setAnnouncement(formattedData);
      } else {
        message.error(response.message || '获取公告详情失败');
      }
    } catch (error) {
      console.error('获取公告详情失败:', error);
      message.error('获取公告详情失败');
    } finally {
      setLoading(false);
    }
  };

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
                  <Text><CalendarOutlined /> {formatDate(announcement.createTime)}</Text>
                  <Text>发布者: {announcement.author}</Text>
                  <Text>浏览数: {announcement.viewCount}</Text>
                </Space>
              </div>
              
              <Divider />
              
              <div style={{ minHeight: 300, padding: '0 24px', lineHeight: '2.0', fontSize: 16 }}>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{announcement.content}</Paragraph>
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
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
      
      <BackTop />
    </Layout>
  );
};

export default AnnouncementDetail;