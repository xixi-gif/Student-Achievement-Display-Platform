import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Modal, message, Tag, Space,  Avatar, Badge, Row, Col,  Descriptions, Layout} from 'antd';
import { SearchOutlined, EditOutlined,   UnlockOutlined,   StopOutlined,  InfoCircleOutlined} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';

const { Search } = Input;
const { Meta } = Card;
const { Footer } = Layout;
const mockStudents = [
  {
    id: '1001',
    studentId: '20230001',
    name: '张明',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    className: '计算机2001班',
    email: 'zhangming@stu.edu.cn',
    major: '计算机科学与技术',
    grade: '2020级',
    achievementCount: 5,
    status: 'active',
    lastLogin: '2023-11-15 09:30:45'
  },
  {
    id: '1002',
    studentId: '20230002',
    name: '李华',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    className: '软件工程2002班',
    email: 'lihua@stu.edu.cn',
    major: '软件工程',
    grade: '2020级',
    achievementCount: 3,
    status: 'active',
    lastLogin: '2023-11-14 14:20:10'
  },
  {
    id: '1003',
    studentId: '20230003',
    name: '赵雪',
    avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
    className: '人工智能2001班',
    email: 'zhaoxue@stu.edu.cn',
    major: '人工智能',
    grade: '2021级',
    achievementCount: 7,
    status: 'inactive',
    lastLogin: '2023-10-20 08:15:30'
  }
];

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [resetPwdModalVisible, setResetPwdModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 模拟获取学生数据
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'visitor';
      const username = localStorage.getItem('username') || '访客';
      setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setLoading(false);
    }, 500);
  }, []);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchKeyword(value);
    if (!value) {
      setFilteredStudents(students);
      return;
    }
    const lowerValue = value.toLowerCase();
    const filtered = students.filter(s => 
      s.studentId.includes(value) ||
      s.name.toLowerCase().includes(lowerValue) ||
      s.className.toLowerCase().includes(lowerValue) ||
      s.major.toLowerCase().includes(lowerValue)
    );
    setFilteredStudents(filtered);
  };

  // 重置密码
  const handleResetPassword = (student) => {
    setSelectedStudent(student);
    setResetPwdModalVisible(true);
  };

  // 确认重置密码
  const confirmResetPassword = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      message.success(`已重置 ${selectedStudent.name} 的密码为学号后六位`);
      setResetPwdModalVisible(false);
    } catch (error) {
      message.error('重置密码失败');
    }
  };

  // 切换账号状态
  const toggleAccountStatus = async (student) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      const updated = students.map(s => 
        s.id === student.id ? { 
          ...s, 
          status: s.status === 'active' ? 'inactive' : 'active' 
        } : s
      );
      setStudents(updated);
      setFilteredStudents(updated);
      message.success(
        `已${student.status === 'active' ? '禁用' : '启用'} ${student.name} 的账号`
      );
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 学生卡片渲染
  const renderStudentCard = (student) => (
    <Badge.Ribbon 
      text={student.status === 'active' ? '正常' : '已禁用'} 
      color={student.status === 'active' ? 'green' : 'red'}
    >
      <Card
        key={student.id}
        style={{ width: '100%', marginBottom: 16 }}
        actions={[
          <Button 
            type="link" 
            icon={<InfoCircleOutlined />}
            onClick={() => {
              setSelectedStudent(student);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>,
          <Button 
            type="link" 
            icon={<UnlockOutlined />}
            onClick={() => handleResetPassword(student)}
          >
            重置密码
          </Button>,
          <Button 
            danger={student.status === 'active'}
            type="link" 
            icon={<StopOutlined />}
            onClick={() => toggleAccountStatus(student)}
          >
            {student.status === 'active' ? '禁用' : '启用'}
          </Button>
        ]}
      >
        <Meta
          avatar={<Avatar src={student.avatar} size={64} />}
          title={student.name}
          description={
            <Space direction="vertical" size={2}>
              <span>学号: {student.studentId}</span>
              <span>班级: {student.className}</span>
              <span>专业: {student.major}</span>
              <Tag color="blue">成果数: {student.achievementCount}</Tag>
            </Space>
          }
        />
      </Card>
    </Badge.Ribbon>
  );

  return (
    <Layout>
    <Navbar currentUser={currentUser}/>
    <div style={{ padding: 24 }}>
      <Card
        title="学生管理"
        bordered={false}
        extra={
          <Search
            placeholder="搜索学号/姓名/班级/专业"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Button type="text" loading />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredStudents.map(student => (
              <Col key={student.id} xs={24} sm={12} md={8} lg={6} >
                {renderStudentCard(student)}
              </Col>
            ))}
          </Row>
        )}
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
          确定要重置学生 <strong>{selectedStudent?.name}</strong> (学号: {selectedStudent?.studentId})
          的密码为默认密码吗？
        </p>
        <p>重置后密码将变为学号后六位，请提醒学生及时修改。</p>
      </Modal>

      {/* 学生详情弹窗 */}
      <Modal
        title="学生详细信息"
        visible={detailModalVisible}
        footer={null}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
      >
        {selectedStudent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="头像" span={2}>
              <Avatar src={selectedStudent.avatar} size={100} />
            </Descriptions.Item>
            <Descriptions.Item label="姓名">{selectedStudent.name}</Descriptions.Item>
            <Descriptions.Item label="学号">{selectedStudent.studentId}</Descriptions.Item>
            <Descriptions.Item label="班级">{selectedStudent.className}</Descriptions.Item>
            <Descriptions.Item label="专业">{selectedStudent.major}</Descriptions.Item>
            <Descriptions.Item label="年级">{selectedStudent.grade}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedStudent.email}</Descriptions.Item>
            <Descriptions.Item label="成果数量">
              <Tag color="blue">{selectedStudent.achievementCount}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="账号状态">
              <Badge
                status={selectedStudent.status === 'active' ? 'success' : 'error'}
                text={selectedStudent.status === 'active' ? '正常' : '已禁用'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="最后登录时间">
              {selectedStudent.lastLogin || '暂无记录'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
    <Footer style={{ textAlign: 'center' }}>
            学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
          </Footer>
    </Layout>
  );
};

export default StudentManagementPage;