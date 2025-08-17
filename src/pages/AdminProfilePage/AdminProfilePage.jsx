import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Avatar, Button, Form, Input, 
  Tag, Upload, Space, Divider, Spin, message, Tabs,
  Modal
} from 'antd';
import { 
  UserOutlined, EditOutlined, MailOutlined, 
  PhoneOutlined, IdcardOutlined, LogoutOutlined,
  CrownOutlined, LockOutlined, LoadingOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { adminApi, authApi } from '../../service/api';

const { Content } = Layout;
const { TabPane } = Tabs;

const DEFAULT_USER = {
  role: 'admin', 
  username: '系统管理员',   
  adminId: '',  
  realName: '',   
  position: '',
  department: '',     
  email: '',      
  phone: '',
  lastLogin: new Date().toLocaleString(),
  permissionLevel: '超级管理员',
  avatar: null
};

const ERROR_CODES = {
  STUDENT_NOT_FOUND: 404,
  TOKEN_INVALID: 401
};

const AdminProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false); 

  // 管理员信息分组
  const adminInfoSections = [
    {
      key: 'basic',
      label: '基本信息',
      icon: <IdcardOutlined />,
      items: [
        { label: '管理员ID', field: 'adminId', disabled: true },
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
  ];

  useEffect(() => {
    fetchUserProfile();
  }, [form]);


  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const response = await adminApi.getProfile();
      
      if (response.code === 0) {
        const userData = { ...DEFAULT_USER, ...cachedUser, ...response.data };
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setCurrentUser(userData);
        form.setFieldsValue(userData);
      } else {
        throw { code: response.code, message: response.message || "获取用户资料失败" };
      }
    } catch (error) {
      console.error('获取用户资料错误:', error);
      const { code, message: errorMsg } = error;
      
      if (code === ERROR_CODES.STUDENT_NOT_FOUND) { 
        message.error("管理员信息不存在");
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      if (code === ERROR_CODES.TOKEN_INVALID) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('user_role');
        message.error("登录已过期，请重新登录");
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      const cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (Object.keys(cachedUser).length > 0) {
        const userData = { ...DEFAULT_USER, ...cachedUser };
        setCurrentUser(userData);
        form.setFieldsValue(userData);
        message.warning(`获取资料失败，已加载本地缓存：${errorMsg || error.message}`);
      } else {
        setCurrentUser(DEFAULT_USER);
        message.error(`获取资料失败：${errorMsg || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleSave = () => {
    form.validateFields()
      .then(values => {
        const updatedUser = { ...currentUser, ...values };

        localStorage.setItem('admin_profile', JSON.stringify(updatedUser));
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        
        setCurrentUser(updatedUser);
        message.success('个人信息已保存');
        setEditMode(false);
      })
      .catch(err => {
        console.error('表单验证失败:', err);
        message.error('表单填写有误，请检查后重试');
      });
  };

  const handleAvatarChange = async (info) => {
   
    if (info.file.status === 'uploading') {
      setUploading(true);
      message.loading('头像上传中...', 0);
      return;
    }

    if (info.file.status === 'done') {
      message.destroy();
      try {
        const response = info.file.response;
        if (response?.code === 0 && response?.data?.url) {
          const avatarUrl = response.data.url;
          const updatedUser = { ...currentUser, avatar: avatarUrl };

          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          form.setFieldsValue({ avatar: avatarUrl });
          
          message.success(response.message || '头像上传成功');
        } else {
          throw new Error(response?.message || '头像上传失败');
        }
      } catch (error) {
        console.error('头像处理失败:', error);
        message.error(error.message || '头像处理失败，请重试');
      } finally {
        setUploading(false);
      }
    }


    if (info.file.status === 'error') {
      setUploading(false);
      message.destroy();

      if (info.file.error?.status === 404) {
        message.error('上传接口不存在，请检查配置');
        setShowApiConfig(true);
      } else {
        message.error('上传失败，请检查网络或文件格式');
      }
    }
  };

  const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }

    const isSupportedFormat = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    if (!isSupportedFormat) {
      message.error('仅支持JPG、PNG、GIF格式的图片');
      return false;
    }
    

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    
    return true;
  };


  const renderUploadButton = () => {
    if (uploading) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <LoadingOutlined style={{ fontSize: 24 }} />
          <div style={{ marginTop: 8 }}>上传中</div>
        </div>
      );
    }
    
    if (currentUser?.avatar) {
      return (
        <Avatar
          size={160}
          src={currentUser.avatar}
          shape='square'
          icon={<UserOutlined />}
          style={{ 
            marginBottom: 16, 
            width: '100%', 
            height: 'auto', 
            objectFit: 'cover',
            border: '2px solid #f0f0f0'
          }}
        />
      );
    }
    
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <UserOutlined style={{ fontSize: 48, color: '#999' }} />
        <div style={{ marginTop: 8, color: '#666' }}>{editMode ? '上传头像' : '暂无头像'}</div>
      </div>
    );
  };



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
                    setUploading(false);
                  }}>
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleSave}
                    loading={uploading}
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
            <Spin spinning={loading}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* 头像区域（与ProfilePage风格一致） */}
                <div style={{ 
                  width: 200, 
                  marginRight: 32,
                  marginBottom: 24
                }}>
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={beforeAvatarUpload}
                    onChange={handleAvatarChange}
                    disabled={!editMode || uploading}
                    // 关键：使用customRequest自定义上传，与ProfilePage保持一致
                    customRequest={({ file, onSuccess, onError }) => {
                      // 调用上传接口，传入文件
                      authApi.uploadAvatar(file)
                        .then(response => onSuccess(response, file))
                        .catch(error => onError(error, file));
                    }}
                  >
                    {renderUploadButton()}
                    {editMode && <div style={{ textAlign: 'center' }}>更换头像</div>}
                  </Upload>
                  
                  {editMode && (
                    <>
                      <p style={{ 
                        marginTop: 12, 
                        fontSize: 12, 
                        color: '#666',
                        marginBottom: 0,
                        textAlign: 'center'
                      }}>
                        支持JPG、PNG、GIF格式，大小不超过2MB
                      </p>
                    </>
                  )}
                  
                  <h3 style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
                    {currentUser?.username || '系统管理员'}
                  </h3>
                  <Tag 
                    icon={<CrownOutlined />} 
                    color="gold"
                    style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                  >
                    {currentUser?.permissionLevel || '超级管理员'}
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
                          initialValues={currentUser}
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
                              <Input 
                                placeholder={`请输入${item.label}`}
                                prefix={
                                  item.field === 'phone' ? <PhoneOutlined /> : 
                                  item.field === 'email' ? <MailOutlined /> : null
                                }
                                disabled={item.disabled || false}
                              />
                            </Form.Item>
                          ))}
                        </Form>
                      </TabPane>
                    ))}
                  </Tabs>
                </div>
              </div>
            </Spin>
          </Card>
          
          {/* 安全操作区域 */}
          <Card
            title="安全设置"
            bordered={false}
            style={{ marginTop: 24 }}
          >
            <Space direction="vertical" size="middle">
              
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