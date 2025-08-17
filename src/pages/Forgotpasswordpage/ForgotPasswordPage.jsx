import React from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { authApi } from '../../service/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const requestData = {
        email: values.email,
        phone: values.phone,
        newPassword: values.newPassword,
        checkNewPassword: values.confirmPassword
      };
      const response = await authApi.resetpassword(requestData);
      if (response?.success) {
        message.success('密码重置成功，请使用新密码登录');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        message.error(response?.message || '密码重置失败，请稍后重试');
      }
    } catch (error) {
      console.error('重置密码错误:', error);
      if (error.response) {
        message.error(error.response.data?.message || `错误: ${error.response.status}`);
      } else if (error.request) {
        message.error('网络错误，请检查连接');
      } else {
        message.error('操作失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
    message.error('请检查输入内容是否正确');
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
            alt="系统Logo" 
            style={{ height: 48, marginBottom: 16 }} 
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
              placeholder="注册手机号" 
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码至少8个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="新密码"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue('newPassword') === value 
                    ? Promise.resolve() 
                    : Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="确认新密码"
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
              <Spin spinning={false} size="small" />
              重置密码
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
            想起密码了? <a href="/login" onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}>立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;