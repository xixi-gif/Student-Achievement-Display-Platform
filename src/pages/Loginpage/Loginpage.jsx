import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message, Select } from 'antd';
import { 
  UserOutlined, LockOutlined, 
  BookOutlined, UsergroupAddOutlined, EyeOutlined,
  CloseOutlined
} from '@ant-design/icons'; 
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { authApi } from '../../service/api';

const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const roleOptions = [
    { value: 'student', label: '学生', icon: <UserOutlined /> },
    { value: 'teacher', label: '老师', icon: <BookOutlined /> },
    { value: 'admin', label: '管理员', icon: <UsergroupAddOutlined /> },
    { value: 'visitor', label: '访客', icon: <EyeOutlined /> }
  ];

  const clearError = () => {
    setErrorMessage('');
  };


      const onFinish = async (values) => {
    clearError();
    setLoading(true);
    try {
      const response = await authApi.login({
        userAccount: values.username,  
        password: values.password,     
        role: role                     
      });

      // 关键修改：从 response.data 中获取 token（而非直接从 response 中获取）
      const token = response.data?.token;
      const userInfo = response.data?.userInfo;
      
      if (!token) {
        throw new Error('登录成功但未返回 Token');
      }

      // 正确存储 Token 和用户信息
      localStorage.setItem('token', token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('username', values.username);
      localStorage.setItem('userInfo', JSON.stringify(userInfo || {}));
      
      // 调试：确认存储成功
      console.log('登录后存储的 Token:', localStorage.getItem('token'));
      
      message.success('登录成功，即将进入首页');
    
      setTimeout(() => {
        navigate('/home', { replace: true }); 
      }, 800);
    } catch (error) {
      console.log('登录错误详情:', {
        error: error,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      
      let errorText = '登录失败，请稍后重试';
      
      if (error.response) {
        if (typeof error.response.data === 'object' && error.response.data.message) {
          errorText = error.response.data.message;
        }
        else if (typeof error.response.data === 'object' && error.response.data.description) {
          errorText = error.response.data.description;
        }
        else if (typeof error.response.data === 'string') {
          errorText = error.response.data;
        }
        else if (error.response.status === 401) {
          errorText = '用户名或密码不正确';
        } 
        else if (error.response.status === 403) {
          errorText = '没有权限访问，请检查您的身份';
        }
        else if (error.response.status === 400) {
          errorText = '输入参数错误，请检查您的输入';
        }
        else if (error.response.status === 500) {
          errorText = '服务器内部错误，请稍后重试';
        }
      }
      else if (error.request) {
        errorText = '网络连接失败，请检查网络设置';
      }
      else if (error.message) {
        errorText = error.message;
      }
      
      setErrorMessage(errorText);
      message.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
    const errorText = '请检查输入内容是否符合要求';
    setErrorMessage(errorText);
    message.error(errorText);
  };

  const handleInputChange = () => {
    if (errorMessage) {
      clearError();
    }
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

        {/* 仅红色文字显示错误信息 */}
        {errorMessage && (
          <div style={{
            color: '#f5222d', 
            fontSize: 14,
            textAlign: 'center', 
            marginBottom: 16, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CloseOutlined 
              style={{ marginRight: 6, cursor: 'pointer', fontSize: 14 }} 
              onClick={clearError} 
            />
            <span>{errorMessage}</span>
          </div>
        )}

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
              onChange={(value) => {
                setRole(value);
                handleInputChange();
              }}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
            />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            style={{ 
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Checkbox style={{ margin: 0 }}>记住我</Checkbox>
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