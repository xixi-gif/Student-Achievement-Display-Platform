import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Avatar, Button, Tabs, Form, Input, Row, Col, 
  Table, Badge, Tag, Upload, Space, Divider, Spin,
  message, Popconfirm, Descriptions, Select, List, Statistic
} from 'antd';
import { 
  UserOutlined, EditOutlined, MailOutlined, PhoneOutlined,
  UploadOutlined, LockOutlined, LogoutOutlined, EyeOutlined, 
  TrophyOutlined, TeamOutlined, CheckCircleOutlined, 
  StarOutlined,  IdcardOutlined, ClusterOutlined, 
  SolutionOutlined, CrownOutlined, 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 模拟数据 - 学生成果
const studentAchievements = [
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

// 模拟数据 - 教师审核的成果
const ReviewAchievements= [
  {
    id: 1,
    title: "智能校园导航系统设计",
    student: "张明",
    studentId: "20230001",
    category: "软件开发",
    status: "已通过",
    reviewDate: "2023-11-10",
    isRecommended: true,
    recommendLevel: 3, // 1-3级推荐
    reviewComment: "创新性强，具有实际应用价值"
  },
  {
    id: 2,
    title: "大学生心理健康调研报告",
    student: "李华",
    studentId: "20230002",
    category: "论文",
    status: "已驳回",
    reviewDate: "2023-11-08",
    isRecommended: false,
    reviewComment: "数据样本量不足，建议补充调研"
  }
];

// 模拟数据 - 教师推荐的成果
const teacherRecommendedAchievements = [
  {
    id: 1,
    title: "基于区块链的学历认证系统",
    student: "王芳",
    studentId: "20230003",
    category: "科研项目",
    recommendDate: "2023-11-05",
    recommendLevel: 3,
    recommendComment: "技术前沿，实现完整",
    views: 156,
    likes: 28
  }
];

// 模拟数据 - 管理员个人信息
const adminProfileData = {
  adminId: "A1001",
  username: "sysadmin",
  realName: "系统管理员",
  position: "超级管理员",
  department: "信息中心",
  email: "admin@university.edu.cn",
  phone: "13800138000",
  permissions: ["用户管理", "系统设置", "数据备份", "日志审计"],
  lastLogin: "2023-11-15 09:30:45",
  loginIp: "192.168.1.100"
};

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
      
      // 根据角色加载不同的模拟数据
      let userData;
      switch(role) {
        case 'teacher':
          userData = {
            role,
            username,
            realName: "李教授",
            teacherId: "T1001",
            department: "计算机学院",
            title: "教授",
            researchField: "人工智能与机器学习",
            email: "li.prof@university.edu.cn",
            phone: "13900139000",
            bio: "主要从事人工智能领域研究，发表论文30余篇",
            avatar: ""
          };
          break;
        case 'admin':
          userData = { ...adminProfileData, role, avatar: "" };
          break;
        default: // student
          userData = {
            role,
            username,
            realName: "张明",
            studentId: "20230001",
            major: "计算机科学与技术",
            grade: "2020级",
            email: "zhang.ming@stu.edu.cn",
            phone: "13800138001",
            bio: "热爱编程，喜欢研究新技术",
            avatar: ""
          };
      }
      
      // 合并本地存储的数据
      const savedInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const mergedUser = { ...userData, ...savedInfo };
      
      setCurrentUser(mergedUser);
      form.setFieldsValue(mergedUser);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [form]);

  // 学生成果表格列
  const studentAchievementColumns = [
      {
        title: '成果名称',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <a onClick={() => navigate(`/achievement/detail`)}>{text}</a>
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
              onClick={() => navigate(`/student/achievement/edit`)}
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
  
  // 教师审核表格列
  const teacherReviewColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/achievement/detail`)}>{text}</a>
      )
    },
    {
      title: '学生',
      dataIndex: 'student',
      key: 'student',
      render: (text, record) => `${text} (${record.studentId})`
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
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已通过' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => navigate(`/teacher/review/${record.id}`)}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];
  
  // 教师推荐表格列
  const teacherRecommendColumns = [
    {
      title: '成果名称',
      dataIndex: 'title',
      key: 'title',
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
      key: 'recommendLevel',
      render: (level) => (
        <Tag color={level === 3 ? 'gold' : level === 2 ? 'orange' : 'blue'}>
          {level === 3 ? '强烈推荐' : level === 2 ? '重点推荐' : '一般推荐'}
        </Tag>
      )
    },
    {
      title: '推荐时间',
      dataIndex: 'recommendDate',
      key: 'recommendDate'
    },
    {
      title: '热度',
      key: 'popularity',
      render: (_, record) => (
        <Space>
          <span>{record.views} <EyeOutlined /></span>
          <span>{record.likes} <StarOutlined /></span>
        </Space>
      )
    }
  ];
  
  // 管理员信息展示项
  const adminInfoItems = [
    {
      key: 'basic',
      label: '基本信息',
      icon: <IdcardOutlined />,
      items: [
        { label: '管理员ID', value: 'adminId' },
        { label: '姓名', value: 'realName' },
        { label: '职位', value: 'position' },
        { label: '所属部门', value: 'department' }
      ]
    },
    {
      key: 'contact',
      label: '联系信息',
      icon: <MailOutlined />,
      items: [
        { label: '电子邮箱', value: 'email' },
        { label: '联系电话', value: 'phone' }
      ]
    },
    // {
    //   key: 'security',
    //   label: '安全信息',
    //   icon: <SafetyOutlined />,
    //   items: [
    //     { label: '最后登录时间', value: 'lastLogin' },
    //     { label: '登录IP', value: 'loginIp' },
    //     { label: '拥有权限', value: 'permissions', render: (perms) => (
    //       <Space wrap>
    //         {perms.map(p => <Tag key={p}>{p}</Tag>)}
    //       </Space>
    //     )}
    //   ]
    // }
  ];

  // 根据角色渲染不同的内容区域
  const renderRoleSpecificContent = () => {
    if (!currentUser) return null;
    
    switch(currentUser.role) {
      case 'student':
        return (
        <div>
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
                            label="专业"
                            rules={[{ required: true, message: '请输入专业' }]}
                          >
                            <Input placeholder="请输入专业" />
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
                              onClick={() => navigate('/student/achievement/create')}
                            >
                              发布新成果
                            </Button>
                          </div>
                          
                          <Table
                            columns={studentAchievementColumns}
                            dataSource={studentAchievements}
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
        );
        
      case 'teacher':
        return (
        <div>
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
                                name="teacherId"
                                label="工号"
                                rules={[{ required: true, message: '请输入工号' }]}
                              >
                                <Input placeholder="请输入工号" />
                              </Form.Item>
                            )}
                            
                            <Form.Item
                              name="department"
                              label="部门"
                              rules={[{ required: true, message: '请输入部门' }]}
                            >
                              <Input placeholder="请输入部门" />
                            </Form.Item>
                            
                            {currentUser.role === 'teacher' && (
                              <Form.Item
                                name="title"
                                label="职称"
                                rules={[{ required: true, message: '请输入职称' }]}
                              >
                                <Input placeholder="请输入职称" />
                              </Form.Item>
                            )}

                            <Form.Item
                                name="researchfiled"
                                label="研究领域"
                                rules={[{ required: true, message: '请输入研究领域' }]}
                              >
                                <Input placeholder="请输入研究领域" />
                              </Form.Item>
                            
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
          <Tabs defaultActiveKey="review">
            <TabPane 
              tab={<span><CheckCircleOutlined /> 成果审核</span>} 
              key="review"
            >
              <Card bordered={false}>
                <Table
                  columns={teacherReviewColumns}
                  dataSource={ReviewAchievements}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><StarOutlined /> 推荐成果</span>} 
              key="recommend"
            >
              <Card bordered={false}>
                <Table
                  columns={teacherRecommendColumns}
                  dataSource={teacherRecommendedAchievements}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
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
        );
        
      case 'admin':
        return (
          <Card bordered={false}>
            <div style={{ display: 'flex', marginBottom: 24 }}>
              <Avatar size={120} icon={<UserOutlined />} style={{ marginRight: 24 }} />
              <div>
                <h2 style={{ marginBottom: 8 }}>{currentUser.realName}</h2>
                <Tag icon={<CrownOutlined />} color="red">超级管理员</Tag>
                <div style={{ marginTop: 16 }}>
                  <Tag icon={<ClusterOutlined />}>{currentUser.department}</Tag>
                  <Tag icon={<SolutionOutlined />}>{currentUser.position}</Tag>
                </div>
              </div>
            </div>
            
            <Tabs defaultActiveKey="basic">
              {adminInfoItems.map(section => (
                <TabPane 
                  tab={<span>{section.icon} {section.label}</span>} 
                  key={section.key}
                >
                  <Descriptions bordered column={1}>
                    {section.items.map(item => (
                      <Descriptions.Item 
                        key={item.label} 
                        label={item.label}
                      >
                        {item.render 
                          ? item.render(currentUser[item.value]) 
                          : currentUser[item.value]}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </TabPane>
              ))}
              
              {/* <TabPane 
                tab={<span><DatabaseOutlined /> 系统概览</span>} 
                key="stats"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="用户总数" 
                        value={215} 
                        prefix={<TeamOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="成果总数" 
                        value={430} 
                        prefix={<TrophyOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="系统运行" 
                        value="128天" 
                        prefix={<SafetyOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane> */}
            </Tabs>
          </Card>
        );
        
      default:
        return null;
    }
  };

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        const updatedUser = { ...currentUser, ...values };
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        message.success('个人信息保存成功');
        setEditMode(false);
      });
  };

  const handleDelete = (id) => {
      message.success(`成果 ${id} 已删除`);
    };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      const avatarUrl = info.file.response?.url || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200/200`;
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      form.setFieldsValue({ avatar: avatarUrl });
      message.success('头像上传成功');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    message.success('退出登录成功');
    navigate('/login');
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
            title={`${currentUser.role === 'student' ? '学生' : currentUser.role === 'teacher' ? '教师' : '管理员'}个人中心`}
            bordered={false}
            extra={
              currentUser.role !== 'admin' && (
                editMode ? (
                  <Space>
                    <Button onClick={() => setEditMode(false)}>取消</Button>
                    <Button type="primary" onClick={handleFormSubmit}>保存</Button>
                  </Space>
                ) : (
                  <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                    编辑资料
                  </Button>
                )
              )
            }
          >
            
            {renderRoleSpecificContent()}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

// 辅助函数
function getCategoryColor(category) {
  const colorMap = {
    '毕业论文': '#1890ff',
    '一级项目': '#52c41a',
    '竞赛作品': '#faad14',
    '科研项目': '#722ed1',
    '软件开发': '#13c2c2',
    '论文': '#f5222d'
  };
  return colorMap[category] || '#666';
}

export default ProfilePage;