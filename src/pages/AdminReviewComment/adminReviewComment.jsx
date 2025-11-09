import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Select,
  Pagination,
  Typography,
  Row,
  Col,
  Input
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { commentApi, achievementApi } from "../../service/api";
import moment from "moment";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

// 评论状态映射
const commentStatusMap = {
  0: "待审核",
  1: "已通过",
  2: "已驳回",
};

// 评论状态颜色
const commentStatusColors = {
  0: "orange",
  1: "green",
  2: "red",
};

const AdminCommentManagementPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 筛选条件 - 只保留状态筛选
  const [filters, setFilters] = useState({
    status: "",
  });
  
  // 驳回原因相关状态
  const [rejectModal, setRejectModal] = useState({
    visible: false,
    commentIds: [],
    reason: "",
  });

  // 检查是否为管理员
  const checkAdmin = () => {
    const role = localStorage.getItem("user_role");
    if (role !== "admin") {
      message.error("权限不足，只有管理员可以访问此页面");
      navigate("/");
      return false;
    }
    return true;
  };

  // 获取用户信息
  const fetchUserInfo = () => {
    const token = localStorage.getItem("token");
    const role = token ? localStorage.getItem("user_role") : "";
    const username = token ? localStorage.getItem("username") : "";
    const userId = token ? localStorage.getItem("userId") : null;
    setCurrentUser({ role, username, userId });
  };

  // 获取评论列表
  const fetchComments = async () => {
    if (!checkAdmin()) return;
    
    try {
      setLoading(true);
      const params = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        // 传递数值类型的状态给后端
        status: filters.status ? Number(filters.status) : undefined,
      };

      const response = await commentApi.getCommentList(params);
      
      if (response.code === 0) {
        setComments(response.data.records || []);
        setPagination({
          ...pagination,
          total: response.data.total || 0,
        });
      } else {
        throw new Error(response.message || "获取评论列表失败");
      }
    } catch (error) {
      console.error("获取评论失败:", error);
      message.error(error.message || "获取评论失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchComments();
  }, [pagination.current, pagination.pageSize, filters.status]);

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  // 处理筛选变化
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 处理全选和选择变化
  const handleSelectChange = (selectedRowKeys) => {
    setSelectedComments(selectedRowKeys);
  };

  // 审核评论（单个或批量）
  const reviewComments = async (status, commentIds = []) => {
    const targetIds = commentIds.length > 0 ? commentIds : selectedComments;
    
    if (targetIds.length === 0) {
      message.warning("请选择要操作的评论");
      return;
    }
    
    // 如果是驳回操作，显示驳回原因输入框
    if (status === 2) {
      setRejectModal({
        visible: true,
        commentIds: targetIds,
        reason: "",
      });
      return;
    }
    
    try {
      const params = {
        commentIds: targetIds,
        status,
      };
      
      const response = await commentApi.batchUpdateStatus(params);
      
      if (response.code === 0) {
        message.success(`已${status === 1 ? "通过" : "驳回"}选中的评论`);
        setSelectedComments([]);
        fetchComments();
      } else {
        throw new Error(response.message || "操作失败");
      }
    } catch (error) {
      console.error("审核评论失败:", error);
      message.error(error.message || "审核评论失败");
    }
  };

  // 确认驳回
  const confirmReject = async () => {
    if (!rejectModal.reason.trim()) {
      message.warning("请填写驳回原因");
      return;
    }
    
    if (rejectModal.reason.trim().length < 5) {
      message.warning("驳回原因至少需要5个字符");
      return;
    }
    
    try {
      const params = {
        commentIds: rejectModal.commentIds,
        status: 2,
        rejectReason: rejectModal.reason.trim(),
      };
      
      const response = await commentApi.batchUpdateStatus(params);
      
      if (response.code === 0) {
        message.success("已驳回选中的评论");
        setRejectModal({
          visible: false,
          commentIds: [],
          reason: "",
        });
        setSelectedComments([]);
        fetchComments();
      } else {
        throw new Error(response.message || "操作失败");
      }
    } catch (error) {
      console.error("驳回评论失败:", error);
      message.error(error.message || "驳回评论失败");
    }
  };

  // 删除评论（单个或批量）
  const deleteComments = async (commentIds = []) => {
    const targetIds = commentIds.length > 0 ? commentIds : selectedComments;
    
    if (targetIds.length === 0) {
      message.warning("请选择要删除的评论");
      return;
    }
    
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除选中的 ${targetIds.length} 条评论吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await commentApi.batchDeleteComments({ commentIds: targetIds });
          
          if (response.code === 0) {
            message.success("已删除选中的评论");
            setSelectedComments([]);
            fetchComments();
          } else {
            throw new Error(response.message || "删除失败");
          }
        } catch (error) {
          console.error("删除评论失败:", error);
          message.error(error.message || "删除评论失败");
        }
      },
    });
  };

  // 表格列定义 - 移除了自定义选择列
  const columns = [
    {
      title: "评论内容",
      dataIndex: "content",
      key: "content",
      render: (text) => <Text ellipsis={{ rows: 2, expandable: true }}>{text}</Text>,
    },
    {
      title: "评论用户",
      dataIndex: ["user", "userName"],
      key: "username",
      width: 120,
    },
    {
      title: "所属成果",
      key: "achievement",
      width: 150,
      render: (_, record) => (
        <Text 
          ellipsis 
          onClick={() => navigate(`/achievement/${record.achievementId}`)}
          style={{ cursor: 'pointer', color: '#1890ff' }}
        >
          {record.achievementTitle || `成果ID: ${record.achievementId}`}
        </Text>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={commentStatusColors[status]}>
          {commentStatusMap[status]}
        </Tag>
      ),
      filters: [
        { text: "待审核", value: "0" },
        { text: "已通过", value: "1" },
        { text: "已驳回", value: "2" },
      ],
      onFilter: (value, record) => record.status.toString() === value,
    },
    {
      title: "驳回原因",
      dataIndex: "rejectReason",
      key: "rejectReason",
      width: 150,
      render: (reason) => reason || <Text type="secondary">无</Text>,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 160,
      render: (time) => moment(time).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 0 && (
            <>
              <Button
                type="text"
                size="small"
                style={{ color: "green" }}
                icon={<CheckOutlined />}
                onClick={() => reviewComments(1, [record.id])}
              >
                通过
              </Button>
              <Button
                type="text"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setRejectModal({
                    visible: true,
                    commentIds: [record.id],
                    reason: "",
                  });
                }}
              >
                驳回
              </Button>
            </>
          )}
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteComments([record.id])}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: "24px 48px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Title level={2}>评论管理</Title>
          
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col flex="left">
                <Space size="middle">
                  {/* 只保留状态筛选 */}
                  <Select
                    placeholder="选择状态"
                    style={{ width: 150 }}
                    allowClear
                    onChange={(value) => handleFilterChange("status", value)}
                    suffixIcon={<FilterOutlined />}
                  >
                    <Option value="0">待审核</Option>
                    <Option value="1">已通过</Option>
                    <Option value="2">已驳回</Option>
                  </Select>
                </Space>
              </Col>
              
              <Col>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={() => reviewComments(1)}
                  >
                    批量通过
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseOutlined />}
                    onClick={() => {
                      if (selectedComments.length > 0) {
                        setRejectModal({
                          visible: true,
                          commentIds: selectedComments,
                          reason: "",
                        });
                      } else {
                        message.warning("请选择要驳回的评论");
                      }
                    }}
                  >
                    批量驳回
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={deleteComments}
                  >
                    批量删除
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
          
          <Card>
            <Table
              columns={columns}
              dataSource={comments}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1200 }}
              // 只保留表格自带的选择功能
              rowSelection={{
                type: "checkbox",
                selectedRowKeys: selectedComments,
                onChange: handleSelectChange,
              }}
            />
            
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条评论`}
              />
            </div>
          </Card>
        </div>
      </Content>
      
      {/* 驳回原因输入模态框 */}
      <Modal
        title={rejectModal.commentIds.length > 1 ? "批量驳回评论" : "驳回评论"}
        visible={rejectModal.visible}
        onOk={confirmReject}
        onCancel={() => setRejectModal({ ...rejectModal, visible: false })}
        okText="确认驳回"
        cancelText="取消"
      >
        <p>请填写驳回原因（将应用于所有选中的评论）：</p>
        <Input.TextArea
          rows={4}
          value={rejectModal.reason}
          onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
          placeholder="请说明驳回原因（至少3个字符）"
          showCount
          maxLength={200}
        />
      </Modal>
    </Layout>
  );
};

export default AdminCommentManagementPage;