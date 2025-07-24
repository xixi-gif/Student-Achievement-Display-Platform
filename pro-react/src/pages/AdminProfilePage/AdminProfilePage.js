import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Avatar, Button, Form, Input, 
 Tag, Upload, Space, Divider, Spin,  message,  Tabs
} from 'antd';
import { 
  UserOutlined, EditOutlined, MailOutlined, 
  PhoneOutlined, IdcardOutlined, LogoutOutlined,
  SafetyOutlined, CrownOutlined,LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { merge } from 'lodash';

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const AdminProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  
  // 管理员信息
  const adminInfoSections = [
    {
      key: 'basic',
      label: '基本信息',
      icon: <IdcardOutlined />,
      items: [
        { label: '管理员ID', field: 'adminId' },
        { label: '姓名', field: 'realName' },
        { label: '职位', field: 'position' },
        { label: '所属部门', field: 'department' }
      ]
    },
    {
      key: 'contact',
      label: '联系信息',
      icon: <MailOutlined />,
      items: [
        { label: '电子邮箱', field: 'email' },
        { label: '联系电话', field: 'phone' }
      ]
    },
    // {
    //   key: 'security',
    //   label: '安全信息',
    //   icon: <SafetyOutlined />,
    //   items: [
    //     { label: '最后登录', field: 'lastLogin' },
    //     { label: '权限等级', field: 'permissionLevel' }
    //   ]
    // }
  ];

  useEffect(() => {
    const loadUserData = () => {
      setLoading(true);
      // 模拟API请求延迟
      setTimeout(() => {
        const defaultData = {
          role: 'admin', username: '系统管理员',   adminId: '',  realName: '',   position: '',
          department: '',     email: '',      phone: '',
          lastLogin: new Date().toLocaleString(),
          permissionLevel: '超级管理员',
          avatar: null
        };
        
        // 合并本地存储数据
        const savedData = JSON.parse(localStorage.getItem('admin_profile') || '{}');
        const mergedData = merge({}, defaultData, savedData);
        
        setCurrentUser(mergedData);
        form.setFieldsValue(mergedData);
        setLoading(false);
      }, 500);
    };
    
    loadUserData();
  }, [form]);

  const handleSave = () => {
    form.validateFields()
      .then(values => {
        const updatedUser = { ...currentUser, ...values };
        
        // 保存到本地存储
        localStorage.setItem('admin_profile', JSON.stringify(updatedUser));
        
        setCurrentUser(updatedUser);
        message.success('个人信息已保存');
        setEditMode(false);
      })
      .catch(err => {
        console.error('表单验证失败:', err);
      });
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      // 实际项目中替换为真实URL
      const avatarUrl = info.file.response?.url || 
        `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
      
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      setCurrentUser(updatedUser);
      form.setFieldsValue({ avatar: avatarUrl });
      localStorage.setItem('admin_profile', JSON.stringify(updatedUser));
      
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    
    return isImage && isLt2M;
  };

  if (loading || !currentUser) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar currentUser={{ role: 'admin' }} />
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" tip="加载管理员信息..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ padding: '24px 5%', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card
            title="管理员信息中心"
            bordered={false}
            extra={
              editMode ? (
                <Space>
                  <Button onClick={() => {
                    form.resetFields();
                    setEditMode(false);
                  }}>
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleSave}
                  >
                    保存
                  </Button>
                </Space>
              ) : (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => setEditMode(true)}
                >
                  编辑资料
                </Button>
              )
            }
          >
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {/* 头像区域 */}
              <div style={{ 
                width: 200, 
                marginRight: 32,
                textAlign: 'center'
              }}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={beforeAvatarUpload}
                  onChange={handleAvatarChange}
                  disabled={!editMode}
                >
                  {currentUser.avatar ? (
                    <Avatar
                      size={160}
                      src={currentUser.avatar}
                      icon={<UserOutlined />}
                    />
                  ) : (
                    <div>
                      <UserOutlined style={{ fontSize: 48 }} />
                      <div>{editMode ? '上传头像' : '暂无头像'}</div>
                    </div>
                  )}
                </Upload>
                
                <h3 style={{ marginTop: 16 }}>{currentUser.username}</h3>
                <Tag 
                  icon={<CrownOutlined />} 
                  color="gold"
                >
                  {currentUser.permissionLevel}
                </Tag>
              </div>
              
              {/* 表单区域 */}
              <div style={{ flex: 1, minWidth: 300 }}>
                <Tabs defaultActiveKey="basic">
                  {adminInfoSections.map(section => (
                    <TabPane
                      key={section.key}
                      tab={
                        <span>
                          {section.icon}
                          {section.label}
                        </span>
                      }
                    >
                      <Form
                        form={form}
                        layout="vertical"
                        disabled={!editMode}
                      >
                        {section.items.map(item => (
                          <Form.Item
                            key={item.field}
                            name={item.field}
                            label={item.label}
                            rules={[
                              { required: true, message: `请输入${item.label}` }
                            ]}
                          >
                            {item.field === 'phone' ? (
                              <Input 
                                prefix={<PhoneOutlined />}
                                placeholder={`请输入${item.label}`}
                              />
                            ) : item.field === 'email' ? (
                              <Input 
                                prefix={<MailOutlined />}
                                placeholder={`请输入${item.label}`}
                              />
                            ) : (
                              <Input placeholder={`请输入${item.label}`} />
                            )}
                          </Form.Item>
                        ))}
                      </Form>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            </div>
          </Card>
          
          {/* 安全操作区域 */}
          <Card
            title="安全设置"
            bordered={false}
            style={{ marginTop: 24 }}
          >
            <Space direction="vertical" size="middle">
              <Button 
                type="primary" 
                icon={<LockOutlined />}
              >
                修改密码
              </Button>
              
              <Button 
                danger 
                icon={<LogoutOutlined />}
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                退出登录
              </Button>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminProfile;