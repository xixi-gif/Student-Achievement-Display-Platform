import React from 'react';
import { 
  Layout, Card, Form, Input, Button, Divider,
  Popconfirm, message, Spin
} from 'antd';
import { 
  LockOutlined, LogoutOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { authApi  } from '../../service/api'; // 导入api接口

const { Content } = Layout;
const { Item } = Form;

const staticUser = {
  username: 'zhangming2023',
  realName: '张明',
  role: 'student'
};

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false); // 加载状态

  React.useEffect(() => {
    form.setFieldsValue({ username: staticUser.username });
  }, [form]);


  const handlePasswordChange = async () => {
    try {
      const values = await form.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的新密码不一致');
        return;
      }
  
      setLoading(true);
      const response = await authApi.updatePassword(
        values.oldPassword, 
        values.newPassword
      );
    
      if (response?.success) {
        message.success('密码修改成功，请重新登录');
        form.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        message.error(response?.message || '密码修改失败，请重试');
      }
    } catch (error) {
      if (error.name === 'ValidateError') {

        return;
      }
      console.error('密码修改错误:', error);
      if (error.response) {
        message.error(error.response.data?.message || `错误：${error.response.status}`);
      } else if (error.request) {
        message.error('网络错误，请检查网络连接');
      } else {
        message.error('操作失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={staticUser} />
      
      <Content style={{ 
        background: '#f0f2f5', 
        padding: '24px 5%',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <div style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          minHeight: 'calc(100% - 48px)'
        }}>
          <Card 
            title="账号设置" 
            bordered={false}
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/profile')}
              >
                返回个人资料
              </Button>
            }
            style={{ 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderRadius: 4
            }}
          >
            <Form 
              form={form} 
              layout="vertical" 
              initialValues={{ username: staticUser.username }}
            >
              {/* 账号信息区域 */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  margin: '0 0 16px', 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: 16,
                  color: '#1f2329'
                }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  账号信息
                </h3>
                <Item 
                  label="登录账号" 
                  name="username" 
                  rules={[{ required: true, message: '账号不能为空' }]}
                >
                  <Input 
                    disabled 
                    placeholder="登录账号" 
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </Item>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              {/* 密码修改区域 */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  margin: '0 0 16px', 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: 16,
                  color: '#1f2329'
                }}>
                  <LockOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  密码修改
                </h3>
                <Item 
                  label="原密码" 
                  name="oldPassword" 
                  rules={[
                    { required: true, message: '请输入原密码' },
                    { min: 8, message: '密码长度不能少于8位' } 
                  ]}
                >
                  <Input.Password 
                    placeholder="请输入原密码" 
                    disabled={loading}
                  />
                </Item>
                <Item 
                  label="新密码" 
                  name="newPassword" 
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '密码长度不能少于8位' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        // 避免与原密码相同
                        if (value && getFieldValue('oldPassword') === value) {
                          return Promise.reject(new Error('新密码不能与原密码相同'));
                        }
                        return Promise.resolve();
                      }
                    })
                  ]}
                >
                  <Input.Password 
                    placeholder="请输入新密码（至少8位）" 
                    disabled={loading}
                  />
                </Item>
                <Item 
                  label="确认新密码" 
                  name="confirmPassword" 
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value && getFieldValue('newPassword') !== value) {
                          return Promise.reject(new Error('两次输入的新密码不一致'));
                        }
                        return Promise.resolve();
                      }
                    })
                  ]}
                >
                  <Input.Password 
                    placeholder="请再次输入新密码" 
                    disabled={loading}
                  />
                </Item>
                <Item>
                  <Button 
                    type="primary" 
                    onClick={handlePasswordChange}
                    style={{ marginRight: 16 }}
                    loading={loading}
                  >
                    <Spin spinning={loading} size="small" />
                    保存修改
                  </Button>
                  <Button 
                    onClick={() => form.resetFields(['oldPassword', 'newPassword', 'confirmPassword'])}
                    disabled={loading}
                  >
                    取消
                  </Button>
                </Item>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              {/* 安全操作区域 */}
              <div style={{ 
                textAlign: 'center', 
                padding: '20px 0',
                borderTop: '1px solid #f0f0f0',
                marginTop: 16
              }}>
                <h3 style={{ 
                  margin: '0 0 24px',
                  fontSize: 16,
                  color: '#1f2329'
                }}>安全操作</h3>
                <Popconfirm
                  title="确定要退出当前账号吗？"
                  onConfirm={handleLogout}
                  okText="确定"
                  cancelText="取消"
                  placement="left"
                >
                  <Button 
                    danger 
                    icon={<LogoutOutlined />}
                    size="large"
                    disabled={loading} 
                  >
                    退出登录
                  </Button>
                </Popconfirm>
              </div>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AccountSettingsPage;