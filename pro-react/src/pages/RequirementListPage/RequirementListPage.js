// src/pages/RequirementListPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Card, Tag, Avatar, Button, Space, Input, Select, Pagination } from 'antd';
import { SearchOutlined, MessageOutlined, DollarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

// 模拟数据
const mockRequirements = [
  {
    id: 'req-1',
    title: '寻找Python数据分析项目合作伙伴',
    type: 'project',
    description: '需要一个熟悉Python和Pandas的同学合作完成一个数据分析项目，时间2周左右。',
    status: 'pending',
    publishTime: '2023-05-10T09:30:00Z',
    publisher: {
      id: 'user-1',
      name: '李教授',
      role: 'teacher'
    },
    applicants: 3,
    budget: '面议',
    urgency: 'normal'
  },
  {
    id: 'req-2',
    title: '数学建模竞赛组队',
    type: 'competition',
    description: '寻找2名队友参加下个月的数学建模竞赛，要求有相关经验。',
    status: 'pending',
    publishTime: '2023-05-12T14:20:00Z',
    publisher: {
      id: 'user-2',
      name: '王同学',
      role: 'student'
    },
    applicants: 2,
    budget: '无偿',
    urgency: 'high'
  },
  {
    id: 'req-3',
    title: '毕业论文数据处理帮助',
    type: 'research',
    description: '需要帮助处理一些实验数据，使用SPSS或Python均可。',
    status: 'in_progress',
    publishTime: '2023-05-08T11:15:00Z',
    publisher: {
      id: 'user-3',
      name: '张同学',
      role: 'student'
    },
    applicants: 1,
    budget: '500元以内',
    urgency: 'normal'
  },
  {
    id: 'req-4',
    title: '机器学习算法辅导',
    type: 'tutor',
    description: '需要一位熟悉机器学习算法的同学进行每周2次的辅导。',
    status: 'completed',
    publishTime: '2023-04-28T16:45:00Z',
    publisher: {
      id: 'user-4',
      name: '赵同学',
      role: 'student'
    },
    applicants: 4,
    budget: '500-2000元',
    urgency: 'low'
  },
  {
    id: 'req-5',
    title: '网站开发项目合作',
    type: 'project',
    description: '需要一个前端开发和一个后端开发合作完成一个企业网站项目。',
    status: 'pending',
    publishTime: '2023-05-15T10:00:00Z',
    publisher: {
      id: 'user-5',
      name: '刘老师',
      role: 'teacher'
    },
    applicants: 0,
    budget: '2000-5000元',
    urgency: 'normal'
  }
];

const RequirementListPage = () => {
  const [requirements, setRequirements] = useState(mockRequirements);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待接单' },
      in_progress: { color: 'blue', text: '进行中' },
      completed: { color: 'green', text: '已完成' }
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  const handleDetail = (id) => {
    navigate(`/requirements/${id}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="搜索需求"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={value => setSearchKeyword(value)}
          />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="pending">待接单</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
        </Space>
      </div>
      
      <List
        itemLayout="vertical"
        size="large"
        dataSource={requirements}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            extra={
              <Space direction="vertical" align="end">
                <div>{getStatusTag(item.status)}</div>
                <div>
                  <Tag icon={<ClockCircleOutlined />}>
                    {new Date(item.publishTime).toLocaleDateString()}
                  </Tag>
                </div>
              </Space>
            }
          >
            <List.Item.Meta
              avatar={<Avatar src={`https://randomuser.me/api/portraits/${item.publisher.role === 'student' ? 'men' : 'women'}/${Math.floor(Math.random() * 10)}.jpg`} />}
              title={<a onClick={() => handleDetail(item.id)}>{item.title}</a>}
              description={
                <Space>
                  <span>发布者: {item.publisher.name}</span>
                  <Tag color={item.publisher.role === 'student' ? 'green' : 'orange'}>
                    {item.publisher.role === 'student' ? '学生' : '教师'}
                  </Tag>
                </Space>
              }
            />
            <div style={{ margin: '12px 0' }}>
              {item.description.length > 100 
                ? `${item.description.substring(0, 100)}...` 
                : item.description}
            </div>
            <Space>
              <Tag icon={<DollarOutlined />}>{item.budget}</Tag>
              {item.applicants > 0 && (
                <span>
                  <UserOutlined /> {item.applicants}人申请
                </span>
              )}
            </Space>
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <Button 
                type="text" 
                icon={<MessageOutlined />}
                onClick={() => navigate('/messages')}
              >
                联系发布者
              </Button>
              <Button 
                type="primary" 
                onClick={() => handleDetail(item.id)}
                style={{ marginLeft: 8 }}
              >
                查看详情
              </Button>
            </div>
          </List.Item>
        )}
      />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Pagination 
          total={50} 
          showSizeChanger
          showQuickJumper
          showTotal={total => `共 ${total} 条需求`}
        />
      </div>
    </div>
  );
};

export default RequirementListPage;