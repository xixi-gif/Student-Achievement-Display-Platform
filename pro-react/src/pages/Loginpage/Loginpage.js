import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message, Select, Space } from 'antd';
import { 
  UserOutlined, LockOutlined, 
  BookOutlined, UsergroupAddOutlined, EyeOutlined 
} from '@ant-design/icons'; 
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const { Option } = Select;

const mockLoginAPI = async (role, username, password) => {

  await new Promise(resolve => setTimeout(resolve, 800));
  

  if (role === 'visitor') {
    return { success: true, token: 'visitor-token' };
  }
  
  if (username && password) {
    return { success: true, token: `${role}-token-${username}` };
  } else {
    return { success: false, message: '用户名或密码错误' };
  }
};

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
      const { role, username, password } = values;
      
      const response = await mockLoginAPI(role, username, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_role', role);
        
        message.success(`${role === 'visitor' ? '欢迎访问' : '登录成功'}，正在跳转...`);
        
        setTimeout(() => {
          // navigate(role === 'visitor' ? '/visitor' : '/home');
          navigate('/home');
        }, 800);
      } else {
        message.error(response.message || '登录失败，请重试');
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录过程中发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('登录失败：', errorInfo);
    message.error('请检查输入内容或选择身份');
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
            alt="Logo" 
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
          name="login"
          initialValues={{ remember: true, role: 'student' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          scrollToFirstError
          layout="vertical"
        >
          {/* 身份选择下拉菜单 */}
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

          {/* 账号密码区域 */}
          {role !== 'visitor' && (
            <>
              <Form.Item
                name="username"
                label="用户名/邮箱"
                rules={[
                  { required: true, message: '请输入用户名/邮箱' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined className="site-form-item-icon" />} 
                  placeholder="请输入用户名/邮箱" 
                  size="large"
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
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请输入密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="remember"
                valuePropName="checked"
                style={{ marginBottom: 24 }}
              >
                <Checkbox>记住我</Checkbox>
                <a href="/forgot-password" style={{ float: 'right' }}>
                  忘记密码?
                </a>
              </Form.Item>
            </>
          )}

          {/* 登录按钮 */}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              style={{ 
                width: '100%', 
                height: 40, 
                marginBottom: 16 
              }}
              loading={loading}
            >
              {role === 'visitor' ? '进入平台' : '登录'}
            </Button>
          </Form.Item>

          {/* 注册入口 */}
          {(role === 'student' || role === 'teacher') && (
            <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
              还没有账号? <a href="/register">立即注册</a>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;