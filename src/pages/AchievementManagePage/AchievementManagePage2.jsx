import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Checkbox,
  Popconfirm,
  message,
  Modal,
  Spin,
  Divider,
  Tooltip,
  Badge,
  Dropdown,
  Menu,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  MoreOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { adminApi, achievementApi } from "../../service/api";

const { Content, Footer } = Layout;
const { Option } = Select;
const { Search } = Input;

// 状态映射
const statusMap = {
  0: { text: "草稿", color: "gray" },
  1: { text: "审核中", color: "orange" },
  2: { text: "已发布", color: "green" },
  3: { text: "已驳回", color: "red" },
  4: { text: "老师已通过", color: "blue" },
};

// 成果分类
const categories = [
  { value: "软件开发", label: "软件开发" },
  { value: "学术论文", label: "学术论文" },
  { value: "竞赛成果", label: "竞赛成果" },
  { value: "创新设计", label: "创新设计" },
  { value: "科研项目", label: "科研项目" },
  { value: "一级项目", label: "一级项目" },
  { value: "教学成果", label: "教学成果" },
];

const AchievementManage = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    status: undefined,
    categoryName: "",
    title: "",
    current: 1,
    pageSize: 10,
    sortField: "createTime",
    sortOrder: "descend",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [batchStatusModalVisible, setBatchStatusModalVisible] = useState(false);
  const [batchDeleteModalVisible, setBatchDeleteModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(2); // 默认选择"已发布"状态
  const [categories, setCategories] = useState([]); // 分类数据状态
  const [categoriesLoading, setCategoriesLoading] = useState(false); // 分类加载状态

  // 获取用户信息和成果数据
  useEffect(() => {
    const initData = async () => {
      const role = localStorage.getItem("user_role") || "admin";
      const username = localStorage.getItem("username") || "管理员";
      setCurrentUser({ role, username });
      // 获取分类数据
      await fetchCategories();
      fetchAchievements();
    };
    initData();
  }, [searchParams]);

  // 获取成果列表
  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const requestData = {
        ...searchParams,
        current: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await adminApi.getAllAchievements(requestData);

      if (response.code === 0) {
        setAchievements(response.data.records || []);
        setPagination({
          ...pagination,
          total: response.data.total,
          current: response.data.current,
        });
      } else {
        throw new Error(response.message || "获取成果数据失败");
      }
    } catch (error) {
      message.error(error.message || "加载成果数据失败");
      console.error("获取成果列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类数据
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await adminApi.getCategoryList();

      if (response.code === 0) {
        // 将接口返回的分类数据转换为Select需要的格式
        const formattedCategories = response.data.map((category) => ({
          value: category.name,
          label: category.name,
          achievementCount: category.achievementCount,
        }));

        setCategories(formattedCategories);
      } else {
        throw new Error(response.message || "获取分类数据失败");
      }
    } catch (error) {
      console.error("获取分类数据失败:", error);
      message.error(error.message || "获取分类数据失败");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (value) => {
    setSearchParams({
      ...searchParams,
      keyword: value,
      title: value,
    });
    setPagination({ ...pagination, current: 1 });
  };

  // 处理状态筛选
  const handleStatusFilter = (value) => {
    setSearchParams({
      ...searchParams,
      status: value || undefined,
    });
    setPagination({ ...pagination, current: 1 });
  };

  // 处理分类筛选
  const handleCategoryFilter = (value) => {
    setSearchParams({
      ...searchParams,
      categoryName: value || undefined,
    });
    setPagination({ ...pagination, current: 1 });
  };

  // 重置筛选条件
  const resetFilters = () => {
    setSearchParams({
      keyword: "",
      status: undefined,
      categoryName: "",
      title: "",
      current: 1,
      pageSize: 10,
      sortField: "createTime",
      sortOrder: "descend",
    });
    setPagination({ ...pagination, current: 1 });
  };

  // 表格选择逻辑
  const onSelectChange = (newSelectedRowKeys, selectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedItems(selectedRows);
  };

  // 批量修改状态
  const handleBatchUpdateStatus = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要修改状态的成果");
      return;
    }

    setLoading(true);
    try {
      const params = {
        achievementIds: selectedRowKeys.map(id => Number(id)), 
        status: selectedStatus,
      };
      const response = await adminApi.updateAchievementStatus(params);

      if (response.code === 0 && response.data) {
        message.success(`成功修改 ${selectedRowKeys.length} 个成果状态`);
        setBatchStatusModalVisible(false);
        fetchAchievements();
        setSelectedRowKeys([]);
      } else {
        throw new Error(response.message || "批量修改状态失败");
      }
    } catch (error) {
      console.error("批量修改状态失败:", error);
      message.error(error.message || "批量修改状态失败");
    } finally {
      setLoading(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的成果");
      return;
    }

    setLoading(true);
    try {
      const response = await adminApi.deleteAchievement(selectedRowKeys);

      if (response.code === 0 && response.data) {
        message.success(`成功删除 ${selectedRowKeys.length} 个成果`);
        setBatchDeleteModalVisible(false);
        fetchAchievements();
        setSelectedRowKeys([]);
      } else {
        throw new Error(response.message || "批量删除失败");
      }
    } catch (error) {
      console.error("批量删除失败:", error);
      message.error(error.message || "批量删除失败");
    } finally {
      setLoading(false);
    }
  };

  // 单个审核通过
  const handleApprove = async (id) => {
    setLoading(true);
    try {
        const params = {
        achievementIds: [Number(id)],
        status: 2, //已发布状态
      };
      const response = await adminApi.batchUpdateStatus(params);

      if (response.code === 0 && response.data) {
        message.success("审核通过成功");
        fetchAchievements();
      } else {
        throw new Error(response.message || "审核操作失败");
      }
    } catch (error) {
      console.error("审核操作失败:", error);
      message.error(error.message || "审核操作失败");
    } finally {
      setLoading(false);
    }
  };

  // 单个删除
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await adminApi.deleteAchievement([id]);

      if (response.code === 0 && response.data) {
        message.success("删除成功");
        fetchAchievements();
      } else {
        throw new Error(response.message || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      message.error(error.message || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理表格变化（分页、排序等）
  const handleTableChange = (paginationConfig, filters, sorter) => {
    setPagination({
      ...pagination,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });

    setSearchParams({
      ...searchParams,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  // 显示批量修改状态确认对话框
  const showBatchStatusModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要修改状态的成果");
      return;
    }
    setBatchStatusModalVisible(true);
  };

  // 显示批量删除确认对话框
  const showBatchDeleteModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的成果");
      return;
    }
    setBatchDeleteModalVisible(true);
  };

  return (
    <Layout className="layout">
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: "0 50px", marginTop: 20 }}>
        <div
          className="site-layout-content"
          style={{ background: "#fff", padding: 24, minHeight: 280 }}
        >
          <Card
            title="成果管理"
            bordered={false}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/student/achievement/create`)}
              >
                添加成果
              </Button>
            }
          >
            {/* 筛选和搜索区域 */}
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space size="middle">
                <Select
                  value={searchParams.status}
                  onChange={handleStatusFilter}
                  style={{ width: 180 }}
                  placeholder="全部状态"
                  allowClear
                >
                  <Option value="">全部状态</Option>
                  <Option value={0}>草稿</Option>
                  <Option value={1}>审核中</Option>
                  <Option value={2}>已发布</Option>
                  <Option value={3}>已驳回</Option>
                  <Option value={4}>老师已通过</Option>
                </Select>

                <Select
                  value={searchParams.categoryName}
                  onChange={handleCategoryFilter}
                  style={{ width: 180 }}
                  placeholder="全部分类"
                  allowClear
                >
                  <Option value="">全部分类</Option>
                  {categories.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>

                <Button onClick={resetFilters} icon={<SyncOutlined />}>
                  重置
                </Button>
              </Space>

              <Search
                placeholder="搜索成果标题"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchParams.keyword}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, keyword: e.target.value })
                }
                onSearch={handleSearch}
              />
            </div>

            {/* 批量操作区域 */}
            {selectedRowKeys.length > 0 && (
              <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
                <Button
                  type="primary"
                  onClick={showBatchStatusModal}
                  icon={<CheckCircleOutlined />}
                >
                  批量修改状态 ({selectedRowKeys.length})
                </Button>
                <Button
                  danger
                  onClick={showBatchDeleteModal}
                  icon={<DeleteOutlined />}
                >
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </div>
            )}

            {/* 成果表格 */}
            <Table
              columns={[
                {
                  title: "成果标题",
                  dataIndex: "title",
                  key: "title",
                  ellipsis: true,
                  render: (text, record) => (
                    <a
                      onClick={() =>
                        navigate(`/achievement/detail/${record.id}`)
                      }
                    >
                      {text}
                    </a>
                  ),
                },
                {
                  title: "学生",
                  dataIndex: "userName",
                  key: "userName",
                },
                {
                  title: "分类",
                  dataIndex: "category",
                  key: "category",
                  render: (category) => <Tag color="blue">{category}</Tag>,
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => {
                    const info = statusMap[status] || {
                      text: "未知状态",
                      color: "gray",
                    };
                    return <Tag color={info.color}>{info.text}</Tag>;
                  },
                },
                {
                  title: "提交时间",
                  dataIndex: "createTime",
                  key: "createTime",
                  render: (time) =>
                    time ? new Date(time).toLocaleString() : "-",
                },
                {
                  title: "操作",
                  key: "action",
                  width: 200,
                  render: (_, record) => (
                    <Space size="small">
                      <Tooltip title="查看详情">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            navigate(`/achievement/detail/${record.id}`)
                          }
                        />
                      </Tooltip>

                      <Tooltip title="编辑成果">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() =>
                            navigate(`/student/achievements/edit/${record.id}`)
                          }
                        />
                      </Tooltip>

                      {record.status === 4 && (
                        <Tooltip title="管理员发布">
                          <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApprove(record.id)}
                            style={{ color: "#52c41a" }}
                          />
                        </Tooltip>
                      )}

                      <Popconfirm
                        title="确定要删除此成果吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Tooltip title="删除">
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                          />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              dataSource={achievements}
              rowKey="id"
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: onSelectChange,
              }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        学生成果展示平台 ©{new Date().getFullYear()}{" "}
        汕头大学数学与计算机学院计算机系
      </Footer>

      {/* 批量修改状态弹窗 */}
      <Modal
        title="批量修改成果状态"
        visible={batchStatusModalVisible}
        onOk={handleBatchUpdateStatus}
        onCancel={() => setBatchStatusModalVisible(false)}
        okText="确认修改"
        cancelText="取消"
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 16 }}>
          <p>您确定要修改以下 {selectedRowKeys.length} 个成果的状态吗？</p>
          <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 10 }}>
            {selectedItems.map((item) => (
              <div key={item.id} style={{ padding: 4 }}>
                - {item.title} (当前状态:{" "}
                {statusMap[item.status]?.text || "未知"})
              </div>
            ))}
          </div>
        </div>
        <div>
          <span style={{ marginRight: 8 }}>修改为:</span>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 120 }}
          >
            <Option value={1}>审核中</Option>
            <Option value={2}>已发布</Option>
            <Option value={3}>已驳回</Option>
            <Option value={4}>老师已通过</Option>
          </Select>
        </div>
      </Modal>

      {/* 批量删除确认弹窗 */}
      <Modal
        title="批量删除确认"
        visible={batchDeleteModalVisible}
        onOk={handleBatchDelete}
        onCancel={() => setBatchDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>您确定要删除以下 {selectedItems.length} 个成果吗？</p>
        <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 10 }}>
          {selectedItems.map((item) => (
            <div key={item.id} style={{ padding: 4 }}>
              - {item.title} (状态: {statusMap[item.status]?.text || "未知"})
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

export default AchievementManage;
