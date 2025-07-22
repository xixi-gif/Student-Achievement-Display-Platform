import React from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log('注册成功:', values);
    
    setTimeout(() => {
      message.success('注册成功，请登录');
      navigate('/login'); 
    }, 800);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('注册失败:', errorInfo);
    message.error('请检查输入内容');
  };

  return (
    <div className="register-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '24px'
    }}>
      <Card 
        className="register-card"
        style={{ 
          maxWidth: 400, 
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 8 
        }}
      >
        <div className="register-header" style={{ 
          textAlign: 'center', 
          marginBottom: 24 
        }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              height: 48, 
              marginBottom: 16 
            }} 
          />
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 600, 
            color: 'rgba(0, 0, 0, 0.85)' 
          }}>
            注册
          </h1>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          scrollToFirstError
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="site-form-item-icon" />} 
              placeholder="邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined className="site-form-item-icon" />} 
              placeholder="手机号" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              style={{ width: '100%', height: 40, marginBottom: 16 }}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
            已有账号? <a href="/login">立即登录</a>
          </div>
        </Form>

        <div style={{ 
          marginTop: 24, 
          borderTop: '1px solid #f0f0f0', 
          paddingTop: 16,
          textAlign: 'center'
        }}>
          <Space size={24}>
            <a href="#" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              <span className="anticon anticon-wechat" style={{ fontSize: 20 }} />
            </a>
            <a href="#" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              <span className="anticon anticon-qq" style={{ fontSize: 20 }} />
            </a>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;  