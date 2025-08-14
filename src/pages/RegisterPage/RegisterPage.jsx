import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { authApi } from '../../service/api'; 

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
   
      const registerData = {
        userName: values.username,     
        email: values.email,      
        password: values.password,   
        phone: values.phone             
      };


      const result = await authApi.register(registerData);
      
      message.success('注册成功，请登录');
      setTimeout(() => {
        navigate('/login'); 
      }, 1500);

    } catch (error) {
      message.error(error.message || '注册失败，请重试');
      console.error('注册错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
    message.error('请检查输入内容是否符合要求');
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
              { required: true, message: '请输入姓名' },
              { min: 2, message: '姓名至少2个字符' },
              { max: 20, message: '姓名最多20个字符' },
              { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '姓名只能包含汉字、字母和数字' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="姓名" 
              size="large"
              disabled={loading}
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
              placeholder="邮箱（作为登录账号）" 
              size="large"
              disabled={loading}
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
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8个字符' }, // 与后端密码长度要求一致
              { max: 32, message: '密码最多32个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码（至少8个字符）"
              size="large"
              disabled={loading}
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
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              style={{ width: '100%', height: 40, marginBottom: 16 }}
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
            已有账号? <a href="/login" onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}>立即登录</a>
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
