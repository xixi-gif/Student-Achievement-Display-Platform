import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Modal, message, Tag, Space, Avatar, Badge, Row, Col, Divider,  Popconfirm,  Descriptions,  Tabs} from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, LockOutlined, UserOutlined, TeamOutlined, PlusOutlined} from '@ant-design/icons';

const { Search } = Input;
const { TabPane } = Tabs;

// 模拟3条学生和3条教师数据
const mockUsers = {
  students: [
    {
      id: 's1001',
      name: '张明',
      username: 'zhangming',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      studentId: '20230001',
      className: '计算机2001班',
      major: '计算机科学与技术',
      email: 'zhangming@stu.edu.cn',
      role: 'student',
      status: 'active',
      achievementCount: 5,
      lastLogin: '2023-11-15 09:30:45'
    },
  ],
  teachers: [
    {
      id: 't2001',
      name: '王教授',
      username: 'wang',
      avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
      teacherId: 'T1001',
      department: '计算机学院',
      title: '教授',
      email: 'wang@edu.cn',
      role: 'teacher',
      status: 'active',
      lastLogin: '2023-11-14 14:20:10'
    },
  ]
};

const UserCard = ({ user, onEdit, onDelete, onToggleStatus, onResetPassword }) => {
  const isStudent = user.role === 'student';
  
  return (
    <Badge.Ribbon 
      text={user.status === 'active' ? '正常' : '已禁用'} 
      color={user.status === 'active' ? 'green' : 'red'}
    >
      <Card
        style={{ width: '100%', marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex' }}>
          <Avatar size={64} src={user.avatar} icon={<UserOutlined />} />
          <div style={{ marginLeft: 16, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{user.name}</h3>
              <Tag color={isStudent ? 'blue' : 'purple'}>
                {isStudent ? '学生' : '教师'}
              </Tag>
            </div>
            
            <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
              {isStudent ? (
                <>
                  <p>学号: {user.studentId}</p>
                  <p>班级: {user.className}</p>
                  <p>专业: {user.major}</p>
                  <Tag color="blue">成果数: {user.achievementCount}</Tag>
                </>
              ) : (
                <>
                  <p>工号: {user.teacherId}</p>
                  <p>学院: {user.department}</p>
                  <p>职称: {user.title}</p>
                </>
              )}
              <p>邮箱: {user.email}</p>
            </Space>
          </div>
        </div>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Space size="middle" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(user)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<LockOutlined />}
            onClick={() => onResetPassword(user)}
          >
            重置密码
          </Button>
          <Button 
            danger={user.status === 'active'}
            type="link" 
            onClick={() => onToggleStatus(user)}
          >
            {user.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => onDelete(user.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState({ students: [], teachers: [] });
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPwdModalVisible, setResetPwdModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('students');

  // 模拟数据加载
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchKeyword(value.toLowerCase());
  };

  // 获取筛选后的用户
  const getFilteredUsers = () => {
    const { students, teachers } = users;
    const keyword = searchKeyword;
    
    const filterFn = user => 
      user.name.toLowerCase().includes(keyword) ||
      (user.studentId && user.studentId.includes(keyword)) ||
      (user.teacherId && user.teacherId.includes(keyword)) ||
      user.email.toLowerCase().includes(keyword);
    
    return {
      students: keyword ? students.filter(filterFn) : students,
      teachers: keyword ? teachers.filter(filterFn) : teachers
    };
  };

  // 处理用户状态切换
  const handleToggleStatus = (user) => {
    const updatedUsers = { ...users };
    const group = user.role === 'student' ? 'students' : 'teachers';
    const index = updatedUsers[group].findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      updatedUsers[group][index] = {
        ...user,
        status: user.status === 'active' ? 'inactive' : 'active'
      };
      setUsers(updatedUsers);
      message.success(`已${user.status === 'active' ? '禁用' : '启用'} ${user.name}`);
    }
  };

  // 处理删除用户
  const handleDelete = (id) => {
    const updatedUsers = { ...users };
    const group = activeTab;
    updatedUsers[group] = updatedUsers[group].filter(u => u.id !== id);
    setUsers(updatedUsers);
    message.success('用户已删除');
  };

  // 处理重置密码
  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetPwdModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  // 确认重置密码
  const confirmResetPassword = () => {
    message.success(`已重置 ${selectedUser.name} 的密码为默认密码`);
    setResetPwdModalVisible(false);
  };

  const { students, teachers } = getFilteredUsers();

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="用户管理"
        bordered={false}
        extra={
          <Space>
            <Search
              placeholder="搜索姓名/学号/工号"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              添加用户
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Tag style={{ marginRight: 0 }}>
              总计: {activeTab === 'students' ? students.length : teachers.length}人
            </Tag>
          }
        >
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                学生管理
              </span>
            }
            key="students"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Button type="text" loading />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {students.map(student => (
                  <Col key={student.id} xs={24} sm={12} md={8} lg={8}>
                    <UserCard
                      user={student}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onResetPassword={handleResetPassword}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <UserOutlined />
                教师管理
              </span>
            }
            key="teachers"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Button type="text" loading />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {teachers.map(teacher => (
                  <Col key={teacher.id} xs={24} sm={12} md={8} lg={8}>
                    <UserCard
                      user={teacher}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onResetPassword={handleResetPassword}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 重置密码确认弹窗 */}
      <Modal
        title="确认重置密码"
        visible={resetPwdModalVisible}
        onOk={confirmResetPassword}
        onCancel={() => setResetPwdModalVisible(false)}
        okText="确认重置"
        cancelText="取消"
      >
        <p>
          确定要重置用户 <strong>{selectedUser?.name}</strong> (
          {selectedUser?.role === 'student' ? '学号' : '工号'}:{' '}
          {selectedUser?.studentId || selectedUser?.teacherId}) 的密码吗？
        </p>
        <p>重置后密码将变为默认密码，请提醒用户及时修改。</p>
      </Modal>

      {/* 编辑用户弹窗 */}
      <Modal
        title={`编辑用户 - ${selectedUser?.name}`}
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary">
            保存
          </Button>
        ]}
        width={700}
      >
        {selectedUser && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="头像">
              <Avatar src={selectedUser.avatar} size={64} />
            </Descriptions.Item>
            <Descriptions.Item label="姓名">{selectedUser.name}</Descriptions.Item>
            <Descriptions.Item label={selectedUser.role === 'student' ? '学号' : '工号'}>
              {selectedUser.studentId || selectedUser.teacherId}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedUser.status === 'active' ? 'green' : 'red'}>
                {selectedUser.status === 'active' ? '正常' : '已禁用'}
              </Tag>
            </Descriptions.Item>
            {selectedUser.role === 'student' ? (
              <>
                <Descriptions.Item label="班级">{selectedUser.className}</Descriptions.Item>
                <Descriptions.Item label="专业">{selectedUser.major}</Descriptions.Item>
                <Descriptions.Item label="成果数">
                  <Tag color="blue">{selectedUser.achievementCount}</Tag>
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="学院">{selectedUser.department}</Descriptions.Item>
                <Descriptions.Item label="职称">{selectedUser.title}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementPage;