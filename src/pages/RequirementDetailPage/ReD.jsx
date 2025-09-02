import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Descriptions, Tag, Button, Space, Avatar, Card, message,
  List, Tabs, Layout, Spin, Alert
} from 'antd';
import { 
  MessageOutlined, DollarOutlined, ClockCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api'; 

const { Content } = Layout;
const { TabPane } = Tabs;

const RequirementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('detail');

  const fetchRequirement = async () => {
    if (!id || typeof id !== 'string') {
      setError('需求ID不合法，请返回列表重试');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时，请检查网络')), 10000)
      );
      const response = await Promise.race([
        authApi.getRequirementByid(id),
        timeoutPromise
      ]);

      if (!response || typeof response !== 'object') {
        throw new Error('后端返回格式异常');
      }

      if (response.code === 0 && response.data) {
        setRequirement(transformBackendData(response.data));
      } else {
        setError(response.message || '获取需求失败：后端返回业务错误');
        message.error(response.message || '获取需求失败');
      }
    } catch (err) {
      console.error('获取需求详情失败:', err);
      const errorMsg = err.message.includes('Failed to fetch') 
        ? '网络错误：无法连接到服务器，请检查网络或后端服务'
        : err.message || '未知错误，请重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirement();
  }, [id]);

  // 转换后端数据 - 直接使用数据库返回的role字段
  const transformBackendData = (data) => {
    return {
      id: data.id,
      title: data.title || '无标题',
      type: data.type || 'other',
      description: data.description || '无详细描述',
      status: mapStatus(data.status),
      publishTime: data.publishTime || new Date().toISOString(),
      deadline: data.deadline || new Date().toISOString(),
      publisher: {
        id: data.publisher?.id || '',
        name: data.publisher?.userName || '未知发布者',
        // 直接使用后端返回的role字段，不做前端推测
        role: data.publisher?.role ?? 'unknown',
        avatar: data.publisher?.userAvatar || 'https://picsum.photos/200/200?random=1'
      },
      budget: data.budget === 0 ? '面议' : `${data.budget || 0}元`,
      urgency: data.urgency || 'normal',
      contact: data.contact || '请联系发布者获取联系方式',
      applicants: (data.applicants || []).map(applicant => ({
        id: applicant.id || '',
        name: applicant.name || '未知申请者',
        role: applicant.role ?? 'unknown',
        avatar: applicant.avatar || 'https://picsum.photos/200/200?random=2',
        applyTime: applicant.applyTime || new Date().toISOString(),
        introduction: applicant.introduction || '暂无介绍'
      }))
    };
  };

  // 映射状态码到文本
  const mapStatus = (statusCode) => {
    const statusMap = { 1: 'pending', 2: 'in_progress', 3: 'completed' };
    return statusMap[statusCode] || 'pending';
  };

  // 获取状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待接单' },
      in_progress: { color: 'blue', text: '进行中' },
      completed: { color: 'green', text: '已完成' }
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  
  const getRoleText = (role) => {
    const roleMap = {
      'admin': '超级管理员',
      'student': '学生',
      'teacher': '老师',
      'guest': '访客',
    };
    return roleMap[role] || role;
  };


  const getRoleColor = (role) => {
    const colorMap = {
      'student': 'green',    
      'teacher': 'orange',   
      'admin': 'red',     
      'guest': 'gray',      
    };
    return colorMap[role] || 'gray';
  };

  const handleContact = () => {
    navigate('/messages');
  };

  const handleApply = async () => {
    if (!requirement?.id) return;
    try {
      await authApi.applyRequirement(requirement.id, {
        introduction: '我想申请这个需求'
      });
      message.success('申请已提交，请等待发布者确认');
    } catch (err) {
      console.error('申请失败:', err);
      message.error(err.message || '申请提交失败，请重试');
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ padding: '24px 5%', minHeight: 'calc(100vh - 64px)', background: '#f0f2f5' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <Spin size="large" tip="正在加载需求详情..." />
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Content style={{ padding: '24px 5%', minHeight: 'calc(100vh - 64px)', background: '#f0f2f5' }}>
          <Card>
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Alert
                message="获取失败"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
              />
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchRequirement}
              >
                重试
              </Button>
              <Button 
                style={{ marginLeft: 16 }} 
                onClick={() => navigate('/requirements')}
              >
                返回需求列表
              </Button>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
      <Navbar />
      <Content style={{ 
        background: '#f0f2f5', 
        padding: '24px 5%',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <Card
          title="需求详情"
          extra={
            <Space>
              <Button onClick={() => navigate('/requirements')}>返回列表</Button>
            </Space>
          }
          style={{ margin: 0, borderRadius: 4 }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="基本信息" key="detail">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="需求标题">
                  {requirement.title}
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {requirement.type}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="发布者">
                  <Space>
                    <Avatar src={requirement.publisher.avatar} />
                    {requirement.publisher.name}
                    <Tag color={getRoleColor(requirement.publisher.role)}>
                      {getRoleText(requirement.publisher.role)}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  {getStatusTag(requirement.status)}
                  <Tag color={requirement.urgency === '高' ? 'red' : 
                             requirement.urgency === 'normal' ? 'blue' : 'green'}>
                    {requirement.urgency}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="预算">
                  <Tag icon={<DollarOutlined />}>{requirement.budget}</Tag>
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
                  <Button icon={<MessageOutlined />} onClick={handleContact}>
                    联系发布者
                  </Button>
                  {requirement.status === 'pending' && (
                    <Button type="primary" onClick={handleApply}>
                      申请接单
                    </Button>
                  )}
                </Space>
              </div>
            </TabPane>

            {requirement.applicants.length > 0 && (
              <TabPane tab={`申请者 (${requirement.applicants.length})`} key="applicants">
                <List
                  dataSource={requirement.applicants}
                  renderItem={(applicant) => (
                    <List.Item
                      actions={[
                        <Button type="link" onClick={() => {}}>
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
                            <Tag color={getRoleColor(applicant.role)}>
                              {getRoleText(applicant.role)}
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
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};

export default RequirementDetailPage;
