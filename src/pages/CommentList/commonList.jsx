import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  List,
  Tag,
  message,
  Button,
  Empty,
  Pagination,
  Typography,
  Spin,
  Modal,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { commentApi } from "../../service/api";
import moment from "moment";

const { Content } = Layout;
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

const UserCommentListPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 检查用户是否登录
  const checkLogin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.info("请先登录");
      navigate("/login");
      return false;
    }
    return true;
  };

  // 获取用户信息
  const fetchUserInfo = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const role = localStorage.getItem("user_role");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    setCurrentUser({ role, username, userId });
  };

  // 获取当前用户的评论列表
  const fetchUserComments = async () => {
    if (!checkLogin()) return;
    
    try {
      setLoading(true);
    //   const userId = localStorage.getItem("userId");
      
      const params = {
        // userId, //后端根据httpservlet获取用户的id，所以前端不需要传了
        current: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await commentApi.getUserComments(params);
      
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
      console.error("获取用户评论失败:", error);
      message.error(error.message || "获取评论失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchUserComments();
  }, [pagination.current, pagination.pageSize]);

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这条评论吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await commentApi.deleteComment(commentId);
          
          if (response.code === 0) {
            message.success("评论已删除");
            fetchUserComments();
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

  // 查看评论所在成果
  const viewAchievement = (achievementId) => {
    navigate(`/achievement/${achievementId}`);
  };
  
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: "24px 48px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Title level={2}>我的评论</Title>
          
          <Card>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Spin size="large" />
              </div>
            ) : comments.length > 0 ? (
              <>
                <List
                  itemLayout="vertical"
                  dataSource={comments}
                  // 添加列表容器样式，确保内容左对齐
                  style={{ textAlign: 'left' }}
                  renderItem={(comment) => (
                    <List.Item
                      key={comment.id}
                      actions={[
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => viewAchievement(comment.achievementId)}
                        >
                          查看成果
                        </Button>,
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          删除
                        </Button>,
                      ]}
                      style={{ 
                        padding: "16px 0", 
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: 'left' // 确保列表项内容左对齐
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            textAlign: 'left' // 标题左对齐
                          }}>
                            <Text strong>
                              {comment.achievementTitle || `成果ID: ${comment.achievementId}`}
                            </Text>
                            <Tag color={commentStatusColors[comment.status]}>
                              {commentStatusMap[comment.status]}
                            </Tag>
                          </div>
                        }
                        description={
                          <div style={{ textAlign: 'left' }}> {/* 描述内容强制左对齐 */}
                            <p style={{ margin: "8px 0", textAlign: 'left' }}>{comment.content}</p>
                            <div style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              color: "#666", 
                              fontSize: 12,
                              textAlign: 'left'
                            }}>
                              <span>发表于 {moment(comment.createTime).format("YYYY-MM-DD HH:mm")}</span>
                              
                              {/* 显示驳回原因 */}
                              {comment.status === 2 && comment.rejectReason && (
                                <Text type="danger">
                                  驳回原因: {comment.rejectReason}
                                </Text>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
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
              </>
            ) : (
              <Empty description="您还没有发表任何评论" />
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default UserCommentListPage;