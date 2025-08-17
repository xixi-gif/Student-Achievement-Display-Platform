import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Modal,
  Descriptions,
  Divider,
  Badge,
  Tooltip,
  message,
  Select,
  Spin,
  Popover
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { achievementApi } from "../../service/api";

const { Content, Footer } = Layout;
const { Search } = Input;
const { Option } = Select;

const AchievementReviewPage = () => {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, approved, rejected
  const navigate = useNavigate();

  // 状态映射：后端text -> 页面显示文本
  const statusMap = {
    pending: "待审核",
    approved: "教师已审核",
    rejected: "已驳回",
    published: "已发布",
  };

  // 筛选选项映射（value为后端需要的text值）
  const filterOptions = [
    { value: "all", label: "全部状态" },
    { value: "pending", label: "待审核" },
    { value: "approved", label: "教师已审核" },
    { value: "rejected", label: "已驳回" },
    { value: "published", label: "已发布" },
  ];

  // 从接口获取审核数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchText,
        // 转换筛选状态
        status: filterStatus === "all" ? null : filterStatus,
      };

      // const res = await achievementApi.getPendingList(params);
      const { data: res } = await achievementApi.getPendingList(params);
      // 数据解析逻辑
      const records = res.records || [];
      const formattedData = records.map((item) => ({
        ...item,
        // 若后端返回的是数字状态，需转换为text（根据实际接口返回调整）
        status:
          item.status === 1
            ? "pending"
            : item.status === 4
            ? "approved"
            : item.status === 3
            ? "rejected"
            : item.status === 2
            ? "published"
            : "pending",
        studentName: item.userName, // 后端返回userName对应页面studentName
        createTime: item.createTime || "",
        // 确保其他必要字段有默认值
        category: item.category || "",
        rejectReason: item.rejectReason || "",
        title: item.title || "",
      }));
      setData(formattedData);
      setFilteredData(formattedData);
      setPagination({
        ...pagination,
        current: res.current || 1,
        total: res.total || 0,
        pageSize: res.size || 10,
      });
    } catch (error) {
      console.error("获取审核列表失败:", error);
      message.error("获取数据失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 加载用户信息
    const role = localStorage.getItem("user_role") || "teacher";
    const username = localStorage.getItem("username") || "";
    const avatar = `https://picsum.photos/id/${
      1030 + Math.floor(Math.random() * 10)
    }/200/200`;
    setCurrentUser({ role, username, avatar });

    // 加载审核数据
    fetchData();
  }, [pagination.current, pagination.pageSize, filterStatus, searchText]);

  // 处理分页变化
  const handleTableChange = (pag) => {
    setPagination(pag);
  };

  // 审核通过
  const handleApprove = async (id) => {
    try {
      await achievementApi.approve(id);
      message.success("老师审核通过");
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error("审核通过失败:", error);
      message.error("操作失败，请重试");
    }
  };

  // 审核驳回
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("请填写驳回理由");
      return;
    }
    try {
      await achievementApi.reject(selectedItem.id, rejectReason);
      message.success("已驳回该成果");
      setReviewModalVisible(false);
      setRejectReason("");
      fetchData(); // 重新加载数据
    } catch (error) {
      console.error("驳回失败:", error);
      message.error("操作失败，请重试");
    }
  };

  // 查看成果详情
  const viewDetail = (item) => {
    navigate(`/achievement/detail/${item.id}`);
  };

  // 状态标签渲染
  const statusTag = (status, reason) => {
    switch (status) {
      case "approved":
        return <Tag color="success">{statusMap.approved}</Tag>;
      case "rejected":
        return (
          <Tooltip title={`驳回原因: ${reason}`}>
            <Tag color="error">{statusMap.rejected}</Tag>
          </Tooltip>
        );
      case 'published':
        return <Tag color="blue">{statusMap.published}</Tag>;
      default:
        return <Tag color="processing">{statusMap.pending}</Tag>;
    }
  };

  const columns = [
    {
      title: "成果标题",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Popover
          content={
            <div style={{ width: 300 }}>
              <p><strong>学生：</strong>{record.userName}</p>
              <p><strong>类型：</strong>{record.category || '未分类'}</p>
              <p><strong>关键词：</strong>
              {typeof record.keyword === 'string' 
                ? record.keyword 
                : Array.isArray(record.keyword) 
                  ? record.keyword.join(', ') 
                  : '无'}
            </p>
              <p><strong>成果描述：</strong>{record.description}</p>
            </div>
          }
        >
          <a onClick={() => navigate(`/achievement/detail/${record.id}`)}>
            {text}
          </a>
        </Popover>
      )
    },
    {
      title: "学生姓名",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "成果类型",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status, record) => statusTag(status, record.rejectReason),
    },
    {
      title: "提交时间",
      dataIndex: "createTime",
      key: "createTime",
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedItem(record);
                  setReviewModalVisible(true);
                }}
              >
                驳回
              </Button>
            </>
          )}
          <Button icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: "24px" }}>
        <Card
          title={
            <Space>
              <span>成果待审核</span>
              <Badge
                count={
                  filteredData.filter((d) => d.status === "pending").length
                }
                style={{ backgroundColor: "#1890ff" }}
              />
            </Space>
          }
          bordered={false}
          extra={
            <Space>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
                suffixIcon={<FilterOutlined />}
              >
                {filterOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Search
                placeholder="搜索成果/关键词"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 250 }}
                onSearch={(value) => setSearchText(value)}
              />
            </Space>
          }
        >
          <Table
            columns={columns}
            rowKey="id"
            dataSource={data}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条成果`,
              pageSizeOptions: ["10", "15", "20"],
              position: ["bottomRight"],
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />

          {/* 驳回理由弹窗 */}
          <Modal
            title="驳回理由"
            visible={reviewModalVisible}
            onOk={handleReject}
            onCancel={() => {
              setReviewModalVisible(false);
              setRejectReason("");
            }}
            okText="确认驳回"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="成果标题">
                {selectedItem?.title}
              </Descriptions.Item>
              <Descriptions.Item label="提交学生">
                {selectedItem?.studentName}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <p style={{ marginBottom: 8 }}>请填写驳回理由：</p>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请详细说明驳回原因（至少10字）"
              showCount
              maxLength={200}
            />
          </Modal>
        </Card>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        学生成果展示平台 ©{new Date().getFullYear()}{" "}
        汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default AchievementReviewPage;
