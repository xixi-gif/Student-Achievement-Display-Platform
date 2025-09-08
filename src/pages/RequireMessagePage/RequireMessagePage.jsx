import React, { useState, useRef, useEffect } from 'react';
import { 
  List, Avatar, Input, Button, Space, Tag,
  Spin, Tooltip, message, Badge, Popover, Select
} from 'antd';
import { 
  MessageOutlined, PaperClipOutlined, 
  SmileOutlined, CloseOutlined, LoadingOutlined, 
  CheckOutlined, FileTextOutlined, DeleteOutlined
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { TextArea } = Input;
const { Option } = Select;
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const ROLE_CONFIG = {
  student: { text: '学生', color: 'green' },
  teacher: { text: '老师', color: 'orange' },
  admin: { text: '超级管理员', color: 'red' },
  visitor: { text: '访客', color: 'gray' },
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
  const [selectedExpireDays, setSelectedExpireDays] = useState(7);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.default;

  const getAvatar = (avatarUrl) => {
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      return <img 
               src={avatarUrl} 
               onError={(e) => e.target.src = DEFAULT_AVATAR} 
               alt="用户头像" 
               style={{ objectFit: 'cover' }}
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
      if (toUserId) setTargetUser({ id: toUserId, name: toUserName || '未知用户' });
    };
    parseUrlParams();
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const userRes = await authApi.getuserlogin();
        if (userRes.code === 0 && userRes.data) {
          setCurrentUserId(String(userRes.data.id));
          setCurrentUserAvatar(getAvatar(userRes.data.avatar) || DEFAULT_AVATAR);
          await fetchConversations();
          if (targetUser.id && currentUserId) await handleTargetUserConversation();
        } else {
          message.error('获取用户信息失败，请重新登录');
        }
      } catch (err) {
        console.error('初始化失败:', err);
        message.error('页面加载失败，请刷新重试');
      } finally {
        setPageLoading(false);
      }
    };
    initData();
  }, [targetUser, currentUserId]);

  // const handleTargetUserConversation = async () => {
  //   if (targetUser.id === currentUserId) {
  //     message.warning('不能与自己创建会话');
  //     return;
  //   }

  //   const existingConv = conversations.find(conv => conv.withUser.id === targetUser.id);
  //   if (existingConv) {
  //     setActiveConversation(existingConv);
  //     await fetchConversationMessages(existingConv.conversationId);
  //     return;
  //   }

  //   setCreatingConversation(true);
  //   try {
  //     const initMessage = '你好，我想咨询关于这个项目';
  //     const sendRes = await authApi.sendMessage({
  //       content: initMessage,
  //       fromUserId: currentUserId,
  //       toUserId: targetUser.id,
  //       type: 0
  //     });

  //     if (sendRes.code === 0 && sendRes.data) {
  //       await fetchConversations(); 
  //       const updatedConvs = await authApi.getConversationRecords();
        
  //       if (updatedConvs.code === 0 && updatedConvs.data) {
  //         const formattedConvs = updatedConvs.data.map(conv => ({
  //           id: conv.id.toString(),
  //           withUser: {
  //             id: String(conv.withUser.id),
  //             name: conv.withUser.name || '未知用户',
  //             avatar: getAvatar(conv.withUser.avatar),
  //             role: conv.withUser.role || 'default'
  //           },
  //           lastMessage: {
  //             content: conv.lastMessage?.content || 'initMessage',
  //             time: conv.lastMessage?.createTime || new Date().toISOString(),
  //             unread: false,
  //             id: conv.lastMessage?.id?.toString() || ''
  //           },
  //           conversationId: conv.id
  //         }));
          
  //         setConversations(formattedConvs);
  //         const newConv = formattedConvs.find(conv => conv.withUser.id === targetUser.id);
          
  //         if (newConv) {
  //           setActiveConversation(newConv);
  //           const initialMessages = [{
  //             id: sendRes.data.id.toString(),
  //             senderId: currentUserId,
  //             content: initMessage,
  //             time: sendRes.data.createTime || new Date().toISOString(),
  //             status: 'sent',
  //             senderAvatar: currentUserAvatar,
  //             files: []
  //           }];
  //           setMessages(initialMessages);
  //         }
  //     } else {
  //       message.error('创建会话失败');
  //     }
  //   }
  //   } catch (err) {
  //     console.error('创建会话失败详情：', err.response || err);
  //     const errorMsg = err.response?.data?.message || err.message || '创建会话失败，请重试';
  //     message.error(errorMsg);
  //   } finally {
  //     setCreatingConversation(false);
  //   }
  // };

  const handleTargetUserConversation = async () => {
  if (targetUser.id === currentUserId) {
    message.warning('不能与自己创建会话');
    return;
  }

  const existingConv = conversations.find(conv => conv.withUser.id === targetUser.id);
  
  if (existingConv) {
    setActiveConversation(existingConv);
    await fetchConversationMessages(existingConv.conversationId);
    return;
  }

  setCreatingConversation(true);
  try {
    // 只有在新会话时才发送初始消息
    const initMessage = '你好，我想咨询关于这个项目';
    const sendRes = await authApi.sendMessage({
      content: initMessage,
      fromUserId: currentUserId,
      toUserId: targetUser.id,
      type: 0
    });

    if (sendRes.code === 0 && sendRes.data) {
       //  刷新会话列表
      await fetchConversations();
      
      // 获取更新后的会话列表
      const updatedConvs = await authApi.getConversationRecords();
      
      if (updatedConvs.code === 0 && updatedConvs.data) {
        const formattedConvs = updatedConvs.data.map(conv => ({
          id: conv.id.toString(),
          withUser: {
            id: String(conv.withUser.id),
            name: conv.withUser.name || '未知用户',
            avatar: getAvatar(conv.withUser.avatar),
            role: conv.withUser.role || 'default'
          },
          lastMessage: {
            content: conv.lastMessage?.content || initMessage,
            time: conv.lastMessage?.createTime || new Date().toISOString(),
            unread: false,
            id: conv.lastMessage?.id?.toString() || ''
          },
          conversationId: conv.id
        }));
        
        setConversations(formattedConvs);
        const newConv = formattedConvs.find(conv => conv.withUser.id === targetUser.id);
        
        if (newConv) {
          setActiveConversation(newConv);
          const initialMessages = [{
            id: sendRes.data.id.toString(),
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
    }else{
      message.error(sendRes.message || '发送初始消息失败');
    }
  } catch (err) {
    // 错误处理
    console.error('创建会话失败详情：', err);
    message.error(err.message || '创建会话失败，请重试');
  } finally {
    setCreatingConversation(false);
  }
};

  const fetchConversations = async () => {
    try {
      setPageLoading(true);
      const res = await authApi.getConversationRecords();

      if (res.code === 0 && res.data) {
        const formattedConversations = res.data.map(conv => ({
          id: conv.id.toString(),
          withUser: {
            id: String(conv.withUser.id),
            name: conv.withUser.name || '未知用户',
            avatar: getAvatar(conv.withUser.avatar),
            role: conv.withUser.role || 'default'
          },
          lastMessage: {
            content: conv.lastMessage?.content || '',
            time: conv.lastMessage?.createTime || new Date().toISOString(),
            unread: conv.lastMessage?.status === 0 && String(conv.lastMessage?.senderId) !== currentUserId,
            id: conv.lastMessage?.id?.toString() || ''
          },
          conversationId: conv.id
        }));

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
        
        const sortedRecords = [...validRecords].sort((a, b) => {
          return new Date(a.createTime) - new Date(b.createTime);
        });
        
        const formattedMessages = sortedRecords.map(msg => {
          let avatar = DEFAULT_AVATAR;
          if (String(msg.senderId) === currentUserId) {
            avatar = currentUserAvatar;
          } else {
            avatar = activeConversation?.withUser?.avatar || DEFAULT_AVATAR;
          }

          return {
            id: msg.id.toString(),
            senderId: String(msg.senderId),
            content: msg.content || '',
            time: msg.createTime || new Date().toISOString(),
            status: msg.status === 0 ? 'sending' : 
                    msg.status === 1 ? 'sent' : 
                    msg.status === 2 ? 'read' : 'failed',
            senderAvatar: avatar,
            files: msg.files || [],
            expireTime: msg.expireTime,
            isExpired: msg.isExpired === 1
          };
        });

        setMessages(formattedMessages);
        await markAsRead(conversationId);
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

  const markAsRead = async (conversationId) => {
    try {
      await authApi.markAsRead(conversationId);
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, lastMessage: { ...conv.lastMessage, unread: false } } 
            : conv
        )
      );
    } catch (err) {
      console.error('标记已读失败：', err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!activeConversation) {
      message.warning('请先选择会话');
      return;
    }
    
    const fileId = `file-${Date.now()}`;
    setUploadingFiles(prev => [...prev, {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      file: file,
      progress: 0
    }]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', activeConversation.conversationId);
    formData.append('expireDays', selectedExpireDays);
    formData.append('receiverId', activeConversation.withUser.id);
    
    try {
      const res = await authApi.sendFileMessage(formData);

      if (res.code === 0 && res.data?.content) {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'done', url: res.data.content, fileName: res.data.fileName } : f
        ));
      } else {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'error' } : f
        ));
        message.error(res.message || '文件上传失败');
      }
    } catch (err) {
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error' } : f
      ));
      message.error('文件上传异常: ' + (err.message || '未知错误'));
    }
  };

  const handleSendFileMessage = async () => {
    if (!activeConversation || !currentUserId || uploadingFiles.length === 0) {
      message.warning('请选择文件并确保会话有效');
      return;
    }

    setSendingLoading(true);

    try {
      const formData = new FormData();
      uploadingFiles.forEach((file) => {
        formData.append('file', file.file);
      });
      formData.append('conversationId', activeConversation.conversationId);
      formData.append('expireDays', selectedExpireDays);
      formData.append('receiverId', activeConversation.withUser.id);

      const res = await authApi.sendFileMessage(formData);

      if (res.code === 0 && res.data) {
        const newFileMessage = {
          id: res.data.id.toString(),
          senderId: currentUserId,
          content: `发送了文件: ${res.data.fileName}`,
          time: res.data.createTime || new Date().toISOString(),
          status: 'sent',
          senderAvatar: currentUserAvatar,
          files: [
            {
              name: res.data.fileName,
              url: res.data.content,
              size: res.data.fileSize
            }
          ],
          expireTime: res.data.expireTime,
          isExpired: res.data.isExpired === 1
        };
        setMessages(prev => [...prev, newFileMessage]);
        updateConversationLastMessage(newFileMessage.content, newFileMessage.time);
        setMessageContent('');
        setUploadingFiles([]);
        message.success('文件发送成功');
      } else {
        message.error(res.message || '文件发送失败');
      }
    } catch (err) {
      console.error('文件发送失败：', err);
      message.error('网络异常，文件发送失败');
    } finally {
      setSendingLoading(false);
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
                  files: res.data.files || [],
                  expireTime: res.data.expireTime,
                  isExpired: res.data.isExpired === 1
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
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
                        <Badge dot={conversation.lastMessage.unread}>
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
                      {new Date(conversation.lastMessage.time).toLocaleDateString()}
                      <br />
                      {new Date(conversation.lastMessage.time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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
                {/* <Space>
                  <Tooltip title="静音会话">
                    <Button 
                      type="text" 
                      icon={<MessageOutlined />}
                      size="small"
                    />
                  </Tooltip>
                  <Button type="text" icon={<CloseOutlined />} size="small" />
                </Space> */}
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
                                        color: msg.isExpired ? '#999' : '#1890ff'
                                      }}>
                                        <FileTextOutlined style={{ marginRight: 6 }} />
                                        <a 
                                          href={!msg.isExpired ? file.url : 'javascript:void(0)'} 
                                          target={!msg.isExpired ? "_blank" : undefined} 
                                          rel={!msg.isExpired ? "noopener noreferrer" : undefined}
                                          onClick={msg.isExpired ? (e) => {
                                            e.preventDefault();
                                            message.warning('文件已过期，无法下载');
                                          } : undefined}
                                        >
                                          {file.name}
                                          {msg.isExpired && <span style={{ marginLeft: 8 }}>（已过期）</span>}
                                        </a>
                                        <span style={{ marginLeft: 6, fontSize: 12 }}>
                                          {formatFileSize(file.size)}
                                        </span>
                                        {!msg.isExpired && msg.expireTime && (
                                          <span style={{ marginLeft: 8, fontSize: 12, color: '#ff7d00' }}>
                                            有效期至 {new Date(msg.expireTime).toLocaleDateString()}
                                          </span>
                                        )}
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
                                  {new Date(msg.time).toLocaleDateString()} {' '}
                                  {new Date(msg.time).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
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
                                        color: msg.isExpired ? '#ccc' : 'rgba(255,255,255,0.9)'
                                      }}>
                                        <FileTextOutlined style={{ marginRight: 6 }} />
                                        <a 
                                          href={!msg.isExpired ? file.url : 'javascript:void(0)'} 
                                          target={!msg.isExpired ? "_blank" : undefined} 
                                          rel={!msg.isExpired ? "noopener noreferrer" : undefined}
                                          onClick={msg.isExpired ? (e) => {
                                            e.preventDefault();
                                            message.warning('文件已过期，无法下载');
                                          } : undefined}
                                        >
                                          {file.name}
                                          {msg.isExpired && <span style={{ marginLeft: 8 }}>（已过期）</span>}
                                        </a>
                                        <span style={{ marginLeft: 6, fontSize: 12 }}>
                                          {formatFileSize(file.size)}
                                        </span>
                                        {!msg.isExpired && msg.expireTime && (
                                          <span style={{ marginLeft: 8, fontSize: 12, color: '#ffd700' }}>
                                            有效期至 {new Date(msg.expireTime).toLocaleDateString()}
                                          </span>
                                        )}
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
                                  {new Date(msg.time).toLocaleDateString()} {' '}
                                  {new Date(msg.time).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
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
                              {file.status === 'uploading' ? `上传中... ${file.progress}%` : 
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
                    
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>文件有效期：</span>
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
                  
                  <Space>
                    {uploadingFiles.length > 0 ? (
                      <Button 
                        type="primary" 
                        onClick={handleSendFileMessage}
                        loading={sendingLoading}
                        disabled={uploadingFiles.some(f => f.status === 'uploading')}
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
    