import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Avatar, Button, Tabs, Form, Input, 
  Table, Badge, Tag, Upload, Space, Divider, Spin,
  message, Popconfirm, Radio, Select, Row, Col
} from 'antd';
import { 
  CheckCircleOutlined, StarOutlined, EyeOutlined,
  LockOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, LogoutOutlined, EditOutlined,
  IdcardOutlined, SafetyOutlined, TeamOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const TeacherProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('review');

  // 模拟教师审核数据
  const reviewData = [
    {
      id: 1,
      title: "智能校园导航系统",
      student: "张明",
      studentId: "20230001",
      category: "软件开发",
      status: "已通过",
      date: "2023-11-15",
      comment: "创新性强，具有实用价值"
    }
  ];

  // 模拟推荐成果数据
  const recommendData = [
    {
      id: 1,
      title: "区块链学历认证系统",
      student: "王芳",
      recommendLevel: 3,
      views: 156,
      date: "2023-11-10"
    }
  ];

  // 初始化数据
  useEffect(() => {
    const timer = setTimeout(() => {
      const defaultData = {
        role: 'teacher',
        username: '王教授',
        realName: '',
        teacherId: '',
        department: '计算机学院',
        title: '副教授',
        researchField: '人工智能',
        email: '',
        phone: '',
        bio: '',
        avatar: null
      };
      
      const savedData = JSON.parse(localStorage.getItem('teacher_profile') || '{}');
      const mergedData = { ...defaultData, ...savedData };
      
      setCurrentUser(mergedData);
      form.setFieldsValue(mergedData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [form]);

  // 保存表单数据
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        const updatedUser = { ...currentUser, ...values };
        localStorage.setItem('teacher_profile', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        message.success('个人信息已保存');
        setEditMode(false);
      })
      .catch(err => {
        console.error('验证失败:', err);
      });
  };

  // 头像上传处理
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      const avatarUrl = info.file.response?.url || 
        `https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 100)}.jpg`;
      
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      setCurrentUser(updatedUser);
      form.setFieldsValue({ avatar: avatarUrl });
      localStorage.setItem('teacher_profile', JSON.stringify(updatedUser));
      message.success('头像上传成功');
    }
  };

  // 上传前校验
  const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    
    return true;
  };

  // 表格列配置
  const reviewColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      render: (text) => <a onClick={() => navigate(`/achievement/detail`)}>{text}</a>,
      width: 200
    },
    {
      title: '学生',
      dataIndex: 'student',
      render: (text, record) => `${text} (${record.studentId})`
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === '已通过' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/teacher/achievements/review`)}>
          审核
        </Button>
      )
    }
  ];

  const recommendColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      render: (text, record) => (
        <Space>
          <a onClick={() => navigate(`/achievement/detail`)}>{text}</a>
          <Tag color="gold">{'★'.repeat(record.recommendLevel)}</Tag>
        </Space>
      )
    },
    {
      title: '推荐等级',
      dataIndex: 'recommendLevel',
      render: (level) => (
        <Tag color={level === 3 ? 'gold' : level === 2 ? 'orange' : 'blue'}>
          {['一般推荐', '重点推荐', '强烈推荐'][level - 1]}
        </Tag>
      )
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      render: (views) => (
        <Space>
          <EyeOutlined />
          {views}
        </Space>
      )
    }
  ];

  // 辅助函数
  const getCategoryColor = (category) => {
    const colors = {
      '软件开发': 'blue',
      '科研项目': 'purple',
      '毕业论文': 'green',
      '竞赛作品': 'orange'
    };
    return colors[category] || 'gray';
  };

  if (loading || !currentUser) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" tip="加载教师信息..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ padding: '24px 5%', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* 个人信息卡片 */}
          <Card
            title="教师信息中心"
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
                  <Button type="primary" onClick={handleSave}>
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
              {/* 头像区域 */}
              <div style={{ width: 200, marginRight: 32, textAlign: 'center' }}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  showUploadList={false}
                  action="/api/upload/avatar"
                  beforeUpload={beforeAvatarUpload}
                  onChange={handleAvatarChange}
                  disabled={!editMode}
                >
                  {currentUser.avatar ? (
                    <Avatar size={160} src={currentUser.avatar} />
                  ) : (
                    <div>
                      <UserOutlined style={{ fontSize: 48 }} />
                      <div>{editMode ? '上传头像' : '暂无头像'}</div>
                    </div>
                  )}
                </Upload>
                <h3 style={{ marginTop: 16 }}>{currentUser.username}</h3>
                <Tag color="purple" icon={<UserOutlined />}>
                  教师
                </Tag>
              </div>
              
              {/* 表单区域 */}
              <div style={{ flex: 1, minWidth: 300 }}>
                <Form form={form} layout="vertical" disabled={!editMode}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="realName"
                        label="真实姓名"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="teacherId"
                        label="教师工号"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    name="department"
                    label="所属院系"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="title"
                    label="职称"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="教授">教授</Option>
                      <Option value="副教授">副教授</Option>
                      <Option value="讲师">讲师</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="researchField"
                    label="研究方向"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="email"
                        label="邮箱"
                        rules={[
                          { required: true },
                          { type: 'email' },
                          { pattern: /@(edu\.cn|school\.edu)$/, message: '请使用学校邮箱' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                      
                      <Form.Item
                        name="phone"
                        label="联系电话"
                        rules={[
                          { required: true },
                          { 
                            pattern: /(^1[3-9]\d{9}$)|(^\d{3,4}-\d{7,8}$)/,
                            message: '请输入手机号或固话（区号-号码）'
                          }
                        ]}
                      >
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                      
                      <Form.Item name="bio" label="个人简介">
                        <TextArea rows={4} maxLength={200} />
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              </Card>
              
              {/* 工作台标签页 */}
              <Card bordered={false}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane
                    tab={<span><CheckCircleOutlined /> 成果审核</span>}
                    key="review"
                  >
                    <Table
                      columns={reviewColumns}
                      dataSource={reviewData}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </TabPane>
                  
                  <TabPane
                    tab={<span><StarOutlined /> 推荐成果</span>}
                    key="recommend"
                  >
                    <Table
                      columns={recommendColumns}
                      dataSource={recommendData}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </TabPane>
                  
                  <TabPane
                    tab={<span><LockOutlined /> 账号安全</span>}
                    key="security"
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Card title="修改密码" bordered={false}>
                        <Form layout="vertical" style={{ maxWidth: 600 }}>
                          <Form.Item label="原密码" name="oldPassword">
                            <Input.Password />
                          </Form.Item>
                          <Form.Item label="新密码" name="newPassword">
                            <Input.Password />
                          </Form.Item>
                          <Form.Item>
                            <Button type="primary">确认修改</Button>
                          </Form.Item>
                        </Form>
                      </Card>
                      
                      <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Popconfirm
                          title="确定要退出登录吗？"
                          onConfirm={() => {
                            localStorage.clear();
                            navigate('/login');
                          }}
                        >
                          <Button danger icon={<LogoutOutlined />}>
                            退出登录
                          </Button>
                        </Popconfirm>
                      </div>
                    </Space>
                  </TabPane>
                </Tabs>
              </Card>
            </div>
          </Content>
        </Layout>
      );
    };
    
    export default TeacherProfile;