import React, { useState, useRef, useEffect } from "react";
import {
  List,
  Avatar,
  Input,
  Button,
  Space,
  Tag,
  Spin,
  Tooltip,
  message,
  Popover,
  Select,
  Modal  // 新增Modal组件用于文件过期提示
} from "antd";
import {
  MessageOutlined,
  PaperClipOutlined,
  SmileOutlined,
  CloseOutlined,
  LoadingOutlined,
  CheckOutlined,
  FileTextOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import Navbar from "../Navbar/Navbar";
import { authApi } from "../../service/api";

const { TextArea } = Input;
const { Option } = Select;
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const ROLE_CONFIG = {
  student: { text: "学生", color: "green" },
  teacher: { text: "老师", color: "orange" },
  admin: { text: "超级管理员", color: "red" },
  visitor: { text: "访客", color: "gray" },
  default: { text: "用户", color: "blue" },
};

const MessageCenterPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [sendingLoading, setSendingLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [targetUser, setTargetUser] = useState({ id: null, name: null });
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState(DEFAULT_AVATAR);
  const [selectedExpireDays, setSelectedExpireDays] = useState(7);
  const [fileExpiredModalVisible, setFileExpiredModalVisible] = useState(false); // 控制过期提示弹窗显示
  const [expiredFileName, setExpiredFileName] = useState(""); // 存储过期文件名称
  const currentUserIdRef = useRef(null);
  const initialMessageSentRef = useRef(new Set());
  const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.default;

  const getAvatar = (avatarUrl) => {
    if (avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/"))) {
      return (
        <img
          src={avatarUrl}
          onError={(e) => (e.target.src = DEFAULT_AVATAR)}
          alt="用户头像"
          style={{ objectFit: "cover" }}
        />
      );
    }
    return DEFAULT_AVATAR;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const parseUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const toUserId = params.get("toUserId");
      const toUserName = params.get("toUserName") ? decodeURIComponent(params.get("toUserName")) : null;
      if (toUserId) setTargetUser({ id: toUserId, name: toUserName || "未知用户" });
    };
    parseUrlParams();
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const userRes = await authApi.getuserlogin();
        if (userRes.code === 0 && userRes.data) {
          const currentUserIdFromApi = String(userRes.data.id);
          setCurrentUserId(currentUserIdFromApi);
          currentUserIdRef.current = currentUserIdFromApi;
          setCurrentUserAvatar(getAvatar(userRes.data.avatar) || DEFAULT_AVATAR);

          if (targetUser.id && currentUserIdFromApi === targetUser.id) {
            message.warning("不能与自己创建会话");
          }

          const conversationsList = await fetchConversations();
          setIsConversationsLoaded(true);

          if (targetUser.id && currentUserIdFromApi && currentUserIdFromApi !== targetUser.id) {
            const hasSentToThisUser = initialMessageSentRef.current.has(targetUser.id);
            if (!hasSentToThisUser) {
              const existingConv = conversationsList.find(conv => conv.withUser && conv.withUser.id === targetUser.id);
              if (!existingConv) {
                await handleTargetUserConversation();
                initialMessageSentRef.current.add(targetUser.id);
              } else {
                initialMessageSentRef.current.add(targetUser.id);
              }
            }
          }
        } else {
          message.error("获取用户信息失败，请重新登录");
        }
      } catch (err) {
        console.error("初始化失败:", err);
        message.error("页面加载失败，请刷新重试");
      } finally {
        setPageLoading(false);
      }
    };

    if (targetUser.id) {
      initData();
    }
  }, [targetUser.id]);

  const handleTargetUserConversation = async () => {
    if (targetUser.id === currentUserId) {
      message.warning("不能与自己创建会话");
      return;
    }

    setCreatingConversation(true);
    try {
      const initMessage = "你好，我想咨询关于这个项目";
      const sendRes = await authApi.sendMessage({
        content: initMessage,
        fromUserId: currentUserIdRef.current,
        toUserId: targetUser.id,
        type: 0,
      });

      if (sendRes.code === 0 && sendRes.data) {
        await fetchConversations();
        const updatedConvs = await authApi.getConversationRecords();

        if (updatedConvs.code === 0 && updatedConvs.data) {
          const formattedConvs = updatedConvs.data.map((conv) => ({
            id: conv.id.toString(),
            withUser: {
              id: String(conv.withUser.id),
              name: conv.withUser.name || "未知用户",
              avatar: getAvatar(conv.withUser.avatar),
              role: conv.withUser.role || "default",
            },
            lastMessage: {
              content: conv.lastMessage?.content || initMessage,
              time: conv.lastMessage?.createTime || new Date().toISOString(),
              unread: false,
              id: conv.lastMessage?.id?.toString() || "",
            },
            conversationId: conv.id,
          }));

          setConversations(formattedConvs);
          const newConv = formattedConvs.find(conv => conv.withUser && conv.withUser.id === targetUser.id);

          if (newConv) {
            setActiveConversation(newConv);
            const initialMessages = [{
              id: sendRes.data.id.toString(),
              senderId: currentUserIdRef.current,
              content: initMessage,
              time: sendRes.data.createTime || new Date().toISOString(),
              status: "sent",
              senderAvatar: currentUserAvatar,
              files: [],
            }];
            setMessages(initialMessages);
          }
        }
      } else {
        message.error(sendRes.message || "发送初始消息失败");
      }
    } catch (err) {
      console.error("创建会话失败详情：", err);
      message.error(err.message || "创建会话失败，请重试");
    } finally {
      setCreatingConversation(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setPageLoading(true);
      const res = await authApi.getConversationRecords();

      if (res.code === 0 && res.data) {
        const formattedConversations = res.data.map((conv) => ({
          id: conv.id.toString(),
          withUser: {
            id: String(conv.withUser.id),
            name: conv.withUser.name || "未知用户",
            avatar: getAvatar(conv.withUser.avatar),
            role: conv.withUser.role || "default",
          },
          lastMessage: {
            content: conv.lastMessage?.content || "",
            time: conv.lastMessage?.createTime || new Date().toISOString(),
            unread: conv.lastMessage?.status === 0 && String(conv.lastMessage?.senderId) !== currentUserId,
            id: conv.lastMessage?.id?.toString() || "",
          },
          conversationId: conv.id,
        }));

        setConversations(formattedConversations);

        if (targetUser.id) {
          const targetConversation = formattedConversations.find(conv => conv.withUser && conv.withUser.id === targetUser.id);
          if (targetConversation) {
            setActiveConversation(targetConversation);
            await fetchConversationMessages(targetConversation.conversationId);
          }
        } else if (formattedConversations.length > 0) {
          setActiveConversation(formattedConversations[0]);
          await fetchConversationMessages(formattedConversations[0].conversationId);
        }

        return formattedConversations;
      } else {
        message.error(res.message || "加载会话列表失败");
        return [];
      }
    } catch (err) {
      console.error("加载会话失败：", err);
      message.error("加载会话失败，请重试");
      return [];
    } finally {
      setPageLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      setPageLoading(true);
      const res = await authApi.getConversationMessages(conversationId);

      if (res.code === 0 && res.data?.records) {
        const validRecords = res.data.records.filter(msg => msg.conversationId === conversationId);
        const sortedRecords = [...validRecords].sort((a, b) => new Date(a.createTime) - new Date(b.createTime));

        const formattedMessages = sortedRecords.map((msg) => {
          const isCurrentUser = String(msg.senderId) === currentUserIdRef.current;
          let avatar = DEFAULT_AVATAR;
          
          if (isCurrentUser) {
            avatar = currentUserAvatar;
          } else {
            avatar = activeConversation?.withUser?.avatar || DEFAULT_AVATAR;
          }

          // 格式化文件信息
          const files = msg.type === 2 ? [{
            name: msg.fileName,
            size: msg.fileSize,
            url: msg.content,
            type: msg.fileType
          }] : [];

          return {
            id: msg.id.toString(),
            senderId: String(msg.senderId),
            content: msg.content || "",
            time: msg.createTime || new Date().toISOString(),
            status: msg.status === 0 ? "sending" : msg.status === 1 ? "sent" : msg.status === 2 ? "read" : "failed",
            senderAvatar: avatar,
            files,
            expireTime: msg.expireTime,
            isExpired: msg.isExpired === 1,  // 1表示已过期，0表示未过期
            type: msg.type // 0: 文本消息, 2: 文件消息
          };
        });

        setMessages(formattedMessages);
        await markAsRead(conversationId);
      } else {
        message.error(res.message || "加载消息失败");
      }
    } catch (err) {
      console.error("加载消息失败：", err);
      message.error("加载消息失败，请重试");
    } finally {
      setPageLoading(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await authApi.markAsRead(conversationId);
      setConversations(prev => prev.map(conv => 
        conv.conversationId === conversationId 
          ? { ...conv, lastMessage: { ...conv.lastMessage, unread: false } } 
          : conv
      ));
    } catch (err) {
      console.error("标记已读失败：", err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!activeConversation) {
      message.warning("请先选择会话");
      return;
    }

    const fileId = `file-${Date.now()}`;
    setUploadingFiles(prev => [...prev, {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      file: file,
      progress: 0,
    }]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", activeConversation.conversationId);
    formData.append("expireDays", selectedExpireDays);
    formData.append("receiverId", activeConversation.withUser.id);

    try {
      const res = await authApi.sendFileMessage(formData);
      if (res.code === 0 && res.data?.content) {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: "done", url: res.data.content, fileName: res.data.fileName } 
            : f
        ));
      } else {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: "error" } : f
        ));
        message.error(res.message || "文件上传失败");
      }
    } catch (err) {
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "error" } : f
      ));
      message.error("文件上传异常: " + (err.message || "未知错误"));
    }
  };

  const handleSendFileMessage = async () => {
    if (!activeConversation || !currentUserId || uploadingFiles.length === 0) {
      message.warning("请选择文件并确保会话有效");
      return;
    }

    setSendingLoading(true);

    try {
      const formData = new FormData();
      uploadingFiles.forEach(file => formData.append("file", file.file));
      formData.append("conversationId", activeConversation.conversationId);
      formData.append("expireDays", selectedExpireDays);
      formData.append("receiverId", activeConversation.withUser.id);

      const res = await authApi.sendFileMessage(formData);

      if (res.code === 0 && res.data) {
        const newFileMessage = {
          id: res.data.id.toString(),
          senderId: currentUserId,
          content: res.data.content,
          time: res.data.createTime || new Date().toISOString(),
          status: "sent",
          senderAvatar: currentUserAvatar,
          files: [{
            name: res.data.fileName,
            url: res.data.content,
            size: res.data.fileSize,
            type: res.data.fileType
          }],
          expireTime: res.data.expireTime,
          isExpired: res.data.isExpired === 1,
          type: 2
        };
        setMessages(prev => [...prev, newFileMessage]);
        updateConversationLastMessage(`发送了文件: ${res.data.fileName}`, newFileMessage.time);
        setMessageContent("");
        setUploadingFiles([]);
        message.success("文件发送成功");
      } else {
        message.error(res.message || "文件发送失败");
      }
    } catch (err) {
      console.error("文件发送失败：", err);
      message.error("网络异常，文件发送失败");
    } finally {
      setSendingLoading(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = async () => {
    const content = messageContent.trim();
    if (!content || !activeConversation || !currentUserIdRef.current) {
      message.warning("请输入消息内容");
      return;
    }

    setSendingLoading(true);
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: currentUserIdRef.current,
      content,
      time: new Date().toISOString(),
      status: "sending",
      senderAvatar: currentUserAvatar,
      files: [],
      type: 0
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await authApi.sendMessage({
        content,
        fromUserId: currentUserIdRef.current,
        toUserId: activeConversation.withUser.id,
        type: 0,
      });

      if (res.code === 0 && res.data) {
        const finalAvatar = res.data.senderAvatar ? getAvatar(res.data.senderAvatar) : currentUserAvatar;
        setMessages(prev => prev.map(msg => 
          msg.id === tempMsg.id 
            ? {
                id: res.data.id.toString(),
                senderId: currentUserIdRef.current,
                content: res.data.content,
                time: res.data.createTime,
                status: "sent",
                senderAvatar: finalAvatar,
                files: [],
                expireTime: res.data.expireTime,
                isExpired: res.data.isExpired === 1,
                type: 0
              } 
            : msg
        ));
        updateConversationLastMessage(content, new Date().toISOString());
        setMessageContent("");
        setUploadingFiles([]);
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMsg.id ? { ...msg, status: "failed" } : msg
        ));
        message.error(res.message || "发送消息失败");
      }
    } catch (err) {
      setMessages(prev => prev.map(msg => 
        msg.id === tempMsg.id ? { ...msg, status: "failed" } : msg
      ));
      console.error("发送消息失败：", err);
      message.error("网络异常，发送失败");
    } finally {
      setSendingLoading(false);
    }
  };

  const updateConversationLastMessage = (content, time) => {
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation.id 
        ? {
            ...conv,
            lastMessage: {
              content,
              time,
              unread: false,
              id: `last-${Date.now()}`,
            },
          } 
        : conv
    ));
  };

  const handleConversationChange = (conversation) => {
    setActiveConversation(conversation);
    fetchConversationMessages(conversation.conversationId);
  };

  const handleEmojiSelect = (emojiData) => {
    setMessageContent(prev => prev + emojiData.emoji);
    setEmojiVisible(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleResendMessage = (failedMsg) => {
    setMessageContent(failedMsg.content);
    document.querySelector("textarea.ant-input")?.focus();
  };

  // 处理过期文件点击事件
  const handleExpiredFileClick = (fileName, e) => {
    e.preventDefault();
    setExpiredFileName(fileName);
    setFileExpiredModalVisible(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // 根据文件名获取对应的文件图标
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileTextOutlined />;
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return <FileImageOutlined style={{ color: '#52c41a' }} />;
    } else if (['pdf'].includes(ext)) {
      return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FileExcelOutlined style={{ color: '#389e0d' }} />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FileWordOutlined style={{ color: '#1890ff' }} />;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return <FileZipOutlined style={{ color: '#fa8c16' }} />;
    }
    return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      {pageLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <Spin indicator={loadingIcon} tip="加载中..." />
        </div>
      )}

      {/* 文件过期提示弹窗 */}
      <Modal
        title="文件已过期"
        open={fileExpiredModalVisible}
        onCancel={() => setFileExpiredModalVisible(false)}
        footer={[
          <Button 
            key="confirm" 
            type="primary" 
            onClick={() => setFileExpiredModalVisible(false)}
          >
            确定
          </Button>
        ]}
        centered
      >
        <p>抱歉，文件「{expiredFileName}」已超过有效期，无法下载。</p>
        <p>请联系发送者重新发送该文件。</p>
      </Modal>

      <div style={{
        padding: "24px",
        background: "#f7f8fa",
        flex: 1,
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{
            width: 300,
            borderRight: "1px solid #f0f0f0",
            overflowY: "auto",
          }}>
            <List
              dataSource={conversations}
              renderItem={(conversation) => {
                const roleConfig = getRoleConfig(conversation.withUser.role);
                return (
                  <List.Item
                    style={{
                      cursor: "pointer",
                      backgroundColor: activeConversation?.id === conversation.id ? "#f0f7ff" : "inherit",
                      padding: "12px 16px",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onClick={() => handleConversationChange(conversation)}
                  >
                    <List.Item.Meta
                      avatar={
                          <Avatar src={conversation.withUser.avatar} size={40} />
                      }
                      title={
                        <div style={{ fontWeight: "500", fontSize: 14 }}>
                          {conversation.withUser.name}
                          <Tag size="small" color={roleConfig.color} style={{ marginLeft: 8 }}>
                            {roleConfig.text}
                          </Tag>
                        </div>
                      }
                      description={
                        <span style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "inline-block",
                          width: "100%",
                          fontSize: 12,
                          color: "#666",
                        }}>
                          {conversation.lastMessage.content}
                        </span>
                      }
                    />
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {new Date(conversation.lastMessage.time).toLocaleDateString()}
                      <br />
                      {new Date(conversation.lastMessage.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </List.Item>
                );
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "20px 0", textAlign: "center" }}>
                    暂无会话
                  </div>
                ),
              }}
            />
          </div>

          {creatingConversation ? (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fafafa",
            }}>
              <Spin indicator={loadingIcon} tip="正在创建会话..." />
            </div>
          ) : activeConversation ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{
                padding: "16px 24px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}>
                <Space>
                  <Avatar src={activeConversation.withUser.avatar} size={40} />
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 15 }}>
                      {activeConversation.withUser.name}
                    </div>
                    <Tag
                      size="small"
                      color={getRoleConfig(activeConversation.withUser.role).color}
                    >
                      {getRoleConfig(activeConversation.withUser.role).text}
                    </Tag>
                  </div>
                </Space>
              </div>

              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                background: "#fafafa",
              }}>
                <List
                  dataSource={messages}
                  renderItem={(msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    const isFileMessage = msg.type === 2;

                    // 通用样式定义
                    const commonStyles = {
                      container: {
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "12px",
                      },
                      senderName: {
                        fontWeight: 500,
                        marginBottom: 4,
                        fontSize: 12,
                        color: "#666",
                      },
                      timeStatus: {
                        fontSize: "0.8em",
                        marginTop: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      },
                    };

                    // 文件消息样式
                    const fileMsgStyles = {
                      msgCard: {
                        padding: "12px 14px",
                        borderRadius: isCurrentUser ? "10px 0 10px 10px" : "0 10px 10px 10px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        display: "inline-block",
                      },
                      fileItem: {
                        padding: "10px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: msg.isExpired ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s",
                      },
                    };

                    // 文本消息样式
                    const textMsgStyles = {
                      msgCard: {
                        padding: "10px 14px",
                        borderRadius: isCurrentUser ? "10px 0 10px 10px" : "0 10px 10px 10px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        display: "inline-block",
                      },
                    };

                    // 主题颜色区分（自己发送 vs 他人发送）
                    const theme = isCurrentUser
                      ? {
                          cardBg: "#1890ff",
                          textColor: "#fff",
                          fileBg: "rgba(255,255,255,0.15)",
                          timeColor: "rgba(255,255,255,0.8)",
                          expiredText: "#ffcccc",
                          expireTag: "#ffd700",
                        }
                      : {
                          cardBg: "#e9f7fe",
                          textColor: "#333",
                          fileBg: "rgba(0,0,0,0.03)",
                          timeColor: "#999",
                          expiredText: "#999",
                          expireTag: "#ff7d00",
                        };

                    // 渲染文件项目
                    const renderFileItem = (file, index) => (
                      <a
                        key={index}
                        href={!msg.isExpired ? file.url : "javascript:void(0)"}
                        target={!msg.isExpired ? "_blank" : undefined}
                        rel={!msg.isExpired ? "noopener noreferrer" : undefined}
                        onClick={msg.isExpired ? (e) => handleExpiredFileClick(file.name, e) : undefined}
                      >
                        <div
                          style={{
                            ...fileMsgStyles.fileItem,
                            backgroundColor: theme.fileBg,
                            opacity: msg.isExpired ? 0.7 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!msg.isExpired) {
                              e.currentTarget.style.backgroundColor = isCurrentUser
                                ? "rgba(255,255,255,0.25)"
                                : "rgba(0,0,0,0.06)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.fileBg;
                          }}
                        >
                          {getFileIcon(file.name)}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 14,
                              color: msg.isExpired ? theme.expiredText : theme.textColor,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: 2,
                            }}>
                              {file.name}
                              {msg.isExpired && (
                                <span style={{ marginLeft: 6, fontSize: 12 }}>（已过期）</span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: 12, color: theme.timeColor }}>
                                {formatFileSize(file.size)}
                              </span>
                              {!msg.isExpired && msg.expireTime && (
                                <span style={{ fontSize: 12, color: theme.expireTag }}>
                                  有效期至 {new Date(msg.expireTime).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    );

                    // 渲染文件消息
                    if (isFileMessage) {
                      return (
                        <List.Item style={{
                          display: "flex",
                          margin: "8px 0",
                          padding: 0,
                          border: "none",
                          alignItems: "flex-start",
                        }}>
                          {!isCurrentUser ? (
                            <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
                              <Avatar
                                src={msg.senderAvatar}
                                size={36}
                                style={{ marginRight: 12, flexShrink: 0 }}
                              />
                              <div style={commonStyles.container}>
                                <div style={commonStyles.senderName}>
                                  {activeConversation.withUser.name}
                                </div>
                                <div style={{ 
                                  ...fileMsgStyles.msgCard, 
                                  backgroundColor: theme.cardBg, 
                                  color: theme.textColor 
                                }}>
                                  <div>
                                    {msg.files.map(renderFileItem)}
                                  </div>
                                  <div style={{ 
                                    ...commonStyles.timeStatus, 
                                    color: theme.timeColor, 
                                    justifyContent: "flex-end" 
                                  }}>
                                    {new Date(msg.time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                              <div style={commonStyles.container}>
                                <div style={{ ...commonStyles.senderName, textAlign: "right" }}>
                                  我
                                </div>
                                <div style={{ 
                                  ...fileMsgStyles.msgCard, 
                                  backgroundColor: theme.cardBg, 
                                  color: theme.textColor 
                                }}>
                                  <div>
                                    {msg.files.map(renderFileItem)}
                                  </div>
                                  <div style={{ 
                                    ...commonStyles.timeStatus, 
                                    color: theme.timeColor, 
                                    justifyContent: "flex-end" 
                                  }}>
                                    {new Date(msg.time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    {msg.status === "sending" && (
                                      <Tooltip title="发送中">
                                        <span>🕒</span>
                                      </Tooltip>
                                    )}
                                    {msg.status === "failed" && (
                                      <Tooltip title="点击重发">
                                        <span
                                          style={{ cursor: "pointer" }}
                                          onClick={() => handleResendMessage(msg)}
                                        >
                                          ✖
                                        </span>
                                      </Tooltip>
                                    )}
                                    {msg.status === "read" && (
                                      <Tooltip title="已读">
                                        <span><CheckOutlined /></span>
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Avatar
                                src={msg.senderAvatar}
                                size={36}
                                style={{ marginLeft: 12, flexShrink: 0 }}
                              />
                            </div>
                          )}
                        </List.Item>
                      );
                    } else {
                      // 渲染文本消息
                      return (
                        <List.Item style={{
                          display: "flex",
                          margin: "8px 0",
                          padding: 0,
                          border: "none",
                          alignItems: "flex-start",
                        }}>
                          {!isCurrentUser ? (
                            <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
                              <Avatar
                                src={msg.senderAvatar}
                                size={36}
                                style={{ marginRight: 12, flexShrink: 0 }}
                              />
                              <div style={commonStyles.container}>
                                <div style={commonStyles.senderName}>
                                  {activeConversation.withUser.name}
                                </div>
                                <div style={{ 
                                  ...textMsgStyles.msgCard, 
                                  backgroundColor: theme.cardBg, 
                                  color: theme.textColor 
                                }}>
                                  {msg.content}
                                  <div style={{ 
                                    ...commonStyles.timeStatus, 
                                    color: theme.timeColor, 
                                    justifyContent: "flex-end" 
                                  }}>
                                    {new Date(msg.time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                              <div style={commonStyles.container}>
                                <div style={{ ...commonStyles.senderName, textAlign: "right" }}>
                                  我
                                </div>
                                <div style={{ 
                                  ...textMsgStyles.msgCard, 
                                  backgroundColor: theme.cardBg, 
                                  color: theme.textColor 
                                }}>
                                  {msg.content}
                                  <div style={{ 
                                    ...commonStyles.timeStatus, 
                                    color: theme.timeColor, 
                                    justifyContent: "flex-end" 
                                  }}>
                                    {new Date(msg.time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    {msg.status === "sending" && (
                                      <Tooltip title="发送中">
                                        <span>🕒</span>
                                      </Tooltip>
                                    )}
                                    {msg.status === "failed" && (
                                      <Tooltip title="点击重发">
                                        <span
                                          style={{ cursor: "pointer" }}
                                          onClick={() => handleResendMessage(msg)}
                                        >
                                          ✖
                                        </span>
                                      </Tooltip>
                                    )}
                                    {msg.status === "read" && (
                                      <Tooltip title="已读">
                                        <span><CheckOutlined /></span>
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Avatar
                                src={msg.senderAvatar}
                                size={36}
                                style={{ marginLeft: 12, flexShrink: 0 }}
                              />
                            </div>
                          )}
                        </List.Item>
                      );
                    }
                  }}
                  locale={{
                    emptyText: (
                      <div style={{
                        padding: "50px 0",
                        textAlign: "center",
                        color: "#999",
                      }}>
                        暂无消息记录
                      </div>
                    ),
                  }}
                />
                <div ref={messagesEndRef} />
              </div>

              <div style={{
                padding: "16px 24px",
                borderTop: "1px solid #f0f0f0",
                background: "#fff",
              }}>
                {uploadingFiles.length > 0 && (
                  <div style={{
                    marginBottom: 12,
                    padding: 10,
                    background: "#f5f5f5",
                    borderRadius: 6,
                    maxHeight: 120,
                    overflowY: "auto",
                  }}>
                    {uploadingFiles.map((file) => (
                      <div key={file.id} style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 6,
                        justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {getFileIcon(file.name)}
                          <div style={{ marginLeft: 8 }}>
                            <div style={{ fontSize: 13, wordBreak: "break-all" }}>
                              {file.name}
                            </div>
                            <div style={{
                              fontSize: 12,
                              color: "#999",
                              marginTop: 2,
                            }}>
                              {file.status === "uploading"
                                ? `上传中... ${file.progress}%`
                                : file.status === "done"
                                  ? `已上传 · ${formatFileSize(file.size)}`
                                  : "上传失败"}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleRemoveFile(file.id)}
                          style={{ color: "#ff4d4f" }}
                        />
                      </div>
                    ))}

                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 13, color: "#666", marginRight: 8 }}>
                        文件有效期：
                      </span>
                      <Select
                        value={selectedExpireDays}
                        onChange={setSelectedExpireDays}
                        style={{ width: 120 }}
                        size="small"
                      >
                        <Option value={1}>1天</Option>
                        <Option value={7}>7天</Option>
                        <Option value={30}>30天</Option>
                        <Option value={90}>90天</Option>
                      </Select>
                    </div>
                  </div>
                )}

                <TextArea
                  rows={3}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="输入消息内容..."
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{ marginBottom: "8px", borderRadius: "8px" }}
                />

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <Space>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                      multiple
                    />
                    <Button
                      type="text"
                      icon={<PaperClipOutlined />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      附件
                    </Button>

                    <Popover
                      content={
                        <EmojiPicker
                          onEmojiClick={handleEmojiSelect}
                          width={300}
                          height={400}
                        />
                      }
                      title="选择表情"
                      trigger="click"
                      visible={emojiVisible}
                      onVisibleChange={setEmojiVisible}
                    >
                      <Button type="text" icon={<SmileOutlined />} />
                    </Popover>
                  </Space>

                  <Space>
                    {uploadingFiles.length > 0 ? (
                      <Button
                        type="primary"
                        onClick={handleSendFileMessage}
                        loading={sendingLoading}
                        disabled={uploadingFiles.some(f => f.status === "uploading")}
                      >
                        发送文件
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={handleSendMessage}
                        loading={sendingLoading}
                        disabled={!messageContent.trim()}
                      >
                        发送
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fafafa",
            }}>
              <div style={{ textAlign: "center" }}>
                <MessageOutlined
                  style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}
                />
                <p style={{ color: "#999" }}>请选择一个会话开始聊天</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCenterPage;
    