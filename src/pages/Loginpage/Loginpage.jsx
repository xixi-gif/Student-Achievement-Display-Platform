import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message, Select } from 'antd';
import { 
  UserOutlined, LockOutlined, 
  BookOutlined, UsergroupAddOutlined, EyeOutlined 
} from '@ant-design/icons'; 
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { authApi } from '../../service/api';

const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false); 
  const roleOptions = [
    { value: 'student', label: '学生', icon: <UserOutlined /> },
    { value: 'teacher', label: '老师', icon: <BookOutlined /> },
    { value: 'admin', label: '管理员', icon: <UsergroupAddOutlined /> },
    { value: 'visitor', label: '访客', icon: <EyeOutlined /> }
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
  
      const response = await authApi.login({
        userAccount: values.username,  
        password: values.password,     
        role: role                     
      });


      localStorage.setItem('token', response.token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('username', values.username);
      localStorage.setItem('userInfo', JSON.stringify(response.userInfo || {}));
      
      message.success('登录成功，即将进入首页');
    
      // 延迟跳转首页
      setTimeout(() => {
        navigate('/home', { replace: true }); 
      }, 800);
    } catch (error) {
      console.error('登录错误:', error);
      message.error(error.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
    message.error('请检查输入内容是否符合要求');
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '24px'
    }}>
      <Card 
        className="login-card"
        style={{ 
          maxWidth: 400, 
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 8 
        }}
      >
        <div className="login-header" style={{ 
          textAlign: 'center', 
          marginBottom: 24 
        }}>
          <img 
            src={logo} 
            alt="系统 Logo" 
            style={{ height: 48, marginBottom: 16 }} 
          />
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 600, 
            color: 'rgba(0, 0, 0, 0.85)' 
          }}>
            学生成功展示平台
          </h1>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true, role: 'student' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          scrollToFirstError
          layout="vertical"
        >
          <Form.Item
            name="role"
            label="请选择身份"
            rules={[{ required: true, message: '请选择您的身份' }]}
            style={{ marginBottom: 16 }}
          >
            <Select
              value={role}
              onChange={setRole}
              size="large"
              placeholder="请选择身份"
              showSearch
              filterOption={(input, option) => 
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {roleOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                    <span style={{ marginLeft: 8 }}>{item.label}</span>
                  </span>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="username"
            label="邮箱"
            rules={[
              { required: true, message: '请输入用户名/邮箱' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名/邮箱" 
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            style={{ 
              marginBottom: 24,
              display: 'flex',       // 使用flex布局
              justifyContent: 'space-between',  // 两端对齐
              alignItems: 'center'   // 垂直居中对齐
            }}
          >
            <Checkbox style={{ margin: 0 }}>记住我</Checkbox>  {/* 移除默认margin */}
            <a 
              href="/forgot-password" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              忘记密码?
            </a>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              style={{ width: '100%', height: 40, marginBottom: 16 }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          {(role === 'student' || role === 'teacher') && (
            <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
              还没有账号? <a 
                href="/register" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                立即注册
              </a>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
    