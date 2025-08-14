import React from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const onFinish = (values) => {
    console.log('重置密码:', values);
    
    setTimeout(() => {
      message.success('密码重置成功，请使用新密码登录');
      navigate('/login'); 
    }, 800);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('操作失败:', errorInfo);
    message.error('请检查输入内容');
  };

  return (
    <div className="forgot-password-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '24px'
    }}>
      <Card 
        className="forgot-password-card"
        style={{ 
          maxWidth: 400, 
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 8 
        }}
      >
        <div className="forgot-password-header" style={{ 
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
            找回密码
          </h1>
        </div>

        <Form
          form={form}
          name="forgotPassword"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          scrollToFirstError
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="site-form-item-icon" />} 
              placeholder="注册邮箱" 
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
              placeholder="注册手机号" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="确认新密码"
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
              重置密码
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
            想起密码了? <a href="/login">立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;  