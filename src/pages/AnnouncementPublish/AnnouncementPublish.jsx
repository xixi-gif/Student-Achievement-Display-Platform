import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import TextArea from 'antd/es/input/TextArea';
import { announcementApi } from '../../service/api';

const { Content, Footer } = Layout;
const { Title } = Typography;
const { Item } = Form;

const AnnouncementPublish = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentUser = { 
  id: localStorage.getItem('userId'), // 必须获取真实用户ID
  role: localStorage.getItem('role') || 'admin',
  username: localStorage.getItem('username') || '管理员'
};

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const requestData = {
      title: values.title,
      content: values.content,
      publisherId: currentUser.id,
    };

    // 调用发布接口
    const response = await announcementApi.createAnnouncement(requestData)
    if(response.code === 0){
        message.success('公告发布成功');
        setLoading(false);
        navigate('/announcements');
      }
    } catch (error) {
      message.error({
      content: `发布失败: ${error.response?.data?.message || error.message}`,
      duration: 3
  });
    }finally{
        setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ padding: '0 50px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', padding: 32, marginTop: 24, borderRadius: 8, marginBottom: 24 }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/announcements')}
            style={{ marginBottom: 16 }}
          >
            返回公告列表
          </Button>
          
          <Card bordered={false}>
            <Title level={2} style={{ marginBottom: 24 }}>发布新公告</Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ remember: true }}
            >
              <Item
                name="title"
                label="公告标题"
                rules={[{ required: true, message: '请输入公告标题' }, { max: 100, message: '标题不能超过100个字符' }]}
              >
                <Input placeholder="请输入公告标题" maxLength={100} />
              </Item>
              
              <Item
                name="content"
                label="公告内容"
                rules={[{ required: true, message: '请输入公告内容' }, { min: 10, message: '内容不能少于10个字符' }]}
              >
                <TextArea 
                  placeholder="请输入公告详细内容" 
                  rows={12} 
                  style={{ resize: 'vertical' }}
                />
              </Item>
              
              <Item style={{ textAlign: 'right', marginTop: 24 }}>
                <Space size="middle">
                  <Button 
                    onClick={() => navigate('/announcements')}
                  >
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    htmlType="submit"
                    loading={loading}
                  >
                    发布公告
                  </Button>
                </Space>
              </Item>
            </Form>
          </Card>
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  );
};

export default AnnouncementPublish;
    