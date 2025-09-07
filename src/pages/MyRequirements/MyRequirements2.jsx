import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Modal,
  Spin,
  message,
  Empty,
  Input,
  Select,
  Popconfirm,
  Pagination,
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
  MessageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Navbar from "../Navbar/Navbar";
import { authApi } from "../../service/api";

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

// 状态映射配置
const statusNumMap = { 1: "pending", 2: "in_progress", 3: "completed" };
const statusTextMap = { pending: 1, in_progress: 2, completed: 3 };
const statusMap = {
  all: { color: "gray", text: "全部" },
  pending: { color: "orange", text: "待接单", icon: <ClockCircleOutlined /> },
  in_progress: { color: "blue", text: "进行中", icon: <Spin size="small" /> },
  completed: { color: "green", text: "已完成", icon: <CheckOutlined /> },
};

// 角色映射配置
const roleMap = {
  admin: "超级管理员",
  teacher: "教师",
  student: "学生",
  guest: "访客",
};
const roleColorMap = {
  admin: "red",
  teacher: "orange",
  student: "green",
  guest: "gray",
};

const MyRequirementsPage = () => {
  const navigate = useNavigate();

  // 状态管理
  const [requirements, setRequirements] = useState([]);
  const [allRequirements, setAllRequirements] = useState([]); // 存储所有需求数据
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 申请人模态框状态
  const [applicantModal, setApplicantModal] = useState({
    visible: false,
    currentRequirement: null,
    currentApplicants: [],
    loading: false,
    pagination: { current: 1, pageSize: 5, total: 0 },
  });

  // 加载我的需求列表
  const fetchMyRequirements = async (
    current = pagination.current,
    pageSize = pagination.pageSize
  ) => {
    try {
      setLoading(true);
      const params = {
        current,
        pageSize,
        sortField: "publishTime",
        sortOrder: "descend",
      };

      const response = await authApi.getMyRequirements(params);
      if (response.code !== 0)
        throw new Error(response.message || "获取需求失败");

      const { records, total, current: currentPage, size } = response.data;

      const formattedRequirements = records.map((item) => ({
        id: item.requirementId.toString(),
        title: item.title || "",
        type: item.requireType,
        description: item.description || "",
        status: statusNumMap[item.status],
        publishTime: item.publishTime,
        deadline: item.deadline,
        budget: `${item.budget}元`,
        urgency: item.urgency,
        requirementId: item.requirementId,
        applicants: item.applicants || [],
      }));

      setRequirements(formattedRequirements);
      setAllRequirements(formattedRequirements);

      // 更新分页信息
      setPagination((prev) => ({
        ...prev,
        total,
        current: currentPage,
        pageSize: size,
      }));
    } catch (error) {
      console.error("加载我的需求失败:", error);
      message.error(error.message || "网络错误，获取我的需求失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和分页参数变化时重新获取数据
  useEffect(() => {
    fetchMyRequirements();
  }, [pagination.current, pagination.pageSize]);

  const filteredRequirements = allRequirements.filter((item) => {
    // 如果没有搜索词且状态为"all"，则显示所有数据
    if (!searchText && selectedStatus === "all") {
      return requirements;
    }
    const statusMatch =
      selectedStatus === "all" || item.status === selectedStatus;
    const searchMatch =
      !searchText ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase());
    return statusMatch && searchMatch;
  });

  // 搜索处理
  const handleSearch = (value) => {
    setSearchText(value);
    // 搜索时重置到第一页并重新获取数据
    // setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 状态筛选处理
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    // 筛选时重置到第一页并重新获取数据
    // setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
    // 分页变化时不需要立即调用fetchMyRequirements，因为useEffect会处理
  };

  // 获取申请人列表
  const fetchApplicants = async (requirementId, current, pageSize) => {
    try {
      setApplicantModal((prev) => ({ ...prev, loading: true }));
      const requestData = { current, pageSize, requirementId };
      const response = await authApi.getApplicationList(requestData);
      if (response.code !== 0)
        throw new Error(response.message || "获取申请人失败");

      const { records, total } = response.data;
      const formattedApplicants = records.map((item) => ({
        applicationId: item.id?.toString() || "",
        userId: item.userId?.toString() || "",
        name: item.userName || "未知用户",
        role: item.userRole || "",
        avatar: item.userAvatar || "",
        applyTime: item.applyTime || "",
        introduction: item.introduction || "无申请说明",
        isSelected: item.status === 1,
      }));

      setApplicantModal((prev) => ({
        ...prev,
        currentApplicants: formattedApplicants,
        pagination: { ...prev.pagination, total, current },
        loading: false,
      }));
    } catch (error) {
      console.error("获取申请人列表失败:", error);
      message.error(error.message || "获取申请人信息失败");
      setApplicantModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // 打开申请人模态框
  const handleOpenApplicants = async (requirement) => {
    setApplicantModal((prev) => ({
      ...prev,
      visible: true,
      currentRequirement: requirement,
    }));
    await fetchApplicants(requirement.requirementId, 1, 5);
  };

  // 申请人分页处理
  const handleApplicantPaginationChange = async (current, pageSize) => {
    const { currentRequirement } = applicantModal;
    if (currentRequirement)
      await fetchApplicants(
        currentRequirement.requirementId,
        current,
        pageSize
      );
  };

  // 关闭申请人模态框
  const handleCloseApplicants = () => {
    setApplicantModal({
      visible: false,
      currentRequirement: null,
      currentApplicants: [],
      loading: false,
      pagination: { current: 1, pageSize: 5, total: 0 },
    });
  };

  // 同意申请
  const handleApproveApplicant = async (requirementId, userId) => {
    const parsedReqId = Number(requirementId);
    const parsedUserId = Number(userId);

    if (isNaN(parsedReqId) || parsedReqId <= 0) {
      message.error("需求ID无效，请刷新后重试");
      return;
    }
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      message.error("申请人ID无效，请刷新后重试");
      return;
    }

    Modal.confirm({
      title: "确认选择",
      content: "确定选择该申请人承接此需求吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          setActionLoading(true);
          const data = {
            applicantsId: parsedUserId,
            requirementId: parsedReqId,
            status: 1,
          };
          const response = await authApi.agreeApplication(data);
          if (response.code !== 0)
            throw new Error(response.message || "同意申请失败");

          await fetchApplicants(
            parsedReqId,
            applicantModal.pagination.current,
            applicantModal.pagination.pageSize
          );
          message.success("已成功选择申请人承接需求");
        } catch (error) {
          console.error("同意申请人失败:", error);
          message.error(error.message || "操作失败，申请可能已不存在");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // 拒绝申请
  const handleRejectApplicant = async (requirementId, userId) => {
    const parsedReqId = Number(requirementId);
    const parsedUserId = Number(userId);

    if (isNaN(parsedReqId) || parsedReqId <= 0) {
      message.error("需求ID无效，请刷新后重试");
      return;
    }
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      message.error("申请人ID无效，请刷新后重试");
      return;
    }

    Modal.confirm({
      title: "确认拒绝",
      content: "确定拒绝该申请人的接单请求吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          setActionLoading(true);
          const data = {
            applicantsId: parsedUserId,
            requirementId: parsedReqId,
            status: 2,
          };
          const response = await authApi.agreeApplication(data);
          if (response.code !== 0)
            throw new Error(response.message || "拒绝申请失败");

          await fetchApplicants(
            parsedReqId,
            applicantModal.pagination.current,
            applicantModal.pagination.pageSize
          );
          message.success("已拒绝该申请人的接单请求");
        } catch (error) {
          console.error("拒绝申请人失败:", error);
          message.error(error.message || "操作失败，申请可能已不存在");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // 删除需求
  const handleDeleteRequirement = async (requirementId) => {
    try {
      setActionLoading(true);
      const response = await authApi.deleteRequirements(requirementId);
      if (response.code !== 0) throw new Error(response.message || "删除失败");

      // 重新获取数据以更新列表
      await fetchMyRequirements(pagination.current, pagination.pageSize);
      message.success("需求已删除");
    } catch (error) {
      console.error("删除需求失败:", error);
      message.error(error.message || "网络错误，删除失败");
    } finally {
      setActionLoading(false);
    }
  };

  // 联系申请人
  const handleContactApplicant = (userId, userName) => {
    navigate(
      `/messages?toUserId=${userId}&toUserName=${encodeURIComponent(userName)}`
    );
    handleCloseApplicants();
  };

  // 更新需求状态
  const handleStatusSelect = async (newStatus, requirement) => {
    if (requirement.status === newStatus) return;

    Modal.confirm({
      title: "确认更新状态",
      content: `确定将需求状态从【${
        statusMap[requirement.status].text
      }】修改为【${statusMap[newStatus].text}】吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          setActionLoading(true);
          const updateData = {
            id: parseInt(requirement.id),
            status: statusTextMap[newStatus],
          };
          const response = await authApi.updateRequirement(updateData);
          if (response.code !== 0)
            throw new Error(response.message || "更新状态失败");

          // 重新获取数据以更新列表
          await fetchMyRequirements(pagination.current, pagination.pageSize);
          message.success(`需求已更新为${statusMap[newStatus].text}`);
        } catch (error) {
          console.error("更新状态失败:", error);
          message.error(error.message || "网络错误，状态更新失败");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Navbar />
      <Content style={{ padding: "24px 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                width: "60%",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                我的需求
              </h2>
              <Search
                placeholder="搜索需求标题或描述"
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                style={{ width: 300 }}
                onSearch={handleSearch}
              />
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={handleStatusChange}
                value={selectedStatus}
              >
                <Option value="all">全部状态</Option>
                <Option value="pending">待接单</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
              </Select>
            </div>
          </div>

          {loading ? (
            <Card style={{ padding: "60px 0", textAlign: "center" }}>
              <Spin size="large" tip="正在加载我的需求..." />
            </Card>
          ) : requirements.length === 0 ? (
            <Card style={{ padding: "80px 0", textAlign: "center" }}>
              <Empty
                description="暂无符合条件的需求"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  onClick={() => navigate("/publish-requirement")}
                >
                  发布新需求
                </Button>
              </Empty>
            </Card>
          ) : (
            <>
              <List
                itemLayout="vertical"
                dataSource={filteredRequirements}
                renderItem={(requirement) => (
                  <Card
                    key={requirement.id}
                    style={{ marginBottom: 16, borderRadius: 4 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Tag color={statusMap[requirement.status].color}>
                            {statusMap[requirement.status].text}
                          </Tag>
                          {requirement.urgency === "high" && (
                            <Tag color="red" style={{ marginLeft: 8 }}>
                              紧急
                            </Tag>
                          )}
                        </div>
                        <h3
                          style={{ margin: 0, fontSize: 16, fontWeight: 500 }}
                        >
                          {requirement.title}
                          <Tag style={{ marginLeft: 8, fontSize: 12 }}>
                            {requirement.type}
                          </Tag>
                        </h3>
                      </div>
                      <Space>
                        <Select
                          value={requirement.status}
                          style={{ width: 130 }}
                          onChange={(value) =>
                            handleStatusSelect(value, requirement)
                          }
                        >
                          <Option value="pending">待接单</Option>
                          <Option value="in_progress">进行中</Option>
                          <Option value="completed">已完成</Option>
                        </Select>
                        <Popconfirm
                          title="确定删除该需求吗？"
                          description="删除后不可恢复，是否继续？"
                          onConfirm={() =>
                            handleDeleteRequirement(requirement.id)
                          }
                          okText="是"
                          cancelText="否"
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            loading={actionLoading}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </Space>
                    </div>
                    <div
                      style={{
                        marginBottom: 16,
                        color: "#555",
                        lineHeight: 1.6,
                      }}
                    >
                      {requirement.description.length > 150
                        ? `${requirement.description.substring(0, 150)}...`
                        : requirement.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 16,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#666",
                          fontSize: 13,
                        }}
                      >
                        <DollarOutlined
                          style={{ marginRight: 4, fontSize: 14 }}
                        />
                        {requirement.budget}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#666",
                          fontSize: 13,
                        }}
                      >
                        <ClockCircleOutlined
                          style={{ marginRight: 4, fontSize: 14 }}
                        />
                        截止: {new Date(requirement.deadline).toLocaleString()}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#666",
                          fontSize: 13,
                        }}
                      >
                        <UserOutlined
                          style={{ marginRight: 4, fontSize: 14 }}
                        />
                        发布:{" "}
                        {new Date(requirement.publishTime).toLocaleString()}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        type="primary"
                        onClick={() => handleOpenApplicants(requirement)}
                        size="small"
                      >
                        申请人
                      </Button>
                    </div>
                  </Card>
                )}
              />
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条`}
                />
              </div>
            </>
          )}

          {/* 申请人模态框 */}
          <Modal
            title={`《${applicantModal.currentRequirement?.title}》的申请人`}
            open={applicantModal.visible}
            onCancel={handleCloseApplicants}
            footer={[
              <Button key="close" onClick={handleCloseApplicants}>
                关闭
              </Button>,
            ]}
            width={600}
            destroyOnClose
          >
            {applicantModal.loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin tip="正在加载申请人列表..." />
              </div>
            ) : applicantModal.currentApplicants.length === 0 ? (
              <Empty description="暂无申请人" />
            ) : (
              <>
                <List
                  dataSource={applicantModal.currentApplicants}
                  renderItem={(applicant) => (
                    <Card
                      key={applicant.userId}
                      style={{ marginBottom: 12 }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <div style={{ display: "flex", marginBottom: 12 }}>
                        <Avatar
                          src={applicant.avatar || undefined}
                          size="large"
                          style={{ marginRight: 12 }}
                        >
                          {!applicant.avatar && applicant.name.charAt(0)}
                        </Avatar>
                        <div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <h4 style={{ margin: 0, fontSize: 15 }}>
                              {applicant.name}
                            </h4>
                            <Tag
                              color={roleColorMap[applicant.role]}
                              style={{ marginLeft: 8 }}
                              size="small"
                            >
                              {roleMap[applicant.role] || "未知角色"}
                            </Tag>
                            {applicant.isSelected && (
                              <Tag
                                color="green"
                                style={{ marginLeft: 8 }}
                                size="small"
                              >
                                已同意
                              </Tag>
                            )}
                          </div>
                          <div
                            style={{
                              color: "#888",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            申请时间:{" "}
                            {applicant.applyTime
                              ? new Date(applicant.applyTime).toLocaleString()
                              : "未知时间"}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <h5
                          style={{
                            margin: 0,
                            marginBottom: 6,
                            fontSize: 13,
                            color: "#666",
                          }}
                        >
                          申请说明:
                        </h5>
                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "#333",
                          }}
                        >
                          {applicant.introduction}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <Button
                          icon={<MessageOutlined />}
                          onClick={() =>
                            handleContactApplicant(
                              applicant.userId,
                              applicant.name
                            )
                          }
                          size="small"
                        >
                          联系
                        </Button>
                        {applicantModal.currentRequirement?.status !==
                          "completed" && (
                          <>
                            <Button
                              danger
                              icon={<CloseOutlined />}
                              onClick={() =>
                                handleRejectApplicant(
                                  applicantModal.currentRequirement
                                    .requirementId,
                                  applicant.userId
                                )
                              }
                              size="small"
                              loading={actionLoading}
                              disabled={applicant.isSelected}
                            >
                              拒绝接单
                            </Button>
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() =>
                                handleApproveApplicant(
                                  applicantModal.currentRequirement
                                    .requirementId,
                                  applicant.userId
                                )
                              }
                              size="small"
                              loading={actionLoading}
                              disabled={applicant.isSelected}
                            >
                              同意接单
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  )}
                />
                <div style={{ textAlign: "right", marginTop: 16 }}>
                  <Pagination
                    current={applicantModal.pagination.current}
                    pageSize={applicantModal.pagination.pageSize}
                    total={applicantModal.pagination.total}
                    onChange={handleApplicantPaginationChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条`}
                  />
                </div>
              </>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MyRequirementsPage;
