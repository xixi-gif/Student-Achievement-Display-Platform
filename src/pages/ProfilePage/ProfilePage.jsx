import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Avatar,
  Button,
  Tabs,
  Form,
  Input,
  Table,
  Badge,
  Tag,
  Upload,
  Space,
  Spin,
  message,
  Modal,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  EyeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { authApi, studentApi, achievementApi } from "../../service/api";
import TextArea from "antd/es/input/TextArea";

const { Content } = Layout;
const { TabPane } = Tabs;

const DEFAULT_USER = {
  realName: "",
  bio: "",
  studentNo: "", //展示用的学号
  studentId: 0, //请求成果的id
  major: "",
  grade: "",
  email: "",
  phone: "",
  avatar: "",
  achievementCount: 0,
  username: "",
};

const ERROR_CODES = {
  STUDENT_NOT_FOUND: 1001,
  TOKEN_INVALID: 401,
};

// 状态映射配置
const statusMap = {
  published: { text: "已发布", color: "green" },
  draft: { text: "草稿", color: "orange" },
  rejected: { text: "已拒绝", color: "red" },
  pending: { text: "待审核", color: "blue" },
  approved: { text: "老师已通过", color: "yellow" },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [editMode, setEditMode] = useState(false);
  const [myAchievements, setMyAchievements] = useState([]);
  const [form] = Form.useForm();

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const cachedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const response = await studentApi.getProfile();
      if (response.code === 0) {
        const userData = { ...DEFAULT_USER, ...cachedUser, ...response.data };
        localStorage.setItem("userInfo", JSON.stringify(userData));
        setCurrentUser(userData);
        form.setFieldsValue(userData);
      } else {
        throw {
          code: response.code,
          message: response.message || "获取用户资料失败",
        };
      }
    } catch (error) {
      const { code, message: errorMsg } = error;
      if (code === ERROR_CODES.STUDENT_NOT_FOUND) {
        message.error("学生信息不存在，请联系管理员或重新登录");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      if (code === ERROR_CODES.TOKEN_INVALID) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("user_role");
        message.error("登录已过期，请重新登录");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      const cachedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (Object.keys(cachedUser).length > 0) {
        const userData = { ...DEFAULT_USER, ...cachedUser };
        setCurrentUser(userData);
        form.setFieldsValue(userData);
        message.warning(`获取资料失败，已加载本地缓存：${errorMsg}`);
      } else {
        setCurrentUser(DEFAULT_USER);
        message.error(`获取资料失败：${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await achievementApi.getMyAchievements();
      if (response.code === 0) {
        setMyAchievements(Array.isArray(response.data) ? response.data : []);
      } else {
        message.warning(response.message || "获取成果数据失败");
      }
    } catch (error) {
      const errorMsg = error.message || "获取成果数据失败";
      message.error(errorMsg);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("请先登录");
      navigate("/login");
      setLoading(false);
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (currentUser.studentId !== 0 && !loading) {
      fetchAchievements();
    }
  }, [currentUser.studentId, loading]);

  const getCategoryColor = (category) => {
    const colorMap = {
      竞赛成果: "#1890ff",
      科研项目: "#52c41a",
      学术论文: "#faad14",
      创新设计: "#f5222d",
      期刊论文: "#722ed1",
      软件开发: "#13c2c2",
    };
    return colorMap[category] || "#666";
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        email: values.email,
        phone: values.phone,
        bio: values.bio,
      };
      const response = await studentApi.updateProfile(updatedData);
      if (response.code !== 0) {
        throw {
          code: response.code,
          message: response.message || "更新信息失败",
        };
      }
      const newUserData = { ...currentUser, ...response.data };
      localStorage.setItem("userInfo", JSON.stringify(newUserData));
      setCurrentUser(newUserData);
      message.success(response.message || "个人信息更新成功");
      setEditMode(false);
    } catch (error) {
      const { code, message: errorMsg } = error;
      if (
        code === ERROR_CODES.STUDENT_NOT_FOUND ||
        code === ERROR_CODES.TOKEN_INVALID
      ) {
        if (code === ERROR_CODES.TOKEN_INVALID) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("user_role");
        }
        message.error(
          code === ERROR_CODES.STUDENT_NOT_FOUND
            ? "学生信息已失效"
            : "登录已过期"
        );
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      message.error(errorMsg || "更新失败，请重试");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await achievementApi.deleteAchievement(id);
      if (response.code === 0) {
        message.success(response.message || `成果已删除`);
        fetchAchievements();
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      message.error("删除操作失败，请重试");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    localStorage.removeItem("userInfo");
    message.success("退出登录成功");
    navigate("/login");
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === "uploading") {
      message.loading("头像上传中...", 0);
      return;
    }
    if (info.file.status === "done") {
      message.destroy();
      try {
        const response = info.file.response;
        if (response?.code === 0 && response?.data?.url) {
          const avatarUrl = response.data.url;
          const updatedUser = { ...currentUser, avatar: avatarUrl };
          localStorage.setItem("userInfo", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          form.setFieldsValue({ avatar: avatarUrl });
          message.success(response.message || "头像上传成功");
        } else {
          message.error(response?.message || "头像上传失败");
        }
      } catch (error) {
        message.error("头像处理失败，请重试");
      }
    }
    if (info.file.status === "error") {
      message.destroy();
      message.error("上传失败，请检查网络或文件格式");
    }
  };

  const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件");
      return false;
    }
    const isSupportedFormat = ["image/jpeg", "image/png", "image/gif"].includes(
      file.type
    );
    if (!isSupportedFormat) {
      message.error("仅支持JPG、PNG、GIF格式的图片");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("图片大小不能超过2MB");
      return false;
    }
    return true;
  };

  const achievementColumns = [
    {
      title: "成果名称",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a onClick={() => navigate(`/achievement/detail/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = statusMap[status.toLowerCase()] || {
          text: status,
          color: "gray",
          badge: "default",
        };
        return (
          <Space>
            <Badge status={statusConfig.badge} />
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Space>
        );
      },
    },
    {
      title: "发布日期",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "浏览量",
      dataIndex: "views",
      key: "views",
      render: (views) => (
        <span>
          {" "}
          <EyeOutlined style={{ fontSize: 12 }} /> {views}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              Modal.confirm({
                title: "确认编辑",
                content: `您确定要编辑成果《${record.title}》吗？`,
                okText: "确认",
                cancelText: "取消",
                onOk: () => navigate(`/student/achievements/edit/${record.id}`),
              });
            }}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => {
              Modal.confirm({
                title: "确认删除",
                content: `您确定要删除成果《${record.title}》吗？此操作不可撤销！`,
                okText: "确认删除",
                cancelText: "取消",
                okType: "danger",
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar currentUser={currentUser} />
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Spin size="large" tip="加载中..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />

      <Content style={{ background: "#f0f2f5", padding: "24px 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Card
            title="个人资料"
            bordered={false}
            extra={
              editMode ? (
                <Space size="middle">
                  <Button onClick={() => setEditMode(false)}>取消</Button>
                  <Button type="primary" onClick={handleFormSubmit}>
                    保存
                  </Button>
                </Space>
              ) : (
                <Space size="middle">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(true)}
                  >
                    编辑资料
                  </Button>
                  <Button danger icon={<UserOutlined />} onClick={handleLogout}>
                    退出登录
                  </Button>
                </Space>
              )
            }
            style={{ marginBottom: 24 }}
          >
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <div style={{ marginRight: 32, marginBottom: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    onChange={handleAvatarChange}
                    disabled={!editMode}
                    beforeUpload={beforeAvatarUpload}
                    customRequest={({ file, onSuccess, onError }) => {
                      authApi
                        .uploadAvatar(file)
                        .then((response) => onSuccess(response, file))
                        .catch((error) => onError(error, file));
                    }}
                  >
                    {currentUser.avatar ? (
                      <Avatar
                        size={160}
                        src={currentUser.avatar}
                        shape="square"
                        style={{
                          marginBottom: 16,
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ padding: "36px 0" }}>
                        <UserOutlined style={{ fontSize: 48 }} />
                        <div>{editMode ? "上传头像" : "暂无头像"}</div>
                      </div>
                    )}
                    {editMode && <div>更换头像</div>}
                  </Upload>

                  <h2 style={{ margin: "16px 0 8px" }}>
                    {currentUser.realName}
                  </h2>
                  <div style={{ marginBottom: 8 }}>
                    <Badge status="success" text="学生" />
                    <span style={{ marginLeft: 16 }}>
                      成果数量: {currentUser.achievementCount}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 300 }}>
                <Form
                  form={form}
                  layout="vertical"
                  disabled={!editMode}
                  initialValues={currentUser}
                >
                  {/* 真实姓名设置为始终不可编辑 */}
                  <Form.Item
                    name="realName"
                    label="真实姓名"
                    rules={[{ required: true, message: "请输入真实姓名" }]}
                  >
                    <Input placeholder="请输入真实姓名" disabled />
                  </Form.Item>

                  <Form.Item
                    name="studentNo"
                    label="学号"
                    rules={[{ required: true, message: "请输入学号" }]}
                  >
                    <Input placeholder="请输入学号" disabled />
                  </Form.Item>

                  <Form.Item
                    name="grade"
                    label="年级"
                    rules={[{ required: true, message: "请输入年级" }]}
                  >
                    <Input placeholder="请输入年级" disabled />
                  </Form.Item>

                  <Form.Item
                    name="major"
                    label="专业"
                    rules={[{ required: true, message: "专业" }]}
                  >
                    <Input placeholder="请输入专业" />
                  </Form.Item>

                  <Form.Item
                    name="userName"
                    label="昵称"
                    rules={[{ required: true, message: "请输入昵称" }]}
                  >
                    <Input placeholder="请输入昵称" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { type: "email", message: "请输入正确的邮箱格式" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="联系电话"
                    rules={[
                      { required: true, message: "请输入联系电话" },
                      {
                        pattern: /^1[3-9]\d{9}$/,
                        message: "请输入正确的手机号",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="请输入联系电话"
                    />
                  </Form.Item>

                  <Form.Item
                    name="bio"
                    label="个人简介"
                    rules={[{ required: true, message: "请输入个人简介" }]}
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
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => navigate("/student/achievement/create")}
                  >
                    发布新成果
                  </Button>
                </div>

                <Table
                  columns={achievementColumns}
                  dataSource={myAchievements.slice(0, 3)}
                  rowKey="id"
                  pagination={false}
                  locale={{
                    emptyText: (
                      <div>
                        <p>暂无成果记录</p>
                        <Button
                          type="primary"
                          onClick={() =>
                            navigate("/student/achievement/create")
                          }
                        >
                          立即发布第一个成果
                        </Button>
                      </div>
                    ),
                  }}
                />
                {/* 添加查看更多按钮 */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 16,
                  }}
                >
                  <Button
                    type="link"
                    onClick={() => navigate("/student/my-achievements")}
                  >
                    查看更多成果（共{myAchievements.length}个） →
                  </Button>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default ProfilePage;
