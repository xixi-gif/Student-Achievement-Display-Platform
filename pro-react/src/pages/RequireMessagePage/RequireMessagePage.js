import React, { useState, useRef, useEffect } from 'react';
import { 
  List, Avatar, Input, Button, Space, Tag,
  Divider, Badge, Popover, message, Tooltip 
} from 'antd';
import { 
  MessageOutlined, UserOutlined, PaperClipOutlined, 
  SmileOutlined, CloseOutlined, CheckOutlined 
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';

const { TextArea } = Input;

// 模拟数据
const mockConversations = [
  {
    id: 'conv-1',
    withUser: {
      id: 'user-1',
      name: '李教授',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      role: 'teacher'
    },
    lastMessage: {
      content: '好的，那我们下周一开始项目',
      time: '2023-05-15T09:30:00Z',
      unread: false
    },
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        content: '您好，我看到您申请了我的项目',
        time: '2023-05-10T10:00:00Z',
        status: 'read'
      },
      {
        id: 'msg-2',
        senderId: 'current-user',
        content: '是的，我有相关经验',
        time: '2023-05-10T10:05:00Z',
        status: 'read'
      }
    ]
  }
];

const MessageCenterPage = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 发送消息处理函数
  const handleSendMessage = () => {
    if (!message.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    setLoading(true);
    
    // 模拟发送延迟
    setTimeout(() => {
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'current-user',
        content: message,
        time: new Date().toISOString(),
        status: 'sent'
      };

      const updatedConversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, newMessage],
        lastMessage: {
          content: message,
          time: new Date().toISOString(),
          unread: false
        }
      };

      setActiveConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id ? updatedConversation : conv
        )
      );
      
      setMessage('');
      setLoading(false);
      scrollToBottom();
    }, 500);
  };

  // 处理表情选择
  const handleEmojiSelect = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setEmojiVisible(false);
  };

  // 处理会话切换
  const handleConversationChange = (conversation) => {
    setActiveConversation(conversation);
    scrollToBottom();
  };

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* 左侧会话列表 */}
      <div style={{ width: 300, borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item
              style={{ 
                cursor: 'pointer',
                backgroundColor: activeConversation.id === conversation.id ? '#f0f7ff' : 'inherit',
                padding: '12px 16px'
              }}
              onClick={() => handleConversationChange(conversation)}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={conversation.lastMessage.unread}>
                    <Avatar src={conversation.withUser.avatar} />
                  </Badge>
                }
                title={conversation.withUser.name}
                description={
                  <span style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    width: '100%'
                  }}>
                    {conversation.lastMessage.content}
                  </span>
                }
              />
              <div style={{ fontSize: 12, color: '#999' }}>
                {new Date(conversation.lastMessage.time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </List.Item>
          )}
        />
      </div>
      
      {/* 右侧消息区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 消息标题栏 */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            <Avatar src={activeConversation.withUser.avatar} />
            <span style={{ fontWeight: 'bold' }}>{activeConversation.withUser.name}</span>
            <Tag color={activeConversation.withUser.role === 'student' ? 'green' : 'orange'}>
              {activeConversation.withUser.role === 'student' ? '学生' : '教师'}
            </Tag>
          </Space>
          <Button type="text" icon={<CloseOutlined />} />
        </div>
        
        {/* 消息内容区域 */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px 24px',
          background: '#fafafa'
        }}>
          <List
  dataSource={activeConversation.messages}
  renderItem={(msg) => (
    <List.Item
      style={{
        display: 'flex',
        flexDirection: msg.senderId === 'current-user' ? 'row-reverse' : 'row',
        margin: '8px 0',
        padding: 0,
        border: 'none'
      }}
    >
      <div style={{ margin: '0 12px' }}>
        <Avatar 
          src={msg.senderId === 'current-user' 
            ? 'https://randomuser.me/api/portraits/men/1.jpg' 
            : activeConversation.withUser.avatar} 
        />
      </div>
      <div
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: msg.senderId === 'current-user' ? 'flex-end' : 'flex-start',
          maxWidth: '70%'
        }}
      >
        <div style={{ fontWeight: 500, marginBottom: 4 }}>
          {msg.senderId === 'current-user' ? '我' : activeConversation.withUser.name}
        </div>
        <div
          style={{ 
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '4px',
            background: msg.senderId === 'current-user' ? '#e6f7ff' : '#f5f5f5',
          }}
        >
          {msg.content}
          <div style={{ 
            fontSize: '0.8em', 
            color: '#999', 
            textAlign: 'right',
            marginTop: '4px'
          }}>
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
              <Tooltip title="发送失败">
                <span style={{ marginLeft: '4px', color: '#ff4d4f' }}>✖</span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </List.Item>
  )}
/>
          <div ref={messagesEndRef} />
        </div>
        
        {/* 消息输入区域 */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #f0f0f0',
          background: '#fff'
        }}>
          <TextArea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入消息内容..."
            onPressEnter={(e) => {
              if (e.shiftKey) {
                return;
              }
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                type="text" 
                icon={<PaperClipOutlined />}
                onClick={() => message.info('附件功能将在后续版本开放')}
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
              loading={loading}
              disabled={!message.trim()}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenterPage;