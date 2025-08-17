import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Card, Avatar, Button, Tabs, Form, Input,
  Table, Badge, Tag, Upload, Space, Divider, Spin,
  message, Popconfirm, Select, Row, Col, Tooltip
} from 'antd';
import {
  CheckCircleOutlined, StarOutlined, EyeOutlined,
  LockOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, LogoutOutlined, EditOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { teacherApi, authApi, achievementApi } from '../../service/api';

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
  const [reviewLoading, setReviewLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [reviewData, setReviewData] = useState([]);
  const [recommendData, setRecommendData] = useState([]);

  // 状态映射
  const statusMap = {
    1: { text: "待审核", color: "processing" },
    2: { text: "已发布", color: "blue" },
    3: { text: "已驳回", color: "error" },
    4: { text: "已通过", color: "success" }
  };

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取教师基本信息
        const profileResponse = await teacherApi.getProfile();
        const formattedData = {
          realName: profileResponse.username,
          teacherId: profileResponse.teacherId,
          department: profileResponse.department,
          title: profileResponse.title,
          researchField: profileResponse.researchField,
          email: profileResponse.email,
          phone: profileResponse.phone,
          bio: '',
          avatar: profileResponse.avatar
        };
        
        setCurrentUser(formattedData);
        form.setFieldsValue(formattedData);
        
        // 获取审核和推荐数据
        await Promise.all([
          fetchReviewData(),
          fetchRecommendData()
        ]);
        
      } catch (error) {
        console.error('获取教师数据失败:', error);
        message.error('获取教师信息失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取审核数据 - 参考审核页面逻辑
  const fetchReviewData = async () => {
    try {
      setReviewLoading(true);
      const response = await achievementApi.getPendingList({
        current: 1,
        pageSize: 3
      });
      
      // 审核页面数据结构转换
      const formattedData = (response.records || []).map(item => ({
        id: item.id,
        title: item.title,
        studentName: item.userName || '未知学生',
        studentId: item.studentId || '',
        category: item.category,
        status: item.status || 1,
        rejectReason: item.rejectReason,
        createTime: item.createTime,
        keyword: item.keyword || [],
        description: item.description
      }));
      
      setReviewData(formattedData);
    } catch (error) {
      console.error('获取审核数据失败:', error);
      message.error('获取审核数据失败');
    } finally {
      setReviewLoading(false);
    }
  };

  // 获取推荐数据 - 参考推荐页面逻辑
  const fetchRecommendData = async () => {
    try {
      setRecommendLoading(true);
      const response = await achievementApi.getRecommendList({
        current: 1,
        pageSize: 3
      });
      
      // 推荐页面数据结构转换
      const formattedData = (response.records || []).map(item => ({
        id: item.id,
        title: item.title,
        student: item.studentName,
        recommendLevel: item.recommendLevel || 0,
        views: item.views || 0,
        category: item.category,
        keyword: item.keyword || [],
        recommendComment: item.recommendComment,
        isRecommended: item.recommended
      }));
      
      setRecommendData(formattedData);
    } catch (error) {
      console.error('获取推荐数据失败:', error);
      message.error('获取推荐数据失败');
    } finally {
      setRecommendLoading(false);
    }
  };

  // 保存表单数据
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        username: values.realName,
        department: values.department,
        title: values.title,
        researchField: values.researchField,
        email: values.email,
        phone: values.phone,
        bio: values.bio
      };

      await teacherApi.updateProfile(updatedData);
      
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      
      message.success('个人信息更新成功');
      setEditMode(false);
    } catch (error) {
      console.error('保存失败:', error);
      message.error(error.message || '保存失败，请检查输入');
    }
  };

  // 头像上传处理
  const handleAvatarChange = async (info) => {
    if (info.file.status === 'done') {
      try {
        const response = await authApi.uploadAvatar(info.file.originFileObj);
        const avatarUrl = response.data?.url;
        
        if (avatarUrl) {
          const updatedUser = { ...currentUser, avatar: avatarUrl };
          setCurrentUser(updatedUser);
          form.setFieldsValue({ avatar: avatarUrl });
          message.success('头像上传成功');
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        message.error('头像上传失败');
      }
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

  // 状态标签渲染
  const renderStatusTag = (status, reason) => {
    const statusInfo = statusMap[status] || { text: '未知状态', color: 'default' };
    return (
      <Tooltip title={reason ? `驳回原因: ${reason}` : null}>
        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      </Tooltip>
    );
  };

  // 表格列配置 - 严格匹配审核页面
  const reviewColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      render: (text, record) => (
        <Tooltip
          placement="topLeft"
          title={
            <div>
              <p><strong>描述：</strong>{record.description}</p>
              <p><strong>关键词：</strong>{record.keyword.join(', ')}</p>
            </div>
          }
        >
          <a onClick={() => navigate(`/achievement/detail/${record.id}`)}>
            {text}
          </a>
        </Tooltip>
      ),
      width: 300
    },
    {
      title: '学生',
      dataIndex: 'student',
      render: (_, record) => record.studentName
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
      render: (status, record) => renderStatusTag(status, record.rejectReason)
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      width: 200
    }
  ];

  // 表格列配置 - 严格匹配推荐页面
  const recommendColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      render: (text, record) => (
        <Tooltip
          title={
            <div>
              <p><strong>关键词：</strong>{record.keyword.join(', ')}</p>
              {record.recommendComment && (
                <p><strong>推荐说明：</strong>{record.recommendComment}</p>
              )}
            </div>
          }
        >
          <a onClick={() => navigate(`/achievement/detail/${record.id}`)}>
            {text}
          </a>
        </Tooltip>
      ),
      width: 330
    },
    {
      title: '学生',
      dataIndex: 'student',
      width: 120,
      render: (studentName) => (studentName)
    },
    {
      title: '推荐等级',
      dataIndex: 'recommendLevel',
      render: (level) => (
        <Tag color={level >= 4 ? 'gold' : level >= 2 ? 'orange' : 'blue'}>
          {'★'.repeat(level)}
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

  // 分类颜色映射
  const getCategoryColor = (category) => {
    const colors = {
      '软件开发': 'blue',
      '科研项目': 'purple',
      '毕业论文': 'green',
      '竞赛作品': 'orange',
      '学术论文': 'red'
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
                <h3 style={{ marginTop: 16 }}>{currentUser.realName}</h3>
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
                        <Input disabled />
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
                tab={
                  <Space>
                    <CheckCircleOutlined />
                    <span>成果审核</span>
                    <Badge 
                      count={reviewData.length} 
                      style={{ backgroundColor: '#1890ff' }} 
                    />
                  </Space>
                }
                key="review"
              >
                <Spin spinning={reviewLoading}>
                  <Table
                    columns={reviewColumns}
                    dataSource={reviewData}
                    rowKey="id"
                    pagination={false}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />}
                      onClick={() => navigate('/teacher/achievements/review')}
                    >
                      查看全部待审核成果
                    </Button>
                  </div>
                </Spin>
              </TabPane>
              
              <TabPane
                tab={
                  <Space>
                    <StarOutlined />
                    <span>推荐成果</span>
                    <Badge 
                      count={recommendData.length} 
                      style={{ backgroundColor: '#52c41a' }} 
                    />
                  </Space>
                }
                key="recommend"
              >
                <Spin spinning={recommendLoading}>
                  <Table
                    columns={recommendColumns}
                    dataSource={recommendData}
                    rowKey="id"
                    pagination={false}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />}
                      onClick={() => navigate('/teacher/achievements/recommend')}
                    >
                      查看全部推荐成果
                    </Button>
                  </div>
                </Spin>
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
                        <Button 
                          type="primary"
                          onClick={async () => {
                            try {
                              const values = await form.validateFields();
                              await authApi.changePassword(
                                values.oldPassword, 
                                values.newPassword
                              );
                              message.success('密码修改成功');
                            } catch (error) {
                              message.error(error.message || '密码修改失败');
                            }
                          }}
                        >
                          确认修改
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                  
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Popconfirm
                      title="确定要退出登录吗？"
                      onConfirm={async () => {
                        try {
                          await authApi.logout();
                        } finally {
                          localStorage.clear();
                          navigate('/login');
                        }
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