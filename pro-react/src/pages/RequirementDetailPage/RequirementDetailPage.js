// src/pages/RequirementDetailPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Descriptions, Tag, Button, Space, Avatar, Card, message,
  List, Divider, Tabs, Rate, Timeline 
} from 'antd';
import { 
  MessageOutlined, UserOutlined, ClockCircleOutlined, 
  DollarOutlined, CheckOutlined, CloseOutlined 
} from '@ant-design/icons';

const { TabPane } = Tabs;

// 模拟数据
const mockRequirementDetails = {
  'req-1': {
    id: 'req-1',
    title: '寻找Python数据分析项目合作伙伴',
    type: 'project',
    description: '需要一个熟悉Python和Pandas的同学合作完成一个数据分析项目，时间2周左右。需要有数据处理和可视化经验，能够使用Matplotlib或Seaborn进行图表绘制。项目涉及约10万条数据的清洗和分析。',
    status: 'pending',
    publishTime: '2023-05-10T09:30:00Z',
    deadline: '2023-05-25T00:00:00Z',
    publisher: {
      id: 'user-1',
      name: '李教授',
      role: 'teacher',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    budget: '面议',
    urgency: 'normal',
    contact: '邮箱: li.professor@university.edu',
    applicants: [
      {
        id: 'user-6',
        name: '周同学',
        role: 'student',
        avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        applyTime: '2023-05-11T10:15:00Z',
        introduction: '我有2年Python数据分析经验，熟悉Pandas和Matplotlib'
      },
      {
        id: 'user-7',
        name: '吴同学',
        role: 'student',
        avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
        applyTime: '2023-05-11T14:30:00Z',
        introduction: '参与过多个数据分析项目，擅长数据清洗和特征工程'
      }
    ],
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-6',
        senderName: '周同学',
        senderAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        content: '您好，我对这个项目很感兴趣，我有相关经验',
        sendTime: '2023-05-11T10:20:00Z',
        read: true
      },
      {
        id: 'msg-2',
        senderId: 'user-1',
        senderName: '李教授',
        senderAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        content: '谢谢你的申请，能详细说说你的经验吗？',
        sendTime: '2023-05-11T11:05:00Z',
        read: true
      }
    ]
  },
  // 其他需求的模拟数据...
};

const RequirementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement] = useState(mockRequirementDetails[id] || mockRequirementDetails['req-1']);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待接单' },
      in_progress: { color: 'blue', text: '进行中' },
      completed: { color: 'green', text: '已完成' }
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  const handleContact = () => {
    navigate('/messages');
  };

  const handleApply = () => {
    message.success('申请已提交，请等待发布者确认');
  };

  return (
    <Card
      title="需求详情"
      extra={
        <Space>
          <Button onClick={() => navigate('/requirements')}>返回列表</Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本信息" key="detail">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="需求标题">
              {requirement.title}
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {requirement.type === 'project' ? '项目合作' : 
                 requirement.type === 'tutor' ? '学业辅导' :
                 requirement.type === 'research' ? '科研协助' :
                 requirement.type === 'competition' ? '竞赛组队' : '其他需求'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="发布者">
              <Space>
                <Avatar src={requirement.publisher.avatar} />
                {requirement.publisher.name}
                <Tag color={requirement.publisher.role === 'student' ? 'green' : 'orange'}>
                  {requirement.publisher.role === 'student' ? '学生' : '教师'}
                </Tag>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="状态">
              {getStatusTag(requirement.status)}
              <Tag color={requirement.urgency === 'high' ? 'red' : 
                         requirement.urgency === 'normal' ? 'blue' : 'green'}>
                {requirement.urgency === 'high' ? '紧急' : 
                 requirement.urgency === 'normal' ? '一般' : '不紧急'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="预算">
              <Tag icon={<DollarOutlined />}>
                {requirement.budget}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="截止时间">
              <Tag icon={<ClockCircleOutlined />}>
                {new Date(requirement.deadline).toLocaleString()}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="联系方式">
              {requirement.contact}
            </Descriptions.Item>
            
            <Descriptions.Item label="详细描述">
              {requirement.description}
            </Descriptions.Item>
          </Descriptions>
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<MessageOutlined />}
                onClick={handleContact}
              >
                联系发布者
              </Button>
              {requirement.status === 'pending' && (
                <Button 
                  type="primary"
                  onClick={handleApply}
                >
                  申请接单
                </Button>
              )}
            </Space>
          </div>
        </TabPane>
        
        {requirement.applicants.length > 0 && (
          <TabPane 
            tab={`申请者 (${requirement.applicants.length})`} 
            key="applicants"
          >
            <List
              dataSource={requirement.applicants}
              renderItem={(applicant) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      onClick={() => setSelectedApplicant(applicant)}
                    >
                      选择
                    </Button>,
                    <Button type="link" onClick={handleContact}>
                      联系
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={applicant.avatar} />}
                    title={
                      <Space>
                        {applicant.name}
                        <Tag color={applicant.role === 'student' ? 'green' : 'orange'}>
                          {applicant.role === 'student' ? '学生' : '教师'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{applicant.introduction}</span>
                        <span>申请时间: {new Date(applicant.applyTime).toLocaleString()}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        )}
        
        <TabPane tab="沟通记录" key="messages">
  <List
    className="comment-list"
    itemLayout="horizontal"
    dataSource={requirement.messages}
    renderItem={(message) => (
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar src={message.senderAvatar} />}
          title={message.senderName}
          description={
            <>
              <div>{message.content}</div>
              <div style={{ color: '#999', fontSize: 12 }}>
                {new Date(message.sendTime).toLocaleString()}
              </div>
            </>
          }
        />
      </List.Item>
    )}
  />
</TabPane>
      </Tabs>
    </Card>
  );
};

export default RequirementDetailPage;