import React, { useState, useEffect, useRef } from 'react';
import { Layout, List, Avatar, Input, Button, Badge, Typography, Divider, Tooltip, message, Modal, Select } from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  MoreOutlined,
  SearchOutlined,
  UserAddOutlined,
  MessageOutlined,
  PictureOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  ClockCircleOutlined, 
  DownloadOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import moment from 'moment';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// 模拟好友数据
const friendsData = [
  {
    id: 1,
    name: "张明",
    avatar: "https://picsum.photos/id/1012/200/200",
    lastMessage: "你好！有什么可以帮助你的吗？",
    lastMessageTime: "10:24",
    unreadCount: 0,
    online: true
  },
  {
    id: 2,
    name: "李老师",
    avatar: "https://picsum.photos/id/1005/200/200",
    lastMessage: "关于你的论文，我有一些修改建议",
    lastMessageTime: "昨天",
    unreadCount: 2,
    online: false
  },
  {
    id: 3,
    name: "王同学",
    avatar: "https://picsum.photos/id/1074/200/200",
    lastMessage: "项目进展怎么样了？",
    lastMessageTime: "周一",
    unreadCount: 0,
    online: true
  },
  {
    id: 4,
    name: "赵教授",
    avatar: "https://picsum.photos/id/1025/200/200",
    lastMessage: "下周的学术会议别忘了参加",
    lastMessageTime: "上周",
    unreadCount: 0,
    online: false
  }
];

// 模拟聊天记录数据（包含带有效期的文件）
const initialChats = {
  1: [
    { id: 1, content: "你好，张明同学！我看到了你发表的论文，很感兴趣。", sender: "me", time: "09:30", type: "text", status: "read" },
    { id: 2, content: "你好！有什么可以帮助你的吗？", sender: "other", time: "10:24", type: "text" },
    { id: 3, content: "https://picsum.photos/id/237/400/300", sender: "me", time: "10:26", type: "image", fileName: "论文截图.jpg", status: "read" },
    { id: 4, content: "论文初稿.pdf", sender: "me", time: "10:30", type: "file", fileName: "论文初稿.pdf", fileSize: "2.4MB", 
      expiryDays: 7, expiryDate: moment().add(7, 'days').format('YYYY-MM-DD'), status: "delivered" }
  ],
  2: [
    { id: 1, content: "李老师您好，请问我的论文初稿您看了吗？", sender: "me", time: "昨天 15:42", type: "text", status: "read" },
    { id: 2, content: "看了，整体不错，有一些修改建议", sender: "other", time: "昨天 16:10", type: "text" },
    { id: 3, content: "修改建议.docx", sender: "other", time: "昨天 16:15", type: "file", fileName: "修改建议.docx", fileSize: "1.2MB",
      expiryDays: 3, expiryDate: moment().add(3, 'days').format('YYYY-MM-DD') }
  ],
  3: [
    { id: 1, content: "项目进展怎么样了？", sender: "other", time: "周一 08:30", type: "text" },
    { id: 2, content: "还在进行中，遇到一些技术问题", sender: "me", time: "周一 09:15", type: "text", status: "read" }
  ],
  4: [
    { id: 1, content: "赵教授您好，下周的学术会议我会参加的", sender: "me", time: "上周 14:20", type: "text", status: "read" },
    { id: 2, content: "好的，记得提前准备一下", sender: "other", time: "上周 15:05", type: "text" }
  ]
};

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chats, setChats] = useState(initialChats);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState(7);
  const [fileToUpload, setFileToUpload] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // 从URL参数获取初始聊天对象ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authorId = params.get('authorId');
    
    if (authorId) {
      const friend = friendsData.find(f => f.id === parseInt(authorId));
      if (friend) {
        setSelectedFriend(friend);
      }
    } else if (friendsData.length > 0) {
      setSelectedFriend(friendsData[0]);
    }
  }, [location.search]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedFriend, chats]);

  // 检查文件是否过期
  const isFileExpired = (expiryDate) => {
    return moment(expiryDate).isBefore(moment(), 'day');
  };

  // 过滤好友列表
  const filteredFriends = friendsData.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 发送消息
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const updatedChats = {
      ...chats,
      [selectedFriend.id]: [
        ...chats[selectedFriend.id],
        {
          id: Date.now(),
          content: newMessage,
          sender: "me",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "text",
          status: "sending"
        }
      ]
    };

    setChats(updatedChats);
    setNewMessage("");

    // 模拟消息发送状态更新
    setTimeout(() => {
      const withStatus = {
        ...updatedChats,
        [selectedFriend.id]: updatedChats[selectedFriend.id].map(msg => 
          msg.id === Date.now() ? { ...msg, status: "delivered" } : msg
        )
      };
      setChats(withStatus);

      // 模拟已读状态
      if (selectedFriend.online) {
        setTimeout(() => {
          const withRead = {
            ...withStatus,
            [selectedFriend.id]: withStatus[selectedFriend.id].map(msg => 
              msg.id === Date.now() ? { ...msg, status: "read" } : msg
            )
          };
          setChats(withRead);
        }, 1000);
      }

      // 模拟对方回复
      setTimeout(() => {
        const withReply = {
          ...withStatus,
          [selectedFriend.id]: [
            ...withStatus[selectedFriend.id],
            {
              id: Date.now() + 1,
              content: "感谢你的留言，我会尽快回复你！",
              sender: "other",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "text"
            }
          ]
        };
        setChats(withReply);
      }, 1500);
    }, 500);
  };

  // 处理按Enter发送消息
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 选择好友聊天
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    // 清除未读消息
    if (friend.unreadCount > 0) {
      // 实际应用中应该更新到状态管理或后端
    }
  };

  // 处理图片上传
  const handleImageUpload = (e) => {
    if (!selectedFriend || !e.target.files.length) return;
    
    const file = e.target.files[0];
    // 简单验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件');
      return;
    }
    
    // 在实际应用中，这里应该上传到服务器并获取图片URL
    const imageUrl = `https://picsum.photos/seed/${Date.now()}/400/300`;
    
    const updatedChats = {
      ...chats,
      [selectedFriend.id]: [
        ...chats[selectedFriend.id],
        {
          id: Date.now(),
          content: imageUrl,
          sender: "me",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "image",
          fileName: file.name,
          status: "sending"
        }
      ]
    };
    
    setChats(updatedChats);
    // 重置输入
    e.target.value = '';
    setShowFileOptions(false);

    // 模拟图片发送完成
    setTimeout(() => {
      const withStatus = {
        ...updatedChats,
        [selectedFriend.id]: updatedChats[selectedFriend.id].map(msg => 
          msg.id === Date.now() ? { ...msg, status: "delivered" } : msg
        )
      };
      setChats(withStatus);

      // 模拟已读状态
      if (selectedFriend.online) {
        setTimeout(() => {
          const withRead = {
            ...withStatus,
            [selectedFriend.id]: withStatus[selectedFriend.id].map(msg => 
              msg.id === Date.now() ? { ...msg, status: "read" } : msg
            )
          };
          setChats(withRead);
        }, 1000);
      }
    }, 800);
  };

  // 处理文件选择（打开有效期设置弹窗）
  const handleFileSelect = (e) => {
    if (!selectedFriend || !e.target.files.length) return;
    
    setFileToUpload(e.target.files[0]);
    setShowExpiryModal(true);
  };

  // 确认文件上传（带有效期）
  const confirmFileUpload = () => {
    if (!fileToUpload || !selectedFriend) return;
    
    // 计算文件大小
    const fileSize = fileToUpload.size < 1024 * 1024 
      ? `${(fileToUpload.size / 1024).toFixed(1)}KB` 
      : `${(fileToUpload.size / (1024 * 1024)).toFixed(1)}MB`;
    
    // 计算过期日期
    const expiryDate = moment().add(selectedExpiry, 'days').format('YYYY-MM-DD');
    
    const updatedChats = {
      ...chats,
      [selectedFriend.id]: [
        ...chats[selectedFriend.id],
        {
          id: Date.now(),
          content: fileToUpload.name,
          sender: "me",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "file",
          fileName: fileToUpload.name,
          fileSize: fileSize,
          expiryDays: selectedExpiry,
          expiryDate: expiryDate,
          status: "sending"
        }
      ]
    };
    
    setChats(updatedChats);
    // 重置状态
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFileToUpload(null);
    setShowExpiryModal(false);
    setShowFileOptions(false);
    setSelectedExpiry(7);

    // 模拟文件上传完成
    setTimeout(() => {
      const withStatus = {
        ...updatedChats,
        [selectedFriend.id]: updatedChats[selectedFriend.id].map(msg => 
          msg.id === Date.now() ? { ...msg, status: "delivered" } : msg
        )
      };
      setChats(withStatus);

      // 模拟已读状态
      if (selectedFriend.online) {
        setTimeout(() => {
          const withRead = {
            ...withStatus,
            [selectedFriend.id]: withStatus[selectedFriend.id].map(msg => 
              msg.id === Date.now() ? { ...msg, status: "read" } : msg
            )
          };
          setChats(withRead);
        }, 1000);
      }
    }, 1200);
  };

  // 触发文件选择
  const triggerFileSelect = (type) => {
    if (type === 'image') {
      imageInputRef.current.click();
    } else if (type === 'file') {
      fileInputRef.current.click();
    }
  };

  // 下载文件处理
  const handleFileDownload = (fileInfo, e) => {
    e.stopPropagation();
    
    if (isFileExpired(fileInfo.expiryDate)) {
      message.error('文件已过期，无法下载');
      return;
    }
    
    // 模拟文件下载
    message.success(`正在下载 ${fileInfo.fileName}`);
    // 实际应用中，这里应该调用下载API
  };

  // 查看文件处理
  const handleFileView = (fileInfo, e) => {
    e.stopPropagation();
    
    if (isFileExpired(fileInfo.expiryDate)) {
      message.error('文件已过期，无法查看');
      return;
    }
    
    // 模拟文件查看
    message.info(`正在查看 ${fileInfo.fileName}`);
    // 实际应用中，这里应该打开文件预览
  };

  // 渲染消息状态图标
  const renderMessageStatus = (status) => {
    switch(status) {
      case "sending":
        return <span style={{ fontSize: 12, color: '#999' }}>发送中...</span>;
      case "delivered":
        return <CheckOutlined style={{ fontSize: 12, color: '#999' }} />;
      case "read":
        return <CheckCircleOutlined style={{ fontSize: 12, color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  // 文件有效期设置弹窗
  const renderExpiryModal = () => (
    <Modal
      title="设置文件有效期"
      visible={showExpiryModal}
      onCancel={() => {
        setShowExpiryModal(false);
        setFileToUpload(null);
      }}
      onOk={confirmFileUpload}
      maskClosable={false}
    >
      <p>请选择文件可被下载查看的天数：</p>
      <Select
        defaultValue="7"
        style={{ width: '100%', marginTop: 16 }}
        onChange={(value) => setSelectedExpiry(parseInt(value))}
      >
        <Option value="1">1天</Option>
        <Option value="3">3天</Option>
        <Option value="7">7天</Option>
        <Option value="15">15天</Option>
        <Option value="30">30天</Option>
      </Select>
    </Modal>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <Content style={{ background: '#f0f2f5', padding: '24px' }}>
        <Layout style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)' }}>
          {/* 好友列表侧边栏 */}
          <Sider width={320} style={{ borderRight: '1px solid #f0f0f0', background: '#fff' }}>
            <div style={{ padding: '16px' }}>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                <MessageOutlined style={{ marginRight: 8 }} />消息
              </Title>
            </div>
            
            <Divider style={{ margin: 0, background: '#f0f0f0' }} />
            
            {/* 搜索框 */}
            <div style={{ padding: '12px' }}>
              <Input
                placeholder="搜索好友或消息..."
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: '20px', borderColor: '#e6f7ff' }}
              />
            </div>
            
            {/* 添加好友按钮 */}
            <div style={{ padding: '0 12px 12px' }}>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                block 
                style={{ borderRadius: '20px', backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              >
                添加好友
              </Button>
            </div>
            
            <Divider style={{ margin: 0, background: '#f0f0f0' }} />
            
            {/* 好友列表 */}
            <List
              dataSource={filteredFriends}
              renderItem={friend => (
                <List.Item
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend)}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedFriend?.id === friend.id ? '#e6f7ff' : 'transparent',
                    padding: '12px 16px',
                    borderLeft: selectedFriend?.id === friend.id ? '3px solid #1890ff' : 'none'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <Avatar src={friend.avatar} size="large" />
                        {friend.online && (
                          <span style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#52c41a',
                            border: '2px solid white'
                          }} />
                        )}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{friend.name}</span>
                        <Text style={{ fontSize: 12, color: '#999' }}>{friend.lastMessageTime}</Text>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text 
                          ellipsis 
                          style={{ 
                            fontSize: 14, 
                            color: selectedFriend?.id === friend.id ? '#1890ff' : '#666',
                            maxWidth: 200
                          }}
                        >
                          {friend.lastMessage}
                        </Text>
                        {friend.unreadCount > 0 && (
                          <Badge count={friend.unreadCount} style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              style={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}
            />
          </Sider>
          
          {/* 聊天区域 */}
          <Layout.Content style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
            {selectedFriend ? (
              <>
                {/* 聊天头部 */}
                <div style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={selectedFriend.avatar} size="large" style={{ marginRight: 12 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong>{selectedFriend.name}</Text>
                        {selectedFriend.online && (
                          <Badge status="success" text="在线" style={{ marginLeft: 8 }} />
                        )}
                      </div>
                      <Text style={{ fontSize: 12, color: '#999' }}>
                        {selectedFriend.online ? '正在输入...' : '最后活跃于 ' + selectedFriend.lastMessageTime}
                      </Text>
                    </div>
                  </div>
                  
                  <Tooltip title="更多选项">
                    <Button shape="circle" icon={<MoreOutlined />} size="small" style={{ color: '#1890ff' }} />
                  </Tooltip>
                </div>
                
                {/* 聊天消息区域 - 空白背景 */}
                <div style={{ 
                  flex: 1, 
                  padding: '24px', 
                  overflow: 'auto',
                  background: '#fff'
                }}>
                  <div style={{ 
                    maxWidth: '80%', 
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {chats[selectedFriend.id].map(message => (
                      <div 
                        key={message.id} 
                        style={{ 
                          alignSelf: message.sender === 'me' ? 'flex-end' : 'flex-start',
                          display: 'flex',
                          flexDirection: message.sender === 'me' ? 'row-reverse' : 'row',
                          alignItems: 'end',
                          gap: 8
                        }}
                      >
                        {message.type === "text" && (
                          <div 
                            style={{
                              backgroundColor: message.sender === 'me' ? '#1890ff' : '#f0f0f0',
                              color: message.sender === 'me' ? '#fff' : '#000',
                              padding: '8px 16px',
                              borderRadius: message.sender === 'me' 
                                ? '18px 18px 4px 18px' 
                                : '18px 18px 18px 4px',
                              maxWidth: '80%',
                              wordBreak: 'break-word'
                            }}
                          >
                            {message.content}
                          </div>
                        )}
                        
                        {message.type === "image" && (
                          <div 
                            style={{
                              border: message.sender === 'me' ? '1px solid #1890ff' : '1px solid #f0f0f0',
                              borderRadius: message.sender === 'me' 
                                ? '18px 18px 4px 18px' 
                                : '18px 18px 18px 4px',
                              maxWidth: '80%',
                              overflow: 'hidden'
                            }}
                          >
                            <img 
                              src={message.content} 
                              alt={message.fileName || '聊天图片'} 
                              style={{ maxWidth: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
                              onClick={() => window.open(message.content, '_blank')}
                            />
                            <div style={{ padding: '4px 8px', fontSize: 12, background: '#f5f5f5' }}>
                              {message.fileName}
                            </div>
                          </div>
                        )}
                        
                        {message.type === "file" && (
                          <div 
                            style={{
                              backgroundColor: message.sender === 'me' ? '#e6f7ff' : '#fafafa',
                              border: message.sender === 'me' ? '1px solid #1890ff' : '1px solid #e8e8e8',
                              color: message.sender === 'me' ? '#1890ff' : '#333',
                              padding: '12px',
                              borderRadius: message.sender === 'me' 
                                ? '18px 18px 4px 18px' 
                                : '18px 18px 18px 4px',
                              maxWidth: '80%',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <FileTextOutlined style={{ marginRight: 8, fontSize: 20 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ wordBreak: 'break-word', fontWeight: 500, cursor: 'pointer' }}
                                onClick={(e) => handleFileView(message, e)}>
                                {message.fileName}
                              </div>
                              <div style={{ fontSize: 12, color: '#999', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                                <span>{message.fileSize}</span>
                                <span style={{ display: 'flex', alignItems: 'center', color: isFileExpired(message.expiryDate) ? '#f5222d' : '#1890ff' }}>
                                  {/* 使用 ClockCircleOutlined 替代 ClockOutlined */}
                                  <ClockCircleOutlined style={{ fontSize: 10, marginRight: 2 }} />
                                  {isFileExpired(message.expiryDate) ? '已过期' : `有效期至 ${message.expiryDate}`}
                                </span>
                              </div>
                            </div>
                            {!isFileExpired(message.expiryDate) && (
                              <Tooltip title="下载">
                                <Button 
                                  shape="circle" 
                                  icon={<DownloadOutlined />} 
                                  size="small" 
                                  style={{ color: message.sender === 'me' ? '#1890ff' : '#666', marginLeft: 8 }}
                                  onClick={(e) => handleFileDownload(message, e)}
                                />
                              </Tooltip>
                            )}
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Text 
                            style={{ 
                              fontSize: 12, 
                              color: '#999', 
                              marginTop: 4,
                              display: 'block'
                            }}
                          >
                            {message.time}
                          </Text>
                          {message.sender === 'me' && message.status && renderMessageStatus(message.status)}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* 输入区域 */}
                <div style={{ 
                  padding: '16px', 
                  borderTop: '1px solid #f0f0f0',
                  backgroundColor: '#fafafa'
                }}>
                  {/* 文件和图片选择选项 */}
                  {showFileOptions && (
                    <div style={{ 
                      display: 'flex', 
                      gap: 12, 
                      marginBottom: 12, 
                      padding: 8,
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid #e6f7ff'
                    }}>
                      <Button 
                        icon={<PictureOutlined />} 
                        onClick={() => triggerFileSelect('image')}
                        style={{ color: '#1890ff', borderColor: '#e6f7ff' }}
                      >
                        图片
                      </Button>
                      <Button 
                        icon={<FileTextOutlined />} 
                        onClick={() => triggerFileSelect('file')}
                        style={{ color: '#1890ff', borderColor: '#e6f7ff' }}
                      >
                        文件
                      </Button>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      shape="circle" 
                      icon={<PaperClipOutlined />} 
                      size="large" 
                      style={{ marginRight: 8, color: '#1890ff', borderColor: '#e6f7ff' }}
                      onClick={() => setShowFileOptions(!showFileOptions)}
                    />
                    <Button 
                      shape="circle" 
                      icon={<SmileOutlined />} 
                      size="large" 
                      style={{ marginRight: 8, color: '#1890ff', borderColor: '#e6f7ff' }}
                    />
                    <Input.TextArea
                      placeholder="输入消息..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{ 
                        flex: 1,
                        borderRadius: '20px',
                        borderColor: '#e6f7ff',
                        resize: 'none'
                      }}
                    />
                    <Button 
                      type="primary" 
                      shape="circle" 
                      icon={<SendOutlined />} 
                      size="large" 
                      style={{ marginLeft: 8, backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    />
                  </div>
                  
                  {/* 隐藏的文件输入 */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={imageInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileSelect}
                  />
                </div>
                
                {/* 渲染有效期设置弹窗 */}
                {renderExpiryModal()}
              </>
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#fff'
              }}>
                <MessageOutlined style={{ fontSize: 64, color: '#e6f7ff', marginBottom: 24 }} />
                <Title level={3} style={{ color: '#1890ff' }}>选择一个好友开始聊天</Title>
                <Text style={{ color: '#999' }}>从左侧列表中选择一位好友开始对话</Text>
              </div>
            )}
          </Layout.Content>
        </Layout>
      </Content>
    </Layout>
  );
};

export default ChatPage;
    