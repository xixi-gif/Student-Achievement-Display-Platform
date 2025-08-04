import React, { useState, useEffect } from "react";
import { Card,  Input,  Button,  Modal,  message,  Tag,  Space,  Avatar,  Badge,  Row,
  Col,  Divider,  Popconfirm,  Descriptions,  Tabs,  Layout,  Form,  Radio,  Upload,
  Table,  Tooltip,  Checkbox,  InputNumber,  Spin,} from "antd";
import {  SearchOutlined,  EditOutlined,  DeleteOutlined,  LockOutlined,  UserOutlined,
  TeamOutlined,  PlusOutlined,  CheckCircleOutlined,  CloseCircleOutlined,  UploadOutlined,} from "@ant-design/icons";
import * as XLSX from "xlsx";
import Navbar from "../Navbar/Navbar";

const { Search } = Input;
const { TabPane } = Tabs;
const { Footer } = Layout;

// 模拟学生和教师数据
const mockUsers = {
  students: [
    {
      id: "s1001",
      name: "张明",
      username: "zhangming",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      studentId: "20230001",
      className: "计算机2001班",
      major: "计算机科学与技术",
      email: "zhangming@stu.edu.cn",
      role: "student",
      status: "active",
      achievementCount: 5,
      lastLogin: "2023-11-15 09:30:45",
    },
    // 添加更多模拟数据用于测试批量操作
    {
      id: "s1002",
      name: "李华",
      username: "lihua",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      studentId: "20230002",
      className: "计算机2001班",
      major: "计算机科学与技术",
      email: "lihua@stu.edu.cn",
      role: "student",
      status: "active",
      achievementCount: 3,
      lastLogin: "2023-11-14 14:20:10",
    },
    {
      id: "s1003",
      name: "王强",
      username: "wangqiang",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      studentId: "20230003",
      className: "计算机2001班",
      major: "计算机科学与技术",
      email: "wangqiang@stu.edu.cn",
      role: "student",
      status: "inactive",
      achievementCount: 2,
      lastLogin: "2023-11-13 08:15:30",
    },
    {
      id: "s1004",
      name: "王wu",
      username: "wangwu",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      studentId: "20230004",
      className: "计算机2001班",
      major: "计算机科学与技术",
      email: "wangwu@stu.edu.cn",
      role: "student",
      status: "inactive",
      achievementCount: 2,
      lastLogin: "2023-11-13 08:15:30",
    },
    {
      id: "s1005",
      name: "小王",
      username: "xiaowang",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      studentId: "20230005",
      className: "计算机2001班",
      major: "计算机科学与技术",
      email: "xiaowang@stu.edu.cn",
      role: "student",
      status: "inactive",
      achievementCount: 2,
      lastLogin: "2023-11-13 08:15:30",
    },
  ],
  teachers: [
    {
      id: "t2001",
      name: "王教授",
      username: "wang",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      teacherId: "T1001",
      department: "计算机学院",
      title: "教授",
      email: "wang@edu.cn",
      role: "teacher",
      status: "active",
      lastLogin: "2023-11-14 14:20:10",
    },
    {
      id: "t2002",
      name: "张教授",
      username: "zhang",
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      teacherId: "T1002",
      department: "计算机学院",
      title: "副教授",
      email: "zhang@edu.cn",
      role: "teacher",
      status: "active",
      lastLogin: "2023-11-13 09:45:20",
    },
  ],
};

// 导入模板列定义
const importTemplateColumns = {
  student: [
    { title: '姓名', dataIndex: 'name', required: true },
    { title: '学号', dataIndex: 'studentId', required: true },
    { title: '班级', dataIndex: 'className', required: true },
    { title: '专业', dataIndex: 'major', required: true },
    { title: '邮箱', dataIndex: 'email', required: true },
    { title: '电话', dataIndex: 'phone', required: false },
    { title: '登录密码', dataIndex: 'password', required: true }
  ],
  teacher: [
    { title: '姓名', dataIndex: 'name', required: true },
    { title: '工号', dataIndex: 'teacherId', required: true },
    { title: '学院', dataIndex: 'department', required: true },
    { title: '职称', dataIndex: 'title', required: true },
    { title: '邮箱', dataIndex: 'email', required: true },
    { title: '电话', dataIndex: 'phone', required: false },
    { title: '登录密码', dataIndex: 'password', required: true },
  ]
};

// 用户卡片组件 - 添加选择功能
const UserCard = ({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  selected,
  onSelect,
}) => {
  const isStudent = user.role === "student";

  return (
    <Badge.Ribbon
      text={user.status === "active" ? "正常" : "已禁用"}
      color={user.status === "active" ? "green" : "red"}
    >
      <Card
        style={{
          width: "100%",
          marginBottom: 16,
          border: selected ? "2px solid #1890ff" : undefined,
          position: "relative",
        }}
        bodyStyle={{ padding: 16 }}
        onClick={() => onSelect(user.id)}
      >
        {/* 选择复选框 */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(user.id);
          }}
        >
          {selected ? (
            <CheckCircleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
          ) : (
            <CloseCircleOutlined style={{ color: "#d9d9d9", fontSize: 20 }} />
          )}
        </div>

        <div style={{ display: "flex" }}>
          <Avatar size={64} src={user.avatar} icon={<UserOutlined />} />
          <div style={{ marginLeft: 16, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{user.name}</h3>
              <Tag color={isStudent ? "blue" : "purple"}>
                {isStudent ? "学生" : "教师"}
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

        <Divider style={{ margin: "12px 0" }} />

        <Space
          size="middle"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(user);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onResetPassword(user);
            }}
          >
            重置密码
          </Button>
          <Button
            danger={user.status === "active"}
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(user);
            }}
          >
            {user.status === "active" ? "禁用" : "启用"}
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete(user.id);
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

const UserManage = () => {
  const [users, setUsers] = useState({ students: [], teachers: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPwdModalVisible, setResetPwdModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newUserType, setNewUserType] = useState("student");
  const [newUserForm] = Form.useForm();
  const [adding, setAdding] = useState(false);
  // 新增状态：一键导入相关
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importType, setImportType] = useState("student");
  const [fileList, setFileList] = useState([]);
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // 新增状态：批量选择相关
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const role = localStorage.getItem("user_role") || "visitor";
      const username = localStorage.getItem("username") || "访客";
      setCurrentUser({
        role,
        username,
        avatar: `https://picsum.photos/id/${
          1030 + Math.floor(Math.random() * 10)
        }/200/200`,
      });
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchKeyword(value.toLowerCase());
    setSelectedIds([]); // 清空选择
  };

  // 获取筛选后的用户
  const getFilteredUsers = () => {
    const { students, teachers } = users;
    const keyword = searchKeyword;

    const filterFn = (user) =>
      user.name.toLowerCase().includes(keyword) ||
      (user.studentId && user.studentId.includes(keyword)) ||
      (user.teacherId && user.teacherId.includes(keyword)) ||
      user.email.toLowerCase().includes(keyword);

    return {
      students: keyword ? students.filter(filterFn) : students,
      teachers: keyword ? teachers.filter(filterFn) : teachers,
    };
  };

  // 处理用户状态切换
  const handleToggleStatus = (user) => {
    const updatedUsers = { ...users };
    const group = user.role === "student" ? "students" : "teachers";
    const index = updatedUsers[group].findIndex((u) => u.id === user.id);

    if (index !== -1) {
      updatedUsers[group][index] = {
        ...user,
        status: user.status === "active" ? "inactive" : "active",
      };
      setUsers(updatedUsers);
      message.success(
        `已${user.status === "active" ? "禁用" : "启用"} ${user.name}`
      );
    }
  };

  // 批量切换状态
  const handleBatchToggleStatus = (enable) => {
    if (selectedIds.length === 0) {
      message.warning("请先选择用户");
      return;
    }

    setBatchActionLoading(true);

    // 模拟API延迟
    setTimeout(() => {
      const updatedUsers = { ...users };
      const group = activeTab;

      updatedUsers[group] = updatedUsers[group].map((user) => {
        if (selectedIds.includes(user.id)) {
          return {
            ...user,
            status: enable ? "active" : "inactive",
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setSelectedIds([]);
      message.success(
        `已${enable ? "启用" : "禁用"} ${selectedIds.length} 个用户`
      );
      setBatchActionLoading(false);
    }, 800);
  };

  // 批量删除用户
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      message.warning("请先选择用户");
      return;
    }

    Modal.confirm({
      title: `确定删除选中的 ${selectedIds.length} 个用户吗？`,
      content: "此操作不可撤销，请谨慎操作！",
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        setBatchActionLoading(true);

        // 模拟API延迟
        setTimeout(() => {
          const updatedUsers = { ...users };
          const group = activeTab;

          updatedUsers[group] = updatedUsers[group].filter(
            (user) => !selectedIds.includes(user.id)
          );

          setUsers(updatedUsers);
          setSelectedIds([]);
          message.success(`已删除 ${selectedIds.length} 个用户`);
          setBatchActionLoading(false);
        }, 800);
      },
    });
  };

  // 批量重置密码
  const handleBatchResetPassword = () => {
    if (selectedIds.length === 0) {
      message.warning("请先选择用户");
      return;
    }

    Modal.confirm({
      title: `确定重置选中的 ${selectedIds.length} 个用户的密码吗？`,
      content: "密码将被重置为初始密码，请提醒用户及时修改。",
      okText: "确认重置",
      cancelText: "取消",
      onOk: () => {
        setBatchActionLoading(true);

        // 模拟API延迟
        setTimeout(() => {
          const userNames = users[activeTab]
            .filter((user) => selectedIds.includes(user.id))
            .map((user) => user.name)
            .join(", ");

          setSelectedIds([]);
          message.success(
            `已重置 ${selectedIds.length} 个用户的密码: ${userNames}`
          );
          setBatchActionLoading(false);
        }, 800);
      },
    });
  };

  // 处理选择/取消选择用户
  const handleSelectUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked) => {
    const { students, teachers } = getFilteredUsers();
    const currentUsers = activeTab === "students" ? students : teachers;

    setSelectedIds(checked ? currentUsers.map((user) => user.id) : []);
  };

  // 处理添加用户
  const handleAddUser = () => {
    setAdding(true);
    newUserForm
      .validateFields()
      .then((values) => {
        // 模拟API延迟
        setTimeout(() => {
          const newUser = {
            id: `u${Date.now()}`,
            ...values,
            role: newUserType,
            status: "active",
            avatar: generateRandomAvatar(newUserType),
            lastLogin: new Date().toISOString(),
          };

          if (newUserType === "student") {
            newUser.achievementCount = 0;
          }

          const updatedUsers = { ...users };
          updatedUsers[`${newUserType}s`].unshift(newUser);
          setUsers(updatedUsers);

          message.success(
            `成功添加${newUserType === "student" ? "学生" : "教师"}`
          );
          setAddModalVisible(false);
          newUserForm.resetFields();
          setAdding(false);
        }, 800);
      })
      .catch(() => setAdding(false));
  };

  // 处理删除用户
  const handleDelete = (id) => {
    const updatedUsers = { ...users };
    const group = activeTab;
    updatedUsers[group] = updatedUsers[group].filter((u) => u.id !== id);
    setUsers(updatedUsers);
    setSelectedIds(selectedIds.filter((item) => item !== id));
    message.success("用户已删除");
  };

  // 生成随机头像
  const generateRandomAvatar = (role) => {
    const gender = role === "student" ? "men" : "women";
    const randomId = Math.floor(Math.random() * 50);
    return `https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`;
  };

  // 学号唯一性验证
  const validateStudentId = (_, value) => {
    if (value && users.students.some((s) => s.studentId === value)) {
      return Promise.reject("该学号已存在");
    }
    return Promise.resolve();
  };

  // 处理文件上传
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // 验证数据格式
        const validatedData = validateImportData(jsonData, importType);
        setImportData(validatedData);
        message.success(`成功解析 ${jsonData.length} 条数据`);
      } catch (error) {
        console.error("Excel解析错误:", error);
        message.error("文件解析失败: " + error.message);
      }
    };
    reader.onerror = () => {
      message.error("文件读取失败");
    };
    reader.readAsArrayBuffer(file);
    return false; // 阻止默认上传行为
  };

  // 验证导入数据
  const validateImportData = (data, type) => {
    const requiredFields = importTemplateColumns[type]
      .filter((col) => col.required)
      .map((col) => col.dataIndex);

    return data.map((item, index) => {
      const errors = [];

      // 检查必填字段
      requiredFields.forEach((field) => {
        if (!item[field]) {
          errors.push(`缺少必填字段: ${field}`);
        }
      });

      // 检查学号/工号唯一性
      const idField = type === "student" ? "studentId" : "teacherId";
      if (item[idField]) {
        const existingUser = users[`${type}s`].find(
          (u) => u[idField] === item[idField]
        );
        if (existingUser) {
          errors.push(`${idField === "studentId" ? "学号" : "工号"}已存在`);
        }
      }

      return {
        ...item,
        _id: `import-${index}`,
        _errors: errors.length > 0 ? errors : null,
        _valid: errors.length === 0,
      };
    });
  };

  // 执行导入
  const handleImport = () => {
    const validData = importData.filter((item) => item._valid);
    if (validData.length === 0) {
      message.warning("没有有效数据可导入");
      return;
    }

    setImporting(true);

    // 模拟API请求延迟
    setTimeout(() => {
      const newUsers = validData.map((item) => ({
        id: `${importType === "student" ? "s" : "t"}${
          Date.now() + Math.floor(Math.random() * 1000)
        }`,
        ...item,
        role: importType,
        status: "active",
        avatar: generateRandomAvatar(importType),
        lastLogin: new Date().toISOString(),
        ...(importType === "student" ? { achievementCount: 0 } : {}),
      }));

      const updatedUsers = { ...users };
      updatedUsers[`${importType}s`] = [
        ...newUsers,
        ...updatedUsers[`${importType}s`],
      ];
      setUsers(updatedUsers);

      // 设置导入结果
      setImportResult({
        total: importData.length,
        success: validData.length,
        failed: importData.length - validData.length,
        failedItems: importData.filter((item) => !item._valid),
      });

      message.success(`成功导入 ${validData.length} 条数据`);
      setImporting(false);
    }, 1500);
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
  const currentUsers = activeTab === "students" ? students : teachers;
  const allSelected =
    selectedIds.length > 0 && selectedIds.length === currentUsers.length;

  return (
    <Layout>
      <Navbar currentUser={currentUser} />
      <div style={{ padding: 24 }}>
        <Card
          title="用户管理"
          bordered={false}
          // 在添加用户按钮前添加导入按钮
          extra={
            <Space>
              <Search
                placeholder="搜索姓名/学号/工号"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 300 }}
                onSearch={handleSearch}
              />
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => {
                  setImportModalVisible(true);
                  setImportType(
                    activeTab === "students" ? "student" : "teacher"
                  );
                }}
              >
                一键导入
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
                loading={adding}
              >
                添加用户
              </Button>
            </Space>
          }
        >
          {/* 批量操作工具栏 */}
          <div
            style={{
              marginBottom: 16,
              padding: "8px 16px",
              background: "#f0f2f5",
              borderRadius: 4,
              display: selectedIds.length > 0 ? "flex" : "none",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Checkbox
                indeterminate={selectedIds.length > 0 && !allSelected}
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{ marginRight: 8 }}
              >
                已选择 {selectedIds.length} 个用户
              </Checkbox>
            </div>

            <Space>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleBatchToggleStatus(true)}
                loading={batchActionLoading}
              >
                批量启用
              </Button>
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={() => handleBatchToggleStatus(false)}
                loading={batchActionLoading}
              >
                批量禁用
              </Button>
              <Button
                type="text"
                icon={<LockOutlined />}
                onClick={handleBatchResetPassword}
                loading={batchActionLoading}
              >
                重置密码
              </Button>
              <Popconfirm
                title={`确定删除选中的 ${selectedIds.length} 个用户吗？`}
                onConfirm={handleBatchDelete}
                okText="确认删除"
                cancelText="取消"
                okType="danger"
              >
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  loading={batchActionLoading}
                >
                  批量删除
                </Button>
              </Popconfirm>
            </Space>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setSelectedIds([]);
            }}
            tabBarExtraContent={
              <Tag style={{ marginRight: 0 }}>
                总计:{" "}
                {activeTab === "students" ? students.length : teachers.length}人
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
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <Button type="text" loading />
                </div>
              ) : (
                <Row gutter={[24, 24]}>
                  {students.map((student) => (
                    <Col key={student.id} xs={24} sm={12} md={8} lg={8}>
                      <UserCard
                        user={student}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onResetPassword={handleResetPassword}
                        selected={selectedIds.includes(student.id)}
                        onSelect={handleSelectUser}
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
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <Button type="text" loading />
                </div>
              ) : (
                <Row gutter={[24, 24]}>
                  {teachers.map((teacher) => (
                    <Col key={teacher.id} xs={24} sm={12} md={8} lg={8}>
                      <UserCard
                        user={teacher}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onResetPassword={handleResetPassword}
                        selected={selectedIds.includes(teacher.id)}
                        onSelect={handleSelectUser}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </TabPane>
          </Tabs>
        </Card>

        {/*一键导入弹窗 */}
        {/* 在现有Modal组件后添加以下代码 */}
        <Modal
          title={`批量导入${importType === "student" ? "学生" : "教师"}数据`}
          visible={importModalVisible}
          width={800}
          onCancel={() => {
            setImportModalVisible(false);
            setFileList([]);
            setImportData([]);
            setImportResult(null);
          }}
          footer={[
            <Button
              key="download"
              onClick={() => {
                // 生成模板文件
                const ws = XLSX.utils.json_to_sheet([]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "模板");
                XLSX.utils.sheet_add_aoa(
                  ws,
                  [importTemplateColumns[importType].map((col) => col.title)],
                  { origin: "A1" }
                );
                XLSX.writeFile(
                  wb,
                  `${importType === "student" ? "学生" : "教师"}导入模板.xlsx`
                );
              }}
            >
              下载模板
            </Button>,
            <Button
              key="cancel"
              onClick={() => {
                setImportModalVisible(false);
                setFileList([]);
                setImportData([]);
                setImportResult(null);
              }}
            >
              取消
            </Button>,
            <Button
              key="import"
              type="primary"
              onClick={handleImport}
              disabled={importData.length === 0}
              loading={importing}
            >
              开始导入
            </Button>,
          ]}
        >
          <div style={{ marginBottom: 16 }}>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleFileUpload}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>选择Excel文件</Button>
            </Upload>
            {fileList.length > 0 && (
              <span style={{ marginLeft: 8 }}>{fileList[0].name}</span>
            )}
          </div>

          {importData.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Table
                columns={[
                  ...importTemplateColumns[importType],
                  {
                    title: "状态",
                    dataIndex: "_valid",
                    render: (valid) => (
                      <Tag color={valid ? "green" : "red"}>
                        {valid ? "有效" : "无效"}
                      </Tag>
                    ),
                  },
                  {
                    title: "错误信息",
                    dataIndex: "_errors",
                    render: (errors) => errors?.join("; ") || "-",
                  },
                ]}
                dataSource={importData}
                rowKey="_id"
                size="small"
                pagination={false}
                scroll={{ y: 240 }}
              />
              <div style={{ marginTop: 8 }}>
                共解析 {importData.length} 条数据，其中{" "}
                <Tag color="green">
                  {importData.filter((item) => item._valid).length} 条有效
                </Tag>
                <Tag color="red" style={{ marginLeft: 8 }}>
                  {importData.filter((item) => !item._valid).length} 条无效
                </Tag>
              </div>
            </div>
          )}

          {importResult && (
            <div style={{ marginTop: 16 }}>
              <h4>导入结果</h4>
              <Descriptions bordered size="small" column={3}>
                <Descriptions.Item label="总数">
                  {importResult.total}
                </Descriptions.Item>
                <Descriptions.Item label="成功">
                  <Tag color="green">{importResult.success}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="失败">
                  <Tag color="red">{importResult.failed}</Tag>
                </Descriptions.Item>
              </Descriptions>

              {importResult.failed > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h5>失败记录</h5>
                  <Table
                    columns={[
                      ...importTemplateColumns[importType],
                      {
                        title: "错误原因",
                        dataIndex: "_errors",
                        render: (errors) => errors?.join("; "),
                      },
                    ]}
                    dataSource={importResult.failedItems}
                    rowKey="_id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 200 }}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* 添加用户弹窗 */}
        <Modal
          title={`添加${newUserType === "student" ? "学生" : "教师"}`}
          visible={addModalVisible}
          width={700}
          onOk={handleAddUser}
          onCancel={() => {
            setAddModalVisible(false);
            newUserForm.resetFields();
          }}
          confirmLoading={adding}
          okText="提交"
          cancelText="取消"
        >
          <Form form={newUserForm} layout="vertical">
            <Form.Item>
              <Radio.Group
                value={newUserType}
                onChange={(e) => setNewUserType(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="student">学生</Radio.Button>
                <Radio.Button value="teacher">教师</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* 动态表单内容 */}
            {newUserType === "student" ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="学生姓名"
                      rules={[{ required: true, message: "请输入学生姓名" }]}
                    >
                      <Input placeholder="如：张三" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="studentId"
                      label="学号"
                      rules={[
                        { required: true, message: "请输入学号" },
                        { pattern: /^\d{10}$/, message: "学号必须为10位数字" },
                        { validator: validateStudentId },
                      ]}
                    >
                      <Input placeholder="如：2023611001" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="major"
                      label="专业"
                      rules={[{ required: true, message: "请输入学生专业" }]}
                    >
                      <Input placeholder="如：计算机科学与技术" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="classId"
                      label="班级"
                      rules={[
                        { required: true, message: "请输入班级" },
                        {
                          pattern: /^[\u4e00-\u9fa5]{2,4}\d{2}班?$/,
                          message: "班级格式：专业+年级+班号",
                        },
                        { validator: validateStudentId },
                      ]}
                    >
                      <Input placeholder="如：计算机2101班" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="Email"
                      label="邮箱"
                      rules={[
                        { required: true, message: "请输入学生邮箱" },
                        {
                          pattern: /^[a-zA-Z0-9._%+-]+@(stu\.)?edu\.cn$/,
                          message: "邮箱（@edu.cn或@stu.edu.cn）",
                        },
                      ]}
                    >
                      <Input placeholder="如：25zhangsan@stu.edu.cn" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="电话"
                      rules={[
                        { required: true, message: "请输入学生电话" },
                        {
                          pattern: /^1[3-9]\d{9}$/,
                          message: "请输入11位有效手机号",
                        },
                      ]}
                    >
                      <Input placeholder="如：13800138000" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="教师姓名"
                      rules={[{ required: true, message: "请输入教师姓名" }]}
                    >
                      <Input placeholder="如：李教授" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="teacherId"
                      label="工号"
                      rules={[
                        { required: true, message: "请输入工号" },
                        { pattern: /^T\d{4}$/, message: "工号格式为T+4位数字" },
                      ]}
                    >
                      <Input placeholder="如：T1001" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="department"
                      label="部门"
                      rules={[
                        { required: true, message: "请输入教师所属学院" },
                      ]}
                    >
                      <Input placeholder="如：计算机系" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="title"
                      label="职称"
                      rules={[{ required: true, message: "请输入职称" }]}
                    >
                      <Input placeholder="如：教授" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="Email"
                      label="邮箱"
                      rules={[
                        { required: true, message: "请输入学生邮箱" },
                        {
                          pattern: /^[a-zA-Z0-9._%+-]+@(stu\.)?edu\.cn$/,
                          message: "邮箱（@edu.cn或@stu.edu.cn）",
                        },
                      ]}
                    >
                      <Input placeholder="如：25zhangsan@stu.edu.cn" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="电话"
                      rules={[
                        { required: true, message: "请输入学生电话" },
                        {
                          pattern: /^1[3-9]\d{9}$/,
                          message: "请输入11位有效手机号",
                        },
                      ]}
                    >
                      <Input placeholder="如：13800138000" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Modal>

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
            {selectedUser?.role === "student" ? "学号" : "工号"}:{" "}
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
            </Button>,
          ]}
          width={700}
        >
          {selectedUser && (
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="头像">
                    <Avatar
                      src={selectedUser.avatar}
                      size={100}
                      style={{ display: "block", margin: "0 auto" }}
                    />
                    <Upload
                      showUploadList={false}
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                      <Button type="link" icon={<UploadOutlined />}>
                        更换头像
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    label="姓名"
                    name="name"
                    initialValue={selectedUser.name}
                    rules={[{ required: true, message: "请输入姓名" }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label={selectedUser.role === "student" ? "学号" : "工号"}
                    name={
                      selectedUser.role === "student"
                        ? "studentId"
                        : "teacherId"
                    }
                    initialValue={
                      selectedUser.studentId || selectedUser.teacherId
                    }
                    rules={[
                      { required: true },
                      {
                        pattern:
                          selectedUser.role === "student"
                            ? /^\d{10}$/
                            : /^T\d{4}$/,
                        message:
                          selectedUser.role === "student"
                            ? "学号必须为10位数字"
                            : "工号格式为T+4位数字",
                      },
                    ]}
                  >
                    <Input disabled={selectedUser.role === "student"} />
                  </Form.Item>
                </Col>
              </Row>

              {selectedUser.role === "student" ? (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="专业"
                        name="major"
                        initialValue={selectedUser.major}
                        rules={[{ required: true, message: "请输入专业" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="班级"
                        name="className"
                        initialValue={selectedUser.className}
                        rules={[{ required: true, message: "请输入班级" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="学院"
                        name="department"
                        initialValue={selectedUser.department}
                        rules={[{ required: true, message: "请输入学院" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="职称"
                        name="title"
                        initialValue={selectedUser.title}
                        rules={[{ required: true, message: "请输入职称" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    initialValue={selectedUser.email}
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      {
                        type: "email",
                        message: "请输入有效的邮箱地址",
                      },
                      {
                        pattern:
                          selectedUser.role === "student"
                            ? /^[a-zA-Z0-9._%+-]+@(stu\.)?edu\.cn$/
                            : /^[a-zA-Z0-9._%+-]+@edu\.cn$/,
                        message:
                          selectedUser.role === "student"
                            ? "请输入学校邮箱(@stu.edu.cn或@edu.cn)"
                            : "请输入教师邮箱(@edu.cn)",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="手机号"
                    name="phone"
                    initialValue={selectedUser.phone}
                    rules={[
                      { required: true, message: "请输入手机号" },
                      {
                        pattern: /^1[3-9]\d{9}$/,
                        message: "请输入有效的手机号",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="状态"
                name="status"
                initialValue={selectedUser.status}
              >
                <Radio.Group>
                  <Radio value="active">正常</Radio>
                  <Radio value="inactive">禁用</Radio>
                </Radio.Group>
              </Form.Item>

              {selectedUser.role === "student" && (
                <Form.Item
                  label="成果数"
                  name="achievementCount"
                  initialValue={selectedUser.achievementCount}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              )}
            </Form>
          )}
        </Modal>

        {/* 批量操作状态提示 */}
        <Modal
          title="批量操作进行中"
          visible={batchActionLoading}
          footer={null}
          closable={false}
        >
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>正在处理批量操作，请稍候...</p>
          </div>
        </Modal>
      </div>
      <Footer style={{ textAlign: "center", padding: "16px 0" }}>
        学生成果展示平台 ©{new Date().getFullYear()}{" "}
        汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};
export default UserManage;
