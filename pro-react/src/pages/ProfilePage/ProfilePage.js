import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Avatar, Button, Tabs, Form, Input, 
  Table, Badge, Tag, Upload, Space, Divider, Spin,
  message, Popconfirm
} from 'antd';
import { 
  UserOutlined, EditOutlined, MailOutlined, PhoneOutlined,
  UploadOutlined, LockOutlined, LogoutOutlined, EyeOutlined, 
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const myAchievements = [
  {
    id: 1,
    title: "基于深度学习的校园垃圾分类系统研究",
    category: "毕业论文",
    status: "已展示",
    date: "2023-10-15",
    views: 128,
    isFeatured: true
  },
  {
    id: 2,
    title: "校园智能导航APP设计与实现",
    category: "一级项目",
    status: "审核中",
    date: "2023-09-28",
    views: 45,
    isFeatured: false
  },
  {
    id: 3,
    title: "全国大学生数学建模竞赛一等奖",
    category: "竞赛作品",
    status: "已展示",
    date: "2023-08-12",
    views: 203,
    isFeatured: true
  }
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'student';
      const username = localStorage.getItem('username') || '张明';
      
      // 从本地存储获取保存的用户信息，初始为空
      const savedInfo = JSON.parse(localStorage.getItem('user_info') || 'null');
      
      // 初始数据为空对象，仅保留必要的身份信息
      const userInfo = savedInfo || {
        role,
        username,
        realName: "",
        studentId: "",
        major: "",
        grade: "",
        email: "",
        phone: "",
        bio: "",
        avatar: ""
      };
      
      setCurrentUser(userInfo);
      form.setFieldsValue(userInfo);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [form]);
  
  const achievementColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/achievement/${record.id}`)}>{text}</a>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === '已展示' ? 'success' : 'processing'} text={status} />
      )
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (views) => <span>{views} <EyeOutlined style={{ fontSize: 12 }} /></span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => navigate(`/achievement/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            danger 
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
  
  function getCategoryColor(category) {
    const colorMap = {
      '毕业论文': '#1890ff',
      '一级项目': '#52c41a',
      '竞赛作品': '#faad14',
      '技术专利': '#f5222d',
      '期刊论文': '#722ed1',
      '课程作业': '#13c2c2'
    };
    return colorMap[category] || '#666';
  }
  
  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        // 合并身份信息和表单数据
        const updatedUser = { ...currentUser, ...values };
        // 保存到本地存储
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
        // 更新状态
        setCurrentUser(updatedUser);
        message.success('个人信息保存成功');
        setEditMode(false);
      })
      .catch(info => {
        console.log(info);
      });
  };
  
  const handleDelete = (id) => {
    message.success(`成果 ${id} 已删除`);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    message.success('退出登录成功');
    navigate('/login');
  };
  
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      // 模拟头像URL保存
      const avatarUrl = info.file.response?.url || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200/200`;
      
      // 更新并保存头像信息
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      form.setFieldsValue({ avatar: avatarUrl });
      
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  if (!currentUser || loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar currentUser={currentUser} />
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ background: '#f0f2f5', padding: '24px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card 
            title="个人资料" 
            bordered={false}
            extra={
              editMode ? (
                <Space size="middle">
                  <Button 
                    onClick={() => {
                      form.resetFields();
                      setEditMode(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleFormSubmit}
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
            style={{ marginBottom: 24 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div style={{ marginRight: 32, marginBottom: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload/avatar"
                    onChange={handleAvatarChange}
                    disabled={!editMode}
                  >
                    {currentUser.avatar ? (
                      <Avatar
                        size={160}
                        src={currentUser.avatar}
                        style={{ marginBottom: 16 }}
                      />
                    ) : (
                      <div style={{ padding: '36px 0' }}>
                        <UserOutlined style={{ fontSize: 48 }} />
                        <div>{editMode ? '上传头像' : '暂无头像'}</div>
                      </div>
                    )}
                    {editMode && <div>更换头像</div>}
                  </Upload>
                  
                  <h2 style={{ margin: '16px 0 8px' }}>{currentUser.username}</h2>
                  <Badge status="success" text={currentUser.role === 'student' ? '学生' : '教师'} />
                </div>
              </div>
              
              <div style={{ flex: 1, minWidth: 300 }}>
                <Form
                  form={form}
                  layout="vertical"
                  disabled={!editMode}
                  initialValues={currentUser}
                >
                  <Form.Item
                    name="realName"
                    label="真实姓名"
                    rules={[{ required: true, message: '请输入真实姓名' }]}
                  >
                    <Input placeholder="请输入真实姓名" />
                  </Form.Item>
                  
                  {currentUser.role === 'student' && (
                    <Form.Item
                      name="studentId"
                      label="学号"
                      rules={[{ required: true, message: '请输入学号' }]}
                    >
                      <Input placeholder="请输入学号" />
                    </Form.Item>
                  )}
                  
                  <Form.Item
                    name="major"
                    label="专业/部门"
                    rules={[{ required: true, message: '请输入专业或部门' }]}
                  >
                    <Input placeholder="请输入专业或部门" />
                  </Form.Item>
                  
                  {currentUser.role === 'student' && (
                    <Form.Item
                      name="grade"
                      label="年级"
                      rules={[{ required: true, message: '请输入年级' }]}
                    >
                      <Input placeholder="请输入年级" />
                    </Form.Item>
                  )}
                  
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入正确的邮箱格式' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label="联系电话"
                    rules={[
                      { required: true, message: '请输入联系电话' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" />
                  </Form.Item>
                  
                  <Form.Item
                    name="bio"
                    label="个人简介"
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="请输入个人简介" 
                      maxLength={200}
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Card>
          
          <Tabs defaultActiveKey="achievements" size="large">
            <TabPane 
              tab={
                <span>
                  <TrophyOutlined /> 我的成果
                </span>
              } 
              key="achievements"
            >
              <Card bordered={false}>
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />}
                    onClick={() => navigate('/achievement/create')}
                  >
                    发布新成果
                  </Button>
                </div>
                
                <Table
                  columns={achievementColumns}
                  dataSource={myAchievements}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: '暂无成果数据，点击发布新成果开始展示你的作品' }}
                />
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <LockOutlined /> 账号设置
                </span>
              } 
              key="account"
            >
              <Card bordered={false}>
                <Form layout="vertical" style={{ maxWidth: 600 }}>
                  <h3 style={{ margin: '0 0 24px' }}>账号安全</h3>
                  
                  <Form.Item label="登录账号" name="username" initialValue={currentUser.username}>
                    <Input disabled />
                  </Form.Item>
                  
                  <Form.Item label="原密码">
                    <Input.Password placeholder="请输入原密码" />
                  </Form.Item>
                  
                  <Form.Item label="新密码">
                    <Input.Password placeholder="请输入新密码" />
                  </Form.Item>
                  
                  <Form.Item label="确认新密码">
                    <Input.Password placeholder="请确认新密码" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" style={{ marginRight: 16 }}>
                      修改密码
                    </Button>
                    <Button type="default">
                      找回密码
                    </Button>
                  </Form.Item>
                  
                  <Divider />
                  
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Popconfirm
                      title="确定要退出登录吗？"
                      onConfirm={handleLogout}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        danger 
                        icon={<LogoutOutlined />}
                      >
                        退出当前账号
                      </Button>
                    </Popconfirm>
                  </div>
                </Form>
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default ProfilePage;