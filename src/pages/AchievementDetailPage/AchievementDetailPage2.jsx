import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Card,
  Tabs,
  Avatar,
  Badge,
  Tag,
  Button,
  Space,
  Divider,
  Image,
  List,
  Spin,
  message,
  Descriptions,
  Input,
  Row,
  Col,
  Empty,
  Pagination,
  Modal,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  DownloadOutlined,
  FileTextOutlined,
  EditOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  TrophyOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { achievementApi, commentApi } from "../../service/api";
import moment from "moment";

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const categoryColors = {
  软件开发: "blue",
  创新设计: "green",
  学术论文: "orange",
  竞赛成果: "red",
  科研项目: "purple",
  coursework: "cyan",
};

const levelColors = {
  校级: "green",
  市级: "blue",
  省级: "orange",
  国家级: "red",
  国际级: "purple",
};

const AchievementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [achievement, setAchievement] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const contentRefs = {
    basic: useRef(null),
    details: useRef(null),
    media: useRef(null),
    files: useRef(null),
    comments: useRef(null),
  };

  const [commentPagination, setCommentPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  //回复状态
  const [replyState, setReplyState] = useState({
    replyingTo: null, // 当前正在回复的评论ID
    replyContent: "", // 回复内容
  });
  // 使用一个状态对象管理所有点赞相关数据
  const [likeData, setLikeData] = useState({
    count: 0, // 点赞总数
    isLiked: false, // 当前用户是否点赞
    loading: false, // 加载状态
  });

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const params = {
        achievementId: id,
        current: commentPagination.current,
        pageSize: commentPagination.pageSize,
        parentId: null,
      };

      const response = await commentApi.getCommentList(params);

      if (response.code === 0) {
        // 过滤掉未审核和审核未通过的评论，只保留审核通过的
        const filteredComments = response.data.records
          .filter(
            (comment) =>
              (comment.parentId === null || comment.parentId === undefined) &&
              comment.status === 1 // 假设approved表示审核通过
          )
          // 同时过滤子评论，只保留审核通过的
          .map((comment) => ({
            ...comment,
            children: getSafeArray(comment.children).filter(
              (child) => child.status === 1
            ),
          }));

        // 计算当前页的实际评论数量（包括子评论）
        let currentPageCommentCount = 0;
        const visibleComments = [];

        for (const comment of filteredComments) {
          const commentTotal = 1 + comment.children.length;

          // 如果加上这个评论会超出页面容量，就停止添加
          if (
            currentPageCommentCount + commentTotal >
            commentPagination.pageSize
          ) {
            break;
          }

          currentPageCommentCount += commentTotal;
          visibleComments.push(comment);
        }

        setComments(visibleComments);
        // 注意：这里显示的总数应该是所有审核通过的评论数
        setCommentPagination({
          ...commentPagination,
          total: response.data.records.filter((c) => c.status === "approved")
            .length,
        });
      }
    } catch (error) {
      console.error("获取评论失败:", error);
      message.error(error.message || "获取评论失败");
    }
  };

  // 获取点赞状态和数量
  const fetchLikeStatus = async () => {
    try {
      const [detailRes, statusRes] = await Promise.all([
        achievementApi.getDetail(id),
        achievementApi.checkLikeStatus({ achievementId: id }),
      ]);

      if (detailRes.code === 0 && statusRes.code === 0) {
        setLikeData({
          count: detailRes.data.likeCount || 0,
          isLiked: statusRes.data,
          loading: false,
        });
      }
    } catch (error) {
      console.error("获取点赞状态失败:", error);
      message.error(error.message || "获取点赞状态失败");
    }
  };

  useEffect(() => {
    if (achievement) {
      fetchLikeStatus();
    }
  }, [achievement]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 获取用户信息
        const token = localStorage.getItem("token");
        const role = token ? localStorage.getItem("user_role") : "visitor";
        const username = token ? localStorage.getItem("username") : "访客";
        setCurrentUser({
          role,
          username,
          avatar: `https://picsum.photos/id/${
            1030 + Math.floor(Math.random() * 10)
          }/200/200`,
        });

        // 获取成果详情
        const response = await achievementApi.getDetail(id);

        if (response.code === 0) {
          setAchievement(response.data);
          setLikeData((prev) => ({
            ...prev,
            count: response.data.likeCount || 0,
          }));

          // 初始化评论数据
          await fetchComments();
        } else {
          throw new Error(response.message || "获取成果详情失败");
        }
      } catch (error) {
        console.error("获取数据失败:", error);
        message.error(error.message || "获取数据失败，请刷新重试");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, commentPagination.current]);

  // 安全的数组访问函数
  const getSafeArray = (array) => {
    return Array.isArray(array) ? array : [];
  };

  const scrollToSection = (key) => {
    setActiveTab(key);
    contentRefs[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 点赞处理函数
  const handleLike = async () => {
    if (currentUser?.role === "") {
      message.info("请登录后再进行点赞");
      return;
    }
    try {
      // 乐观更新
      const newLiked = !likeData.isLiked;
      setLikeData((prev) => ({
        ...prev,
        isLiked: newLiked,
        count: newLiked ? prev.count + 1 : Math.max(0, prev.count - 1),
        loading: true,
      }));

      const likeDataToSend = { achievementId: parseInt(id) };
      const response = newLiked
        ? await achievementApi.likeAchievement(likeDataToSend)
        : await achievementApi.cancelLikeAchievement(likeDataToSend);

      if (response.code !== 0) {
        throw new Error(response.message || "操作失败");
      }

      // 成功后重新获取最新数据确保一致性
      await fetchLikeStatus();
      message.success(newLiked ? "点赞成功" : "已取消点赞");
    } catch (error) {
      console.error("点赞操作失败:", error);
      // 失败时回滚状态
      setLikeData((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        count: prev.isLiked ? prev.count + 1 : Math.max(0, prev.count - 1),
        loading: false,
      }));
      message.error(error.message || "操作失败，请重试");
    } finally {
      setLikeData.loading(false);
    }
  };

  const isCreator = () => {
    if (!currentUser || !achievement) return false;
    return getSafeArray(achievement.participants).some(
      (p) => p.realName === currentUser.username
    );
  };

  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  // 处理评论分页变化
  const handleCommentPageChange = (page, pageSize) => {
    setCommentPagination({
      current: page,
      pageSize,
      total: commentPagination.total,
    });
  };

  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  // 评论提交函数
  const handleCommentSubmit = async () => {
    if (currentUser?.role === "") {
      message.info("请登录后再发表评论");
      return;
    }
    if (!commentContent.trim()) {
      message.warning("评论内容不能为空");
      return;
    }

    try {
      const commentData = {
        achievementId: parseInt(id),
        content: commentContent,
        parentId: null, // 明确设置为null，表示一级评论
      };

      const response = await commentApi.addComment(commentData);

      if (response.code === 0) {
        message.success("评论已提交，等待管理员审核");
        setCommentContent("");
        // 不需要刷新评论列表，新评论需要审核
        // await fetchComments();
      } else {
        throw new Error(response.message || "评论发表失败");
      }
    } catch (error) {
      console.error("发表评论失败:", error);
      message.error(error.message || "评论发表失败");
    }
  };

  // 回复提交处理函数
  const handleReplySubmit = async (parentId) => {
    if (currentUser?.role === "visitor") {
      message.info("请登录后再发表回复");
      return;
    }

    if (!replyState.replyContent.trim()) {
      message.warning("回复内容不能为空");
      return;
    }

    try {
      const commentData = {
        achievementId: parseInt(id),
        content: replyState.replyContent,
        parentId: parentId, // 设置父评论ID
      };

      const response = await commentApi.addComment(commentData);

      if (response.code === 0) {
        message.success("评论回复已提交，等待管理员审核");
        setReplyState({
          replyingTo: null,
          replyContent: "",
        });
        // 不需要刷新评论列表
        // await fetchComments();
      } else {
        throw new Error(response.message || "回复失败");
      }
    } catch (error) {
      console.error("发表回复失败:", error);
      message.error(error.message || "回复失败");
    }
  };

  // 删除评论处理函数
  const handleDeleteComment = async (commentId) => {
    try {
      // 查找要删除的评论
      const commentToDelete = comments.find((c) => c.id === commentId);
      const hasChildren = commentToDelete?.children?.length > 0;

      // 显示确认对话框
      Modal.confirm({
        title: "确认删除",
        content: hasChildren
          ? "此评论包含回复，删除后将同时删除所有回复，确定继续吗？"
          : "确定要删除此评论吗？",
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          // 发送删除请求
          const response = await commentApi.deleteComment(commentId);

          if (response.code === 0) {
            message.success(hasChildren ? "评论及回复已删除" : "评论已删除");
            // 刷新评论列表
            await fetchComments();
          } else {
            throw new Error(response.message || "删除评论失败");
          }
        },
      });
    } catch (error) {
      console.error("删除评论失败:", error);
      message.error(error.message || "删除评论失败");
    }
  };

  // 在组件中添加分享处理函数
  const handleShare = () => {
    // 获取当前页面URL
    const currentUrl = window.location.href;

    // 使用Web Share API（如果浏览器支持）
    if (navigator.share) {
      navigator
        .share({
          title: achievement?.title || "成果详情",
          text: `查看这个成果: ${achievement?.title}`,
          url: currentUrl,
        })
        .catch((error) => {
          console.error("分享失败:", error);
          fallbackShare(currentUrl);
        });
    } else {
      // 浏览器不支持Web Share API时使用备用方案
      fallbackShare(currentUrl);
    }
  };

  // 备用分享方案
  const fallbackShare = (url) => {
    // 复制链接到剪贴板
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success("链接已复制到剪贴板");
      })
      .catch(() => {
        // 如果复制失败，显示提示让用户手动复制
        Modal.info({
          title: "分享链接",
          content: (
            <div>
              <p>请手动复制以下链接：</p>
              <Input value={url} readOnly />
            </div>
          ),
          okText: "确定",
        });
      });
  };

  // 渲染评论列表项
  const renderCommentItem = (comment) => {
    const isCurrentUserComment =
      comment.user?.id === parseInt(localStorage.getItem("userId"));

    return (
      <List.Item
        style={{
          padding: "16px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <List.Item.Meta
          avatar={
            <Avatar src={comment.user?.userAvatar} icon={<UserOutlined />} />
          }
          title={
            <Space size="small">
              <span style={{ fontWeight: 500 }}>
                {comment.user?.userName || "匿名用户"}
              </span>
              <span style={{ color: "#666", fontSize: 12 }}>
                {moment(comment.createTime).format("YYYY-MM-DD HH:mm")}
              </span>
            </Space>
          }
          description={
            <div>
              <p style={{ marginTop: 8, marginBottom: 8 }}>{comment.content}</p>

              {/* 评论操作按钮 */}
              <Space size="middle" style={{ marginBottom: 8 }}>
                <Button
                  type="text"
                  size="small"
                  onClick={() =>
                    setReplyState({
                      replyingTo: comment.id,
                      replyContent: "",
                    })
                  }
                >
                  回复
                </Button>

                {(isCurrentUserComment || isAdmin()) && (
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    删除
                  </Button>
                )}
              </Space>

              {/* 回复输入框 */}
              {replyState.replyingTo === comment.id && (
                <div style={{ marginBottom: 16 }}>
                  <TextArea
                    rows={2}
                    placeholder={`回复 ${comment.user?.userName || "用户"}`}
                    value={replyState.replyContent}
                    onChange={(e) =>
                      setReplyState({
                        ...replyState,
                        replyContent: e.target.value,
                      })
                    }
                    style={{ marginBottom: 8, borderRadius: 4 }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleReplySubmit(comment.id)}
                    >
                      提交回复
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        setReplyState({
                          replyingTo: null,
                          replyContent: "",
                        })
                      }
                    >
                      取消
                    </Button>
                  </Space>
                </div>
              )}

              {/* 子评论展示 */}
              {comment.children && comment.children.length > 0 && (
                <div
                  style={{
                    marginLeft: 24,
                    borderLeft: "2px solid #f0f0f0",
                    paddingLeft: 12,
                  }}
                >
                  <List
                    dataSource={comment.children}
                    renderItem={renderCommentItem}
                    // 禁用子评论的分页和加载更多
                    pagination={false}
                    loadMore={false}
                  />
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  if (loading && !achievement) {
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
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!achievement) {
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
          <Empty description="未找到该成果" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ background: "#f8f9fa", padding: "24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              marginBottom: 24,
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: 4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 600,
                color: "#222",
              }}
            >
              {achievement.title}
            </h1>
            <Space
              size="middle"
              style={{ marginTop: 8, display: "flex", flexWrap: "wrap" }}
            >
              <Tag color={categoryColors[achievement.category]}>
                {achievement.category}
              </Tag>
              <Tag color={levelColors[achievement.level]}>
                {achievement.level}
              </Tag>
              <Tag icon={<CalendarOutlined />}>
                {moment(achievement.date).format("YYYY-MM-DD")}
              </Tag>
              {/* 修复关键词map错误 */}
              {getSafeArray(achievement.keywords).map((keyword, idx) => (
                <Tag
                  key={idx}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#f0f2f5",
                    borderColor: "#d9d9d9",
                  }}
                >
                  {keyword}
                </Tag>
              ))}
            </Space>
          </div>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={16}>
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 4,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 18, color: "#222" }}>
                    <UserOutlined /> 项目成员 & 指导教师
                  </h3>

                  <Space size="small">
                    {(isCreator() || isAdmin()) && (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() =>
                          navigate(
                            `/student/achievements/edit/${achievement.id}`
                          )
                        }
                      >
                        编辑
                      </Button>
                    )}
                    <Button
                      icon={<ShareAltOutlined />}
                      size="small"
                      onClick={handleShare}
                    >
                      分享
                    </Button>
                  </Space>
                </div>
                <Divider style={{ margin: "16px 0" }} />

                {/* 修复参与者列表错误 */}
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                  dataSource={getSafeArray(achievement.participants)}
                  renderItem={(member) => (
                    <List.Item>
                      <Card
                        hoverable
                        style={{
                          textAlign: "center",
                          border: "1px solid #f0f0f0",
                          borderRadius: 4,
                          transition: "all 0.3s",
                        }}
                        onClick={() => navigate(`/author/${member.studentNo}`)}
                      >
                        <Avatar
                          src={member.avatar}
                          icon={<UserOutlined />}
                          size={64}
                          style={{
                            margin: "16px auto 12px",
                            border: "2px solid #fff",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          }}
                        />
                        <h4
                          style={{
                            margin: "0 0 4px",
                            fontSize: 16,
                            color: "#222",
                          }}
                        >
                          {member.realName}
                        </h4>
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: "#666",
                            fontSize: 12,
                          }}
                        >
                          {member.major} {member.grade}
                        </p>
                        <Badge status="success" text={member.role} />
                      </Card>
                    </List.Item>
                  )}
                />

                {/* 指导教师部分 */}
                {getSafeArray(achievement.instructors).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h4
                      style={{
                        margin: "0 0 12px",
                        fontSize: 16,
                        color: "#222",
                      }}
                    >
                      <BookOutlined /> 指导教师
                    </h4>
                    <Row gutter={16}>
                      {getSafeArray(achievement.instructors).map(
                        (instructor, index) => (
                          <Col key={index} xs={24} sm={12} md={8}>
                            <Card
                              hoverable
                              style={{
                                border: "1px solid #f0f0f0",
                                borderRadius: 4,
                                marginBottom: 16,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "12px",
                                }}
                              >
                                <Avatar
                                  src={
                                    instructor.avatar || instructor.userAvatar
                                  }
                                  icon={<UserOutlined />}
                                  size={48}
                                  style={{
                                    marginRight: 12,
                                    border: "2px solid #fff",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <h4
                                    style={{
                                      margin: 0,
                                      fontSize: 14,
                                      color: "#222",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    {instructor.name || instructor.realName}
                                  </h4>
                                  <p
                                    style={{
                                      margin: "4px 0 0",
                                      color: "#666",
                                      fontSize: 12,
                                      lineHeight: "1.3",
                                    }}
                                  >
                                    {instructor.department &&
                                      `${instructor.department} `}
                                    {instructor.title}
                                  </p>
                                  {instructor.email && (
                                    <p
                                      style={{
                                        margin: "2px 0 0",
                                        color: "#999",
                                        fontSize: 11,
                                      }}
                                    >
                                      {instructor.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </Col>
                        )
                      )}
                    </Row>
                  </div>
                )}
              </Card>
            </Col>

            <Col span={8}>
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 4,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  padding: "16px",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#222" }}>
                  <TrophyOutlined /> 成果数据
                </h3>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: "#666" }}>浏览次数</span>
                    <span style={{ fontWeight: 600, color: "#222" }}>
                      {achievement.viewCount || 0}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: "#666" }}>点赞次数</span>
                    <span style={{ fontWeight: 600, color: "#222" }}>
                      {likeData.count}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: "#666" }}>评论次数</span>
                    <span style={{ fontWeight: 600, color: "#222" }}>
                      {commentPagination.total}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#666" }}>最近更新</span>
                    <span style={{ fontWeight: 600, color: "#222" }}>
                      {moment(achievement.date).format("YYYY-MM-DD")}
                    </span>
                  </div>
                </div>

                <Divider style={{ margin: "16px 0" }} />

                <Button
                  icon={
                    likeData.isLiked ? (
                      <HeartFilled style={{ color: "#e80e48ff" }} />
                    ) : (
                      <HeartOutlined />
                    )
                  }
                  onClick={handleLike}
                  loading={likeData.loading}
                  disabled={likeData.loading}
                  style={{
                    width: "100%",
                    marginBottom: 12,
                    borderColor: likeData.isLiked ? "#e80e48ff" : "#d9d9d9",
                    color: likeData.isLiked ? "#e80e48ff" : undefined,
                    transition: "all 0.3s",
                  }}
                >
                  {likeData.isLiked ? "已点赞" : "点赞"}({likeData.count})
                </Button>
              </Card>
            </Col>
          </Row>

          <Card
            bordered={false}
            style={{
              backgroundColor: "#fff",
              borderRadius: 4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              marginBottom: 24,
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              style={{ borderBottom: "1px solid #f0f0f0" }}
              tabBarStyle={{ padding: "0 16px" }}
            >
              <TabPane tab="基本信息" key="basic" />
              <TabPane tab="详细介绍" key="details" />
              <TabPane tab="图片与视频" key="media" />
              <TabPane tab="相关文件" key="files" />
              <TabPane tab="评论" key="comments" />
            </Tabs>
          </Card>

          <Layout>
            <Sider
              width={220}
              style={{
                background: "#fff",
                borderRadius: 4,
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <Card
                bordered={false}
                style={{ height: "100%", padding: "16px 0" }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { key: "basic", title: "基本信息", icon: <BookOutlined /> },
                    {
                      key: "details",
                      title: "详细介绍",
                      icon: <FileTextOutlined />,
                    },
                    { key: "media", title: "图片与视频", icon: <Image /> },
                    {
                      key: "files",
                      title: "相关文件",
                      icon: <DownloadOutlined />,
                    },
                    {
                      key: "comments",
                      title: "评论",
                      icon: <MessageOutlined />,
                    },
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => scrollToSection(item.key)}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          activeTab === item.key ? "#f0f2f5" : "transparent",
                        padding: "8px 16px",
                        transition: "all 0.3s",
                      }}
                    >
                      <List.Item.Meta
                        avatar={item.icon}
                        title={
                          <span
                            style={{
                              color:
                                activeTab === item.key ? "#1890ff" : "#222",
                            }}
                          >
                            {item.title}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Sider>

            <Content style={{ padding: "0 24px", background: "#f8f9fa" }}>
              <div style={{ padding: 0 }}>
                <div
                  ref={contentRefs.basic}
                  style={{ display: activeTab === "basic" ? "block" : "none" }}
                >
                  <Card
                    bordered={false}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      padding: "16px",
                      marginBottom: 24,
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 16px",
                        fontSize: 20,
                        color: "#222",
                      }}
                    >
                      <BookOutlined style={{ marginRight: 8 }} /> 基本信息
                    </h2>

                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="成果标题">
                        {achievement.title}
                      </Descriptions.Item>
                      <Descriptions.Item label="成果分类">
                        <Tag color={categoryColors[achievement.category]}>
                          {achievement.category}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="成果级别">
                        <Tag color={levelColors[achievement.level]}>
                          {achievement.level}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="完成日期">
                        {moment(achievement.date).format("YYYY-MM-DD")}
                      </Descriptions.Item>
                      <Descriptions.Item label="价格信息">
                        {achievement.price || "免费"}
                      </Descriptions.Item>
                      <Descriptions.Item label="关键词">
                        {/* 修复关键词map错误 */}
                        {getSafeArray(achievement.keywords).map(
                          (keyword, idx) => (
                            <Tag
                              key={idx}
                              closable={false}
                              style={{ marginRight: 8 }}
                            >
                              {keyword}
                            </Tag>
                          )
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间">
                        {moment(achievement.date).format("YYYY-MM-DD HH:mm:ss")}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {moment(achievement.date).format("YYYY-MM-DD HH:mm:ss")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>

                <div
                  ref={contentRefs.details}
                  style={{
                    display: activeTab === "details" ? "block" : "none",
                  }}
                >
                  <Card
                    bordered={false}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      padding: "16px",
                      marginBottom: 24,
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 16px",
                        fontSize: 20,
                        color: "#222",
                      }}
                    >
                      <FileTextOutlined style={{ marginRight: 8 }} /> 详细介绍
                    </h2>

                    <div style={{ lineHeight: "1.8", color: "#444" }}>
                      <p style={{ margin: "0 0 16px" }}>
                        {achievement.description}
                      </p>
                    </div>
                  </Card>
                </div>

                <div
                  ref={contentRefs.media}
                  style={{ display: activeTab === "media" ? "block" : "none" }}
                >
                  <Card
                    bordered={false}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      padding: "16px",
                      marginBottom: 24,
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 16px",
                        fontSize: 20,
                        color: "#222",
                      }}
                    >
                      <Image style={{ marginRight: 8 }} /> 图片与视频
                    </h2>

                    <div style={{ marginBottom: 32 }}>
                      <h3
                        style={{
                          margin: "0 0 16px",
                          fontSize: 16,
                          color: "#222",
                        }}
                      >
                        项目图片
                      </h3>
                      {getSafeArray(achievement.images).length > 0 ? (
                        <Tabs
                          type="card"
                          defaultActiveKey="0"
                          style={{ marginBottom: 24 }}
                        >
                          {getSafeArray(achievement.images).map((img, idx) => (
                            <TabPane tab={`图片 ${idx + 1}`} key={idx}>
                              <div style={{ textAlign: "center" }}>
                                <img
                                  src={img.url}
                                  alt={`${achievement.title} 图片 ${idx + 1}`}
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: 500,
                                    objectFit: "contain",
                                    borderRadius: 4,
                                  }}
                                />
                              </div>
                            </TabPane>
                          ))}
                        </Tabs>
                      ) : (
                        <Empty description="暂无图片" />
                      )}
                    </div>

                    {getSafeArray(achievement.videos).length > 0 ? (
                      <div>
                        <h3
                          style={{
                            margin: "0 0 16px",
                            fontSize: 16,
                            color: "#222",
                          }}
                        >
                          项目视频
                        </h3>
                        {getSafeArray(achievement.videos).map((video, idx) => (
                          <div key={idx} style={{ marginBottom: 24 }}>
                            <h4
                              style={{
                                margin: "0 0 16px",
                                fontSize: 14,
                                color: "#222",
                              }}
                            >
                              {video.name}
                            </h4>
                            <div
                              style={{
                                position: "relative",
                                paddingBottom: "56.25%",
                                height: 0,
                                backgroundColor: "#000",
                                borderRadius: 4,
                                overflow: "hidden",
                              }}
                            >
                              <video
                                src={video.url}
                                controls
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                }}
                                preload="metadata"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty description="暂无视频" />
                    )}
                  </Card>
                </div>

                <div
                  ref={contentRefs.files}
                  style={{ display: activeTab === "files" ? "block" : "none" }}
                >
                  <Card
                    bordered={false}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      padding: "16px",
                      marginBottom: 24,
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 16px",
                        fontSize: 20,
                        color: "#222",
                      }}
                    >
                      <DownloadOutlined style={{ marginRight: 8 }} /> 相关文件
                    </h2>

                    {getSafeArray(achievement.files).length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={getSafeArray(achievement.files)}
                        renderItem={(file) => (
                          <List.Item
                            style={{
                              padding: "12px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <List.Item.Meta
                              avatar={
                                <FileTextOutlined
                                  style={{ fontSize: 24, color: "#1890ff" }}
                                />
                              }
                              title={
                                <span
                                  style={{ color: "#222", fontWeight: 500 }}
                                >
                                  {file.name}
                                </span>
                              }
                              description={
                                <span style={{ color: "#666", fontSize: 12 }}>
                                  {file.size
                                    ? `${(file.size / 1024 / 1024).toFixed(
                                        1
                                      )}MB`
                                    : "未知大小"}
                                </span>
                              }
                            />
                            <Button
                              type="link"
                              icon={<DownloadOutlined />}
                              href={file.url}
                              download
                              style={{ color: "#1890ff" }}
                            >
                              下载
                            </Button>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无相关文件" />
                    )}
                  </Card>
                </div>

                <div
                  ref={contentRefs.comments}
                  style={{
                    display: activeTab === "comments" ? "block" : "none",
                  }}
                >
                  <Card
                    bordered={false}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      padding: "16px",
                      marginBottom: 24,
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 16px",
                        fontSize: 20,
                        color: "#222",
                      }}
                    >
                      <MessageOutlined style={{ marginRight: 8 }} /> 评论 (
                      {commentPagination.total})
                    </h2>

                    <div style={{ marginBottom: 24 }}>
                      <TextArea
                        rows={4}
                        placeholder="写下你的评论..."
                        value={commentContent}
                        onChange={handleCommentChange}
                        style={{ marginBottom: 12, borderRadius: 4 }}
                      />
                      <Button
                        type="primary"
                        onClick={handleCommentSubmit}
                        style={{ float: "right" }}
                      >
                        发布评论
                      </Button>
                      <div style={{ clear: "both" }}></div>
                    </div>

                    {comments.length > 0 ? (
                      <div>
                        <List
                          itemLayout="horizontal"
                          dataSource={comments}
                          renderItem={renderCommentItem}
                        />
                        <div style={{ marginTop: 16, textAlign: "right" }}>
                          <Pagination
                            current={commentPagination.current}
                            pageSize={commentPagination.pageSize}
                            total={commentPagination.total}
                            onChange={handleCommentPageChange}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total) => `共 ${total} 条评论`}
                          />
                        </div>
                      </div>
                    ) : (
                      <Empty description="暂无评论" />
                    )}
                  </Card>
                </div>
              </div>
            </Content>
          </Layout>
        </div>
      </Content>
    </Layout>
  );
};

export default AchievementDetailPage;
