import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import TextArea from 'antd/es/input/TextArea';

const { Content, Footer } = Layout;
const { Title } = Typography;
const { Item } = Form;

const AnnouncementPublish = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentUser = { role: 'admin', username: '管理员' };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const newAnnouncement = {
        id: Date.now(),
        title: values.title,
        content: values.content,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        author: currentUser.username
      };
      setTimeout(() => {
        message.success('公告发布成功');
        setLoading(false);
        navigate('/announcements');
      }, 800);
    } catch (error) {
      setLoading(false);
      message.error('发布失败，请检查输入内容');
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
            onClick={() => navigate('/annoucementlist')}
            style={{ marginBottom: 16 }}
          >
            返回公告列表
          </Button>
          
          <Card bordered={false}>
            <Title level={2} style={{ marginBottom: 24 }}>发布新公告</Title>
            
            <Form
              form={form}
              layout="vertical"
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
                    onClick={() => navigate('/annoucementlist')}
                  >
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={handleSubmit}
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
    