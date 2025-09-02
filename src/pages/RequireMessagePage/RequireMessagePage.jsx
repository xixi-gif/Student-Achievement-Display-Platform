import React, { useState, useRef, useEffect } from 'react';
import { 
  List, Avatar, Input, Button, Space, Tag,
  Spin, Tooltip, message, Badge, Popover
} from 'antd';
import { 
  MessageOutlined, PaperClipOutlined, 
  SmileOutlined, CloseOutlined, LoadingOutlined, 
  CheckOutlined, FileTextOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { TextArea } = Input;
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const ROLE_CONFIG = {
  student: { text: '学生', color: 'green' },
  teacher: { text: '老师', color: 'orange' },
  admin: { text: '超级管理员', color: 'red' },
  guest: { text: '访客', color: 'gray' },
  default: { text: '用户', color: 'blue' } 
};

const MessageCenterPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [sendingLoading, setSendingLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [targetUser, setTargetUser] = useState({ id: null, name: null });
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState(DEFAULT_AVATAR);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const formatMessageTime = (timeStr) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return '未知时间';
    
    const padZero = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hour = padZero(date.getHours());
    const minute = padZero(date.getMinutes());
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const fetchUnreadCount = async (conversationId) => {
    const convIdStr = String(conversationId);
    if (!convIdStr) {
      message.warning('获取未读计数失败：会话ID无效');
      return 0;
    }

    try {
      const res = await authApi.getUnreadCount(convIdStr);
      if (res.code === 0) {
        return res.data || 0;
      } else {
        message.warning(`获取未读计数失败：${res.message || '服务器处理错误'}`);
        return 0;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || '网络异常';
      message.error(`获取未读计数失败：${errorMsg}`);
      return 0;
    }
  };

  const updateTotalUnread = () => {
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    setUnreadTotal(total);
  };

  const markAsRead = async (conversationId) => {
    const convIdStr = String(conversationId);
    if (!convIdStr) {
      message.warning('标记已读失败：会话ID无效');
      return false;
    }

    try {
      const res = await authApi.markAsRead(convIdStr);
      
      if (res.code === 0) {
        setConversations(prev => 
          prev.map(conv => 
            String(conv.conversationId) === convIdStr
              ? { 
                  ...conv, 
                  unreadCount: 0,
                  lastMessage: { ...conv.lastMessage, unread: false } 
                }
              : conv
          )
        );
        
        if (activeConversation && String(activeConversation.conversationId) === convIdStr) {
          setMessages(prev => 
            prev.map(msg => 
              msg.status === 'sent' ? { ...msg, status: 'read' } : msg
            )
          );
        }
        
        updateTotalUnread();
        return res.data;
      } else {
        message.error(`标记已读失败：${res.message || '服务器处理错误'}`);
        return false;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || '网络异常';
      message.error(`标记已读失败：${errorMsg}`);
      return false;
    }
  };

  const markAsUnread = async (conversationId) => {
    const convIdStr = String(conversationId);
    if (!convIdStr) {
      message.warning('标记未读失败：会话ID无效');
      return;
    }

    try {
      const res = await authApi.markAsUnread(convIdStr);
      
      if (res.code === 0) {
        const unreadCount = await fetchUnreadCount(conversationId);
        setConversations(prev => 
          prev.map(conv => 
            String(conv.conversationId) === convIdStr
              ? { 
                  ...conv, 
                  unreadCount: unreadCount,
                  lastMessage: { ...conv.lastMessage, unread: true } 
                }
              : conv
          )
        );
        
        updateTotalUnread();
        message.success('已标记为未读');
      } else {
        message.error(`标记未读失败：${res.message || '服务器处理错误'}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || '网络异常';
      message.error(`标记未读失败：${errorMsg}`);
    }
  };

  const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.default;

  const getAvatar = (avatarUrl) => {
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      return <img 
               src={avatarUrl} 
               onError={(e) => e.target.src = DEFAULT_AVATAR} 
               alt="用户头像" 
             />;
    }
    return DEFAULT_AVATAR;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const parseUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const toUserId = params.get('toUserId');
      const toUserName = params.get('toUserName') ? decodeURIComponent(params.get('toUserName')) : null;
      if (toUserId) {
        setTargetUser({ id: toUserId, name: toUserName || '未知用户' });
      }
    };
    parseUrlParams();
  }, []);

  useEffect(() => {
    updateTotalUnread();
  }, [conversations]);

  useEffect(() => {
    const initData = async () => {
      try {
        setPageLoading(true);
        const userRes = await authApi.getuserlogin();
        if (userRes.code === 0 && userRes.data?.id) {
          setCurrentUserId(String(userRes.data.id));
          setCurrentUserAvatar(getAvatar(userRes.data.avatar) || DEFAULT_AVATAR);
          
          await fetchConversations();
          
          if (targetUser.id && currentUserId) {
            await handleTargetUserConversation();
          }
        } else {
          message.error('获取用户信息失败，请重新登录');
        }
      } catch (err) {
        console.error('初始化失败：', err);
        message.error('页面加载失败，请刷新重试');
      } finally {
        setPageLoading(false);
      }
    };
    initData();
  }, [targetUser]);

  const handleTargetUserConversation = async () => {
    if (targetUser.id === currentUserId) {
      message.warning('不能与自己创建会话');
      return;
    }

    const existingConv = conversations.find(
      conv => String(conv.withUser.id) === String(targetUser.id)
    );

    if (existingConv) {
      setActiveConversation(existingConv);
      await fetchConversationMessages(existingConv.conversationId);
    } else {
      setCreatingConversation(true);
      try {
        const initMessage = '你好，我想咨询关于这个项目';
        const sendRes = await authApi.sendMessage({
          content: initMessage,
          fromUserId: currentUserId,
          toUserId: targetUser.id,
          type: 0
        });

        if (sendRes.code === 0 && sendRes.data) {
          await fetchConversations();
          const updatedConvsRes = await authApi.getConversationRecords({ params: { current: 1, pageSize: 20 } });
          
          if (updatedConvsRes.code === 0 && updatedConvsRes.data) {
            const formattedConvs = await Promise.all(updatedConvsRes.data.map(async (conv) => {
              const unreadCount = await fetchUnreadCount(conv.id);
              return {
                id: String(conv.id),
                withUser: {
                  id: String(conv.withUser.id),
                  name: conv.withUser.name || '未知用户',
                  avatar: getAvatar(conv.withUser.avatar),
                  role: conv.withUser.role || 'default'
                },
                lastMessage: {
                  content: conv.lastMessage?.content || initMessage,
                  time: conv.lastMessage?.createTime || new Date().toISOString(),
                  unread: unreadCount > 0,
                  id: String(conv.lastMessage?.id || '')
                },
                conversationId: String(conv.id),
                unreadCount: unreadCount
              };
            }));
            
            setConversations(formattedConvs);
            const newConv = formattedConvs.find(
              conv => String(conv.withUser.id) === String(targetUser.id)
            );
            
            if (newConv) {
              setActiveConversation(newConv);
              const initialMessages = [{
                id: String(sendRes.data.id),
                senderId: currentUserId,
                content: initMessage,
                time: sendRes.data.createTime || new Date().toISOString(),
                status: 'sent',
                senderAvatar: currentUserAvatar,
                files: []
              }];
              setMessages(initialMessages);
            }
          }
        } else {
          message.error('创建会话失败：' + (sendRes.message || '未知错误'));
        }
      } catch (err) {
        console.error('创建会话失败详情：', err.response || err);
        const errorMsg = err.response?.data?.message || err.message || '创建会话失败，请重试';
        message.error(errorMsg);
      } finally {
        setCreatingConversation(false);
      }
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await authApi.getConversationRecords({ params: { current: 1, pageSize: 20 } });

      if (res.code === 0 && res.data) {
        const formattedConversations = await Promise.all(
          res.data.map(async (conv) => {
            const unreadCount = await fetchUnreadCount(conv.id);
            return {
              id: String(conv.id),
              withUser: {
                id: String(conv.withUser.id),
                name: conv.withUser.name || '未知用户',
                avatar: getAvatar(conv.withUser.avatar),
                role: conv.withUser.role || 'default'
              },
              lastMessage: {
                content: conv.lastMessage?.content || '',
                time: conv.lastMessage?.createTime || new Date().toISOString(),
                unread: unreadCount > 0,
                id: String(conv.lastMessage?.id || '')
              },
              conversationId: String(conv.id),
              unreadCount: unreadCount
            };
          })
        );

        setConversations(formattedConversations);
        if (!targetUser.id && !activeConversation && formattedConversations.length > 0) {
          setActiveConversation(formattedConversations[0]);
        }
      } else {
        message.error(res.message || '加载会话列表失败');
      }
    } catch (err) {
      console.error('加载会话失败：', err);
      message.error('加载会话失败，请重试');
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    const convIdStr = String(conversationId);
    try {
      setPageLoading(true);
      const res = await authApi.getConversationMessages(convIdStr);
      
      if (res.code === 0 && res.data?.records) {
        const validRecords = res.data.records.filter(
          msg => String(msg.conversationId) === convIdStr
        );
        
        const sortedRecords = [...validRecords].sort((a, b) => 
          new Date(a.createTime) - new Date(b.createTime)
        );
        
        const formattedMessages = sortedRecords.map(msg => {
          let avatar = DEFAULT_AVATAR;
          if (String(msg.senderId) === currentUserId) {
            avatar = currentUserAvatar;
          } else {
            avatar = activeConversation?.withUser?.avatar || DEFAULT_AVATAR;
          }

          return {
            id: String(msg.id),
            senderId: String(msg.senderId),
            content: msg.content || '',
            time: msg.createTime || new Date().toISOString(),
            status: msg.status === 0 ? 'sending' : 
                    msg.status === 1 ? 'sent' : 
                    msg.status === 2 ? 'read' : 'failed',
            senderAvatar: avatar,
            files: msg.files || []
          };
        });

        setMessages(formattedMessages);
        const markSuccess = await markAsRead(convIdStr);
        if (markSuccess) {
          const newCount = await fetchUnreadCount(convIdStr);
          console.log(`当前会话未读计数更新为: ${newCount}`);
        }
      } else {
        message.error(res.message || '加载消息失败');
      }
    } catch (err) {
      console.error('加载消息失败：', err);
      message.error('加载消息失败，请重试');
    } finally {
      setPageLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const fileId = `file-${Date.now()}`;
    setUploadingFiles(prev => [...prev, {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      file: file
    }]);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await authApi.uploadFile(formData);
      if (res.code === 0 && res.data?.url) {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'done', url: res.data.url } 
            : f
        ));
        message.success('文件上传成功');
        setMessageContent(prev => `${prev}\n[文件] ${file.name}`);
      } else {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error' } 
            : f
        ));
        message.error(res.message || '文件上传失败');
      }
    } catch (err) {
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error' } 
          : f
      ));
      console.error('文件上传失败：', err);
      message.error('文件上传失败，请重试');
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = async () => {
    const content = messageContent.trim();
    if (!content || !activeConversation || !currentUserId) {
      message.warning('请输入消息内容');
      return;
    }

    setSendingLoading(true);
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      content,
      time: new Date().toISOString(),
      status: 'sending',
      senderAvatar: currentUserAvatar,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await authApi.sendMessage({
        content,
        fromUserId: currentUserId,
        toUserId: activeConversation.withUser.id,
        type: 0
      });

      if (res.code === 0 && res.data) {
        const finalAvatar = res.data.senderAvatar ? getAvatar(res.data.senderAvatar) : currentUserAvatar;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMsg.id 
              ? {
                  id: res.data.id.toString(),
                  senderId: currentUserId,
                  content: res.data.content,
                  time: res.data.createTime,
                  status: 'sent',
                  senderAvatar: finalAvatar,
                  files: res.data.files || []
                }
              : msg
          )
        );
        updateConversationLastMessage(content, new Date().toISOString());
        setMessageContent('');
        setUploadingFiles([]);
      } else {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMsg.id ? { ...msg, status: 'failed' } : msg
          )
        );
        message.error(res.message || '发送消息失败');
      }
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMsg.id ? { ...msg, status: 'failed' } : msg
        )
      );
      console.error('发送消息失败：', err);
      message.error('网络异常，发送失败');
    } finally {
      setSendingLoading(false);
    }
  };

  const updateConversationLastMessage = (content, time) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation.id 
          ? {
              ...conv,
              lastMessage: {
                content,
                time,
                unread: false,
                id: `last-${Date.now()}`
              }
            }
          : conv
      )
    );
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
    document.querySelector('textarea.ant-input')?.focus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar>
        <Badge 
          count={unreadTotal} 
          showZero={false}
          size="small"
          style={{ marginLeft: 16 }}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>消息中心</span>
        </Badge>
      </Navbar>

      {pageLoading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255,255,255,0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Spin indicator={loadingIcon} tip="加载中..." />
        </div>
      )}

      <div style={{ padding: '24px', background: '#f7f8fa', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: 300, borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
            <List
              dataSource={conversations}
              renderItem={(conversation) => {
                const roleConfig = getRoleConfig(conversation.withUser.role);
                return (
                  <List.Item
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: activeConversation?.id === conversation.id ? '#f0f7ff' : 'inherit',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f5f5f5'
                    }}
                    onClick={() => handleConversationChange(conversation)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={conversation.unreadCount} showZero={false}>
                          <Avatar src={conversation.withUser.avatar} size={40} />
                        </Badge>
                      }
                      title={
                        <div style={{ fontWeight: '500', fontSize: 14 }}>
                          {conversation.withUser.name}
                          <Tag 
                            size="small" 
                            color={roleConfig.color}
                            style={{ marginLeft: 8 }}
                          >
                            {roleConfig.text}
                          </Tag>
                        </div>
                      }
                      description={
                        <span style={{ 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'inline-block',
                          width: '100%',
                          fontSize: 12,
                          color: '#666'
                        }}>
                          {conversation.lastMessage.content}
                        </span>
                      }
                    />
                    <div style={{ fontSize: 11, color: '#999' }}>
                      {formatMessageTime(conversation.lastMessage.time)}
                    </div>
                  </List.Item>
                );
              }}
              locale={{ emptyText: <div style={{ padding: '20px 0', textAlign: 'center' }}>暂无会话</div> }}
            />
          </div>
          
          {creatingConversation ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
              <Spin indicator={loadingIcon} tip="正在创建会话..." />
            </div>
          ) : activeConversation ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                padding: '16px 24px', 
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff'
              }}>
                <Space>
                  <Avatar src={activeConversation.withUser.avatar} size={40} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>{activeConversation.withUser.name}</div>
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
                overflowY: 'auto', 
                padding: '24px',
                background: '#fafafa'
              }}>
                <List
                  dataSource={messages}
                  renderItem={(msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    return (
                      <List.Item
                        style={{
                          display: 'flex',
                          margin: '12px 0',
                          padding: 0,
                          border: 'none',
                          alignItems: 'flex-start'
                        }}
                      >
                        {!isCurrentUser ? (
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                            <Avatar 
                              src={msg.senderAvatar} 
                              size={36} 
                              style={{ marginRight: 12, flexShrink: 0 }} 
                            />
                            <div
                              style={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                maxWidth: '70%'
                              }}
                            >
                              <div style={{ 
                                fontWeight: 500, 
                                marginBottom: 4,
                                fontSize: 12,
                                color: '#666'
                              }}>
                                {activeConversation.withUser.name}
                              </div>
                              <div
                                style={{ 
                                  display: 'inline-block',
                                  padding: '10px 14px',
                                  borderRadius: '0 10px 10px 10px',
                                  background: '#e9f7fe',
                                  color: '#333',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                              >
                                {msg.content && <div>{msg.content}</div>}
                                {msg.files && msg.files.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    {msg.files.map((file, index) => (
                                      <div key={index} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        marginBottom: 4,
                                        color: '#1890ff'
                                      }}>
                                        <FileTextOutlined style={{ marginRight: 6 }} />
                                        <a 
                                          href={file.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          {file.name}
                                        </a>
                                        <span style={{ marginLeft: 6, fontSize: 12 }}>
                                          {formatFileSize(file.size)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div style={{ 
                                  fontSize: '0.8em', 
                                  color: '#999', 
                                  textAlign: 'right',
                                  marginTop: '4px'
                                }}>
                                  {formatMessageTime(msg.time)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                            <div
                              style={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                maxWidth: '70%'
                              }}
                            >
                              <div style={{ 
                                fontWeight: 500, 
                                marginBottom: 4,
                                fontSize: 12,
                                color: '#666'
                              }}>
                                我
                              </div>
                              <div
                                style={{ 
                                  display: 'inline-block',
                                  padding: '10px 14px',
                                  borderRadius: '10px 0 10px 10px',
                                  background: '#1890ff',
                                  color: '#fff',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                {msg.content && <div>{msg.content}</div>}
                                {msg.files && msg.files.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    {msg.files.map((file, index) => (
                                      <div key={index} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        marginBottom: 4,
                                        color: 'rgba(255,255,255,0.9)'
                                      }}>
                                        <FileTextOutlined style={{ marginRight: 6 }} />
                                        <a 
                                          href={file.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          {file.name}
                                        </a>
                                        <span style={{ marginLeft: 6, fontSize: 12 }}>
                                          {formatFileSize(file.size)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div style={{ 
                                  fontSize: '0.8em', 
                                  color: 'rgba(255,255,255,0.8)', 
                                  textAlign: 'right',
                                  marginTop: '4px',
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  alignItems: 'center'
                                }}>
                                  {formatMessageTime(msg.time)}
                                  {msg.status === 'sending' && (
                                    <Tooltip title="发送中">
                                      <span style={{ marginLeft: '4px' }}>🕒</span>
                                    </Tooltip>
                                  )}
                                  {msg.status === 'failed' && (
                                    <Tooltip title="点击重发">
                                      <span 
                                        style={{ marginLeft: '4px', cursor: 'pointer' }}
                                        onClick={() => handleResendMessage(msg)}
                                      >
                                        ✖
                                      </span>
                                    </Tooltip>
                                  )}
                                  {msg.status === 'read' && (
                                    <Tooltip title="已读">
                                      <span style={{ marginLeft: '4px' }}>
                                        <CheckOutlined />
                                      </span>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Avatar 
                              src={msg.senderAvatar} 
                              size={36} 
                              style={{ marginLeft: 12, flexShrink: 0, border: '1px solid transparent' }} 
                            />
                          </div>
                        )}
                      </List.Item>
                    );
                  }}
                  locale={{ emptyText: <div style={{ padding: '50px 0', textAlign: 'center', color: '#999' }}>暂无消息记录</div> }}
                />
                <div ref={messagesEndRef} />
              </div>
              
              <div style={{ 
                padding: '16px 24px', 
                borderTop: '1px solid #f0f0f0',
                background: '#fff'
              }}>
                {uploadingFiles.length > 0 && (
                  <div style={{ 
                    marginBottom: 12, 
                    padding: 10, 
                    background: '#f5f5f5', 
                    borderRadius: 6,
                    maxHeight: 120,
                    overflowY: 'auto'
                  }}>
                    {uploadingFiles.map(file => (
                      <div key={file.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: 6,
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FileTextOutlined style={{ marginRight: 8, color: '#666' }} />
                          <div>
                            <div style={{ fontSize: 13, wordBreak: 'break-all' }}>{file.name}</div>
                            <div style={{ 
                              fontSize: 12, 
                              color: '#999',
                              marginTop: 2
                            }}>
                              {file.status === 'uploading' ? '上传中...' : 
                               file.status === 'done' ? `已上传 · ${formatFileSize(file.size)}` : 
                               '上传失败'}
                            </div>
                          </div>
                        </div>
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined />} 
                          size="small"
                          onClick={() => handleRemoveFile(file.id)}
                          style={{ color: '#ff4d4f' }}
                        />
                      </div>
                    ))}
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
                  style={{ marginBottom: '8px', borderRadius: '8px' }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                          e.target.value = '';
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
                      <Button 
                        type="text" 
                        icon={<SmileOutlined />}
                      />
                    </Popover>
                  </Space>
                  
                  <Button 
                    type="primary" 
                    onClick={handleSendMessage}
                    loading={sendingLoading}
                    disabled={!messageContent.trim() || uploadingFiles.some(f => f.status === 'uploading')}
                  >
                    发送
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#fafafa'
            }}>
              <div style={{ textAlign: 'center' }}>
                <MessageOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <p style={{ color: '#999' }}>请选择一个会话开始聊天</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCenterPage;
