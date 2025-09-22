import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Divider,
  Modal,
  message,
  Select,
  Badge,
  Popover,
  Switch,
  Descriptions,
  Tooltip,
} from "antd";
import {
  StarOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { achievementApi, adminApi } from "../../service/api";

const { Content, Footer } = Layout;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const AchievementRecommendPage = () => {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    category: "",
    minLevel: null,
  });
  const [commentModal, setCommentModal] = useState({
    visible: false,
    currentItem: null,
    comment: "",
  });
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 获取可推荐成果列表
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        pageSize: pagination.pageSize, // 注意接口参数是pageSize而非size
        ...searchParams,
      };

      // 使用新接口获取数据
      const { data: response } =
        await achievementApi.getTeacherPersonalRecommendations(params);

      // 转换数据格式 - 匹配新接口返回的字段
      const formattedData = (response.records || []).map((item) => ({
        ...item,
        userName: item.studentName,
        isRecommended: item.recommended,
        keyword: item.keywords || [],
        category: item.category || "未分类",
        userRecommendLevel: item.personalRecommendLevel, // 个人设置的等级
        avgRecommendLevel: item.averageRecommendLevel, // 平均等级
        views:item.views,
      }));

      setData(formattedData);
      setPagination({
        ...pagination,
        current: response.current || 1,
        pageSize: response.size || 10,
        total: response.total || 0,
      });
    } catch (error) {
      console.error("获取推荐列表失败:", error);
      message.error(error.message || "获取数据失败");
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
        setCategories(
          response.data.map((item) => ({
            value: item.name,
            label: item.name,
          }))
        );
      }
    } catch (error) {
      console.error("获取分类失败:", error);
      message.error("获取分类数据失败");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    const hide = message.loading("正在加载推荐成果数据...", 0);
    Promise.all([fetchData(), fetchCategories()]).finally(hide);
  }, [pagination.current, searchParams]);

  // 处理推荐状态切换
  const handleToggleRecommend = async (id, recommended, title) => {
    Modal.confirm({
      title: recommended ? "确认推荐" : "确认取消推荐",
      content: `确定要${recommended ? "推荐" : "取消推荐"}成果《${title}》吗？`,
      okText: recommended ? "确认推荐" : "确认取消",
      cancelText: "再想想",
      onOk: async () => {
        try {
          await achievementApi.toggleRecommend(id);
          await fetchData(); // 重新获取数据以更新平均等级
          message.success(recommended ? "已推荐该成果" : "已取消推荐");
        } catch (error) {
          message.error(`操作失败:${error.message}`);
        }
      },
    });
  };

  // 处理推荐等级变更
  const handleLevelChange = async (id, level) => {
    try {
      // 保存个人设置的等级
      await achievementApi.setRecommendLevel(id, level);
      // 重新获取数据以获取最新的平均等级
      await fetchData();

      // 查找更新后的记录
      const updatedItem = data.find((item) => item.id === id);
      if (updatedItem) {
        // 个人等级与平均等级不一致时显示提示
        if (updatedItem.userRecommendLevel !== updatedItem.avgRecommendLevel) {
          message.info(
            <>
              您已设置为{getLevelLabel(updatedItem.userRecommendLevel)}
              <br />
              当前展示的是所有教师推荐的平均等级：
              {getLevelLabel(updatedItem.avgRecommendLevel)}
            </>,
            5 // 延长提示显示时间
          );
        } else {
          message.success(`已设置为${getLevelLabel(level)}`);
        }
      }
    } catch (error) {
      message.error(`设置失败: ${error.message}`);
    }
  };

  // 等级标签映射
  const getLevelLabel = (level) => {
    const labels = [
      "无",
      "⭐ 不错",
      "⭐⭐ 良好",
      "⭐⭐⭐ 优秀",
      "⭐⭐⭐⭐ 重点",
      "⭐⭐⭐⭐⭐ 强烈",
    ];
    return labels[level] || "未知";
  };

  // 处理推荐说明提交
  const handleCommentSubmit = async () => {
    const { currentItem, comment } = commentModal;
    if (comment.trim().length < 5 && comment.trim().length > 0) {
      message.warning("推荐说明至少需要5个字");
      return;
    }
    try {
      await achievementApi.setRecommendComment(currentItem.id, comment);
      await fetchData(); // 重新获取数据
      setCommentModal({ ...commentModal, visible: false });
      message.success("推荐说明已保存");
    } catch (error) {
      message.error(`操作失败${error.message}`);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: "成果标题",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text, record) => (
        <Popover
          content={
            <div style={{ width: 300 }}>
              <p>
                <strong>学生：</strong>
                {record.userName || record.studentName}
              </p>
              <p>
                <strong>类型：</strong>
                {record.category || "未分类"}
              </p>
              <p>
                <strong>关键词：</strong>
                {record.keyword?.join(", ") || "无"}
              </p>
              <p>
                <strong>浏览量：</strong>
                {record.views}
              </p>
              {record.recommendComment && (
                <p>
                  <strong>推荐说明：</strong>
                  {record.recommendComment}
                </p>
              )}
            </div>
          }
        >
          <a onClick={() => navigate(`/achievement/detail/${record.id}`)}>
            {text}
          </a>
        </Popover>
      ),
    },
    {
      title: "学生",
      dataIndex: "userName",
      key: "userName",
      width: 120,
    },
    {
      title: "类型",
      dataIndex: "category",
      key: "category",
      width: 120,
      filters: categories.map((cat) => ({
        text: cat.label,
        value: cat.value,
      })),
      onFilter: (value, record) => record.category === value,
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "推荐等级",
      dataIndex: "avgRecommendLevel", // 显示平均等级
      key: "avgRecommendLevel",
      width: 300,
      render: (avgLevel, record) => (
        <Space align="center">
          <Select
            // 选择器显示个人设置的等级
            value={record.isRecommended ? record.userRecommendLevel || 1 : 0}
            onChange={(value) => handleLevelChange(record.id, value)}
            style={{ width: 150 }}
            disabled={!record.isRecommended}
            options={[
              { value: 0, label: "无" },
              { value: 1, label: "⭐ 不错" },
              { value: 2, label: "⭐⭐ 良好" },
              { value: 3, label: "⭐⭐⭐ 优秀" },
              { value: 4, label: "⭐⭐⭐⭐ 重点" },
              { value: 5, label: "⭐⭐⭐⭐⭐ 强烈" },
            ]}
          />

          {/* 显示平均等级并添加提示 */}
          <Space>
            <span>平均:</span>
            <Tag color={avgLevel > 0 ? "orange" : "gray"}>
              {getLevelLabel(avgLevel)}
            </Tag>
            {record.userRecommendLevel !== avgLevel && record.isRecommended && (
              <Tooltip
                title="当前展示的是所有教师推荐的平均等级，您的个人推荐等级已记录"
                placement="right"
              >
                <InfoCircleOutlined
                  style={{ color: "#faad14", cursor: "help" }}
                />
              </Tooltip>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "推荐状态",
      dataIndex: "isRecommended",
      key: "isRecommended",
      width: 120,
      render: (recommended, record) => (
        <Switch
          checked={recommended}
          onChange={(checked) =>
            handleToggleRecommend(record.id, checked, record.title)
          }
          checkedChildren="已推荐"
          unCheckedChildren="未推荐"
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          icon={<StarOutlined />}
          onClick={() =>
            setCommentModal({
              visible: true,
              currentItem: record,
              comment: record.recommendComment || "",
            })
          }
          disabled={!record.isRecommended}
        >
          {record.recommendComment ? "编辑说明" : "添加说明"}
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <Navbar currentUser={currentUser} />
      <Card
        title={
          <Space>
            <span>优秀成果推荐</span>
            <Badge
              count={data.filter((d) => d.isRecommended).length}
              style={{ backgroundColor: "#52c41a" }}
            />
          </Space>
        }
        bordered={false}
        extra={
          <Space wrap>
            <Search
              placeholder="搜索成果/学生/关键词"
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => {
                setSearchParams({
                  ...searchParams,
                  keyword: value,
                });
                setPagination({ ...pagination, current: 1 });
              }}
            />
            <Select
              placeholder="成果类型"
              allowClear
              style={{ width: 120 }}
              loading={categoriesLoading}
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  category: value,
                });
                setPagination({ ...pagination, current: 1 });
              }}
            >
              {categories.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="推荐等级"
              allowClear
              style={{ width: 140 }}
              onChange={(value) => {
                setSearchParams({
                  ...searchParams,
                  minLevel: value,
                });
                setPagination({ ...pagination, current: 1 });
              }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value={0}>未评级及以上</Option>
              <Option value={1}>⭐ 及以上</Option>
              <Option value={2}>⭐⭐ 及以上</Option>
              <Option value={3}>⭐⭐⭐ 及以上</Option>
              <Option value={4}>⭐⭐⭐⭐ 及以上</Option>
              <Option value={5}>⭐⭐⭐⭐⭐</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条成果`,
          }}
          onChange={(pag) => {
            setPagination(pag);
          }}
          scroll={{ x: 900 }}
          rowClassName={(record) =>
            record.isRecommended ? "recommended-row" : ""
          }
          locale={{
            emptyText:
              searchParams.keyword ||
              searchParams.category ||
              searchParams.minLevel !== null ? (
                <div>
                  <p>没有找到匹配的推荐成果</p>
                  <Button
                    type="link"
                    onClick={() => {
                      setSearchParams({
                        keyword: "",
                        category: "",
                        minLevel: null,
                      });
                      setPagination({ ...pagination, current: 1 });
                    }}
                  >
                    清除所有筛选条件
                  </Button>
                </div>
              ) : (
                <p>暂无推荐成果数据</p>
              ),
          }}
        />

        {/* 推荐说明弹窗 */}
        <Modal
          title="设置推荐说明"
          visible={commentModal.visible}
          onOk={handleCommentSubmit}
          onCancel={() =>
            setCommentModal({
              ...commentModal,
              visible: false,
            })
          }
          width={600}
        >
          <Descriptions column={1} bordered>
            <Descriptions.Item label="成果标题">
              {commentModal.currentItem?.title}
            </Descriptions.Item>
            <Descriptions.Item label="您的推荐等级">
              {commentModal.currentItem?.userRecommendLevel !== undefined && (
                <Tag color="blue">
                  {Array(commentModal.currentItem.userRecommendLevel)
                    .fill("⭐")
                    .join("") || "未评级"}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="平均推荐等级">
              {commentModal.currentItem?.avgRecommendLevel !== undefined && (
                <Tag color="gold">
                  {Array(commentModal.currentItem.avgRecommendLevel)
                    .fill("⭐")
                    .join("") || "未评级"}
                </Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <Input.TextArea
            rows={4}
            value={commentModal.comment}
            onChange={(e) =>
              setCommentModal({
                ...commentModal,
                comment: e.target.value,
              })
            }
            placeholder="请输入推荐理由（如创新性、实用性等），最多200字"
            maxLength={200}
            showCount
            onBlur={(e) => {
              if (
                e.target.value.trim().length < 5 &&
                e.target.value.length > 0
              ) {
                message.warning("推荐说明至少需要5个字");
              }
            }}
          />
        </Modal>
      </Card>
      <Footer style={{ textAlign: "center" }}>
        学生成果展示平台 ©{new Date().getFullYear()}{" "}
        汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default AchievementRecommendPage;
