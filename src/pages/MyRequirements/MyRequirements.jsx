import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Card, List, Avatar, Tag, Button, Space, 
  Modal, Spin, message, Empty, Input, Select, Tooltip,
  Popconfirm
} from 'antd';
import { 
  ClockCircleOutlined, DollarOutlined, UserOutlined, 
  CheckOutlined, CloseOutlined, EyeOutlined, 
  DeleteOutlined, MessageOutlined, SearchOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const statusMap = {
  all: { color: 'gray', text: '全部' },
  pending: { 
    color: 'orange', 
    text: '待接单', 
    icon: <ClockCircleOutlined />,
    switchHint: '点击开始'
  },
  in_progress: { 
    color: 'blue', 
    text: '进行中', 
    icon: <Spin size="small" />,
    switchHint: '点击完成'
  },
  completed: { 
    color: 'green', 
    text: '已完成', 
    icon: <CheckOutlined />,
    switchHint: '已完成'
  }
};

const roleMap = {
  admin: '超级管理员',
  teacher: '教师',
  student: '学生',
  guest: '访客'
};

const roleColorMap = {
  admin: 'red',
  teacher: 'orange',
  student: 'green',
  guest: 'gray'
};

const mockMyRequirements = [
  {
    id: '1001',
    title: '2024届毕业答辩PPT设计制作',
    type: '设计',
    description: '需要制作一套毕业答辩PPT，主题为"基于React的校园需求对接平台设计与实现"，要求风格简洁专业，包含封面、目录、需求分析、系统设计、功能演示、总结等模块。',
    status: 'pending',
    publishTime: '2024-05-10T09:30:00',
    deadline: '2024-05-20T23:59:00',
    budget: '500元',
    urgency: 'high',
    applicants: [
      {
        id: 'u2001',
        name: '张三',
        role: 'student',
        avatar: 'https://picsum.photos/200/200?random=10',
        applyTime: '2024-05-11T14:20:00',
        introduction: '视觉传达专业大三学生，有多次PPT设计经验，曾为3位学长设计毕业答辩PPT，可提供过往作品参考。',
        portfolio: 'https://example.com/portfolio/zhangsan',
        isSelected: true
      },
      {
        id: 'u2002',
        name: '李四',
        role: 'student',
        avatar: 'https://picsum.photos/200/200?random=11',
        applyTime: '2024-05-12T10:15:00',
        introduction: '计算机科学专业学生，熟悉学术PPT制作规范，可结合技术内容优化展示效果，保证逻辑清晰。',
        isSelected: true
      }
    ]
  },
  {
    id: '1002',
    title: '机器学习课程作业辅导',
    type: '教育',
    description: '辅导机器学习基础作业，主要涉及线性回归、逻辑回归、决策树等算法的实现与应用，需要讲解理论并指导代码编写（Python）。',
    status: 'in_progress',
    publishTime: '2024-05-05T16:40:00',
    deadline: '2024-05-15T20:00:00',
    budget: '300元',
    urgency: 'normal',
    applicants: [
      {
        id: 'u2003',
        name: '王五',
        role: 'teacher',
        avatar: 'https://picsum.photos/200/200?random=12',
        applyTime: '2024-05-05T17:00:00',
        introduction: '计算机学院讲师，主讲机器学习课程5年，可提供针对性辅导。',
        isSelected: true
      },
      {
        id: 'u2004',
        name: '赵六',
        role: 'student',
        avatar: 'https://picsum.photos/200/200?random=13',
        applyTime: '2024-05-06T09:30:00',
        introduction: '机器学习方向研究生，有丰富的作业辅导经验，可提供详细解题步骤。'
      }
    ]
  },
  {
    id: '1003',
    title: '校园活动摄影服务',
    type: '服务',
    description: '6月1日校园文化节活动摄影，需要拍摄活动全程（8:00-18:00），提供精修照片30张以上，需自带设备。',
    status: 'completed',
    publishTime: '2024-04-20T11:20:00',
    deadline: '2024-05-25T23:59:00',
    budget: '800元',
    urgency: 'normal',
    applicants: [
      {
        id: 'u2005',
        name: '孙七',
        role: 'student',
        avatar: 'https://picsum.photos/200/200?random=14',
        applyTime: '2024-04-20T14:30:00',
        introduction: '摄影协会成员，有2年活动摄影经验，设备齐全（佳能5D4+红圈镜头），可提供过往活动作品集。',
        isSelected: true
      }
    ]
  }
];

const MyRequirementsPage = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantModal, setApplicantModal] = useState({
    visible: false,
    currentRequirement: null,
    currentApplicants: []
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchMyRequirements = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setRequirements(mockMyRequirements);
          setFilteredRequirements(mockMyRequirements);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('加载我的需求失败:', error);
        message.error('网络错误，获取我的需求失败');
        setLoading(false);
      }
    };

    fetchMyRequirements();
  }, []);

  useEffect(() => {
    let result = [...requirements];
    
    if (selectedStatus !== 'all') {
      result = result.filter(req => req.status === selectedStatus);
    }
    
    if (searchText) {
      const text = searchText.toLowerCase();
      result = result.filter(req => 
        req.title.toLowerCase().includes(text) || 
        req.description.toLowerCase().includes(text) ||
        req.type.toLowerCase().includes(text)
      );
    }
    
    setFilteredRequirements(result);
  }, [searchText, selectedStatus, requirements]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handleOpenApplicants = (requirement) => {
    setApplicantModal({
      visible: true,
      currentRequirement: requirement,
      currentApplicants: requirement.applicants || []
    });
  };

  const handleCloseApplicants = () => {
    setApplicantModal({
      visible: false,
      currentRequirement: null,
      currentApplicants: []
    });
  };

  const handleApproveApplicant = async (requirementId, applicantId) => {
    if (window.confirm('确定选择该申请人承接此需求吗？')) {
      try {
        setActionLoading(true);
        const updatedRequirements = requirements.map(req => {
          if (req.id === requirementId) {
            const updatedApplicants = req.applicants.map(app => 
              app.id === applicantId 
                ? { ...app, isSelected: true } 
                : app
            );
            return {
              ...req,
              applicants: updatedApplicants
            };
          }
          return req;
        });
        
        setRequirements(updatedRequirements);
        setApplicantModal(prev => ({
          ...prev,
          currentApplicants: prev.currentApplicants.map(app => 
            app.id === applicantId ? { ...app, isSelected: true } : app
          )
        }));
        message.success('已成功选择申请人承接需求');
      } catch (error) {
        console.error('同意申请人失败:', error);
        message.error('网络错误，操作失败');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRejectApplicant = async (requirementId, applicantId) => {
    if (window.confirm('确定取消该申请人的接单资格吗？')) {
      try {
        setActionLoading(true);
        const updatedRequirements = requirements.map(req => {
          if (req.id === requirementId) {
            const updatedApplicants = req.applicants.map(app => 
              app.id === applicantId 
                ? { ...app, isSelected: false } 
                : app
            );
            return { ...req, applicants: updatedApplicants };
          }
          return req;
        });
        
        setRequirements(updatedRequirements);
        setApplicantModal(prev => ({
          ...prev,
          currentApplicants: prev.currentApplicants.map(app => 
            app.id === applicantId ? { ...app, isSelected: false } : app
          )
        }));
        message.success('已取消该申请人的接单资格');
      } catch (error) {
        console.error('取消申请人失败:', error);
        message.error('网络错误，操作失败');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteRequirement = async (requirementId) => {
    try {
      setActionLoading(true);
      const updatedRequirements = requirements.filter(req => req.id !== requirementId);
      setRequirements(updatedRequirements);
      message.success('需求已删除');
    } catch (error) {
      console.error('删除需求失败:', error);
      message.error('网络错误，删除失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/requirements/${id}`);
  };

  const handleContactApplicant = (userId, userName) => {
    navigate(`/messages?toUserId=${userId}&toUserName=${encodeURIComponent(userName)}`);
    handleCloseApplicants();
  };

  const handleStatusSelect = (newStatus, requirement) => {
    if (requirement.status === newStatus) return;

    const confirmMessage = `确定将需求状态从【${statusMap[requirement.status].text}】修改为【${statusMap[newStatus].text}】吗？`;
    
    if (window.confirm(confirmMessage)) {
      const updatedRequirements = requirements.map(req => 
        req.id === requirement.id ? { ...req, status: newStatus } : req
      );
      setRequirements(updatedRequirements);
      message.success(`需求已更新为${statusMap[newStatus].text}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navbar />
      <Content style={{ padding: '24px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '60%' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>我的需求</h2>
              
              <Search
                placeholder="搜索需求标题或描述"
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
              />
              
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={handleStatusChange}
                value={selectedStatus}
              >
                <Option value="all">全部状态</Option>
                <Option value="pending">待接单</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
              </Select>
            </div>
          </div>

          {loading ? (
            <Card style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spin size="large" tip="正在加载我的需求..." />
            </Card>
          ) : filteredRequirements.length === 0 ? (
            <Card style={{ padding: '80px 0', textAlign: 'center' }}>
              <Empty 
                description="暂无符合条件的需求" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/publish-requirement')}>
                  发布新需求
                </Button>
              </Empty>
            </Card>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={filteredRequirements}
              renderItem={(requirement) => (
                <Card 
                  key={requirement.id}
                  style={{ marginBottom: 16, borderRadius: 4 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <Tag 
                          color={statusMap[requirement.status].color}
                          icon={statusMap[requirement.status].icon}
                        >
                          {statusMap[requirement.status].text}
                        </Tag>
                        {requirement.urgency === 'high' && (
                          <Tag color="red" style={{ marginLeft: 8 }}>紧急</Tag>
                        )}
                      </div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                        {requirement.title}
                        <Tag style={{ marginLeft: 8, fontSize: 12 }}>{requirement.type}</Tag>
                      </h3>
                    </div>

                    <Space>
                      <Select
                        value={requirement.status}
                        style={{ width: 130 }}
                        onChange={(value) => handleStatusSelect(value, requirement)}
                      >
                        <Option value="pending">待接单</Option>
                        <Option value="in_progress">进行中</Option>
                        <Option value="completed">已完成</Option>
                      </Select>
                      
                      <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewDetail(requirement.id)}
                        size="small"
                      >
                        详情
                      </Button>
                      
                      <Popconfirm
                        title="确定删除该需求吗？"
                        description="删除后不可恢复，是否继续？"
                        onConfirm={() => handleDeleteRequirement(requirement.id)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button 
                          danger 
                          icon={<DeleteOutlined />} 
                          size="small"
                          loading={actionLoading}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>

                  <div style={{ marginBottom: 16, color: '#555', lineHeight: 1.6 }}>
                    {requirement.description.length > 150 
                      ? `${requirement.description.substring(0, 150)}...` 
                      : requirement.description}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: 13 }}>
                      <DollarOutlined style={{ marginRight: 4, fontSize: 14 }} />
                      {requirement.budget}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: 13 }}>
                      <ClockCircleOutlined style={{ marginRight: 4, fontSize: 14 }} />
                      截止: {new Date(requirement.deadline).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: 13 }}>
                      <UserOutlined style={{ marginRight: 4, fontSize: 14 }} />
                      发布: {new Date(requirement.publishTime).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button 
                      type="primary" 
                      onClick={() => handleOpenApplicants(requirement)}
                      size="small"
                    >
                      申请人
                    </Button>

                    {requirement.status !== 'pending' && (
                      <div>
                        <Button 
                          icon={<MessageOutlined />} 
                          onClick={() => {
                            const firstSelected = requirement.applicants.find(app => app.isSelected);
                            if (firstSelected) {
                              handleContactApplicant(firstSelected.id, firstSelected.name);
                            }
                          }}
                          size="small"
                          disabled={!requirement.applicants?.some(app => app.isSelected)}
                        >
                          联系承接人
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            />
          )}

          <Modal
            title={`《${applicantModal.currentRequirement?.title}》的申请人`}
            open={applicantModal.visible}
            onCancel={handleCloseApplicants}
            footer={[
              <Button key="close" onClick={handleCloseApplicants}>
                关闭
              </Button>
            ]}
            width={600}
            destroyOnClose
          >
            {applicantModal.currentApplicants.length === 0 ? (
              <Empty description="暂无申请人" />
            ) : (
              <List
                dataSource={applicantModal.currentApplicants}
                renderItem={(applicant) => (
                  <Card 
                    key={applicant.id}
                    style={{ marginBottom: 12 }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div style={{ display: 'flex', marginBottom: 12 }}>
                      <Avatar 
                        src={applicant.avatar} 
                        size="large"
                        style={{ marginRight: 12 }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: 15 }}>{applicant.name}</h4>
                          <Tag 
                            color={roleColorMap[applicant.role]} 
                            style={{ marginLeft: 8 }}
                            size="small"
                          >
                            {roleMap[applicant.role]}
                          </Tag>
                          {applicant.isSelected && (
                            <Tag color="green" style={{ marginLeft: 8 }} size="small">
                              已接单
                            </Tag>
                          )}
                        </div>
                        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                          申请时间: {new Date(applicant.applyTime).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <h5 style={{ margin: 0, marginBottom: 6, fontSize: 13, color: '#666' }}>申请说明:</h5>
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: '#333' }}>
                        {applicant.introduction}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <Button 
                        icon={<MessageOutlined />} 
                        onClick={() => handleContactApplicant(applicant.id, applicant.name)}
                        size="small"
                      >
                        联系
                      </Button>
                      
                      {applicantModal.currentRequirement?.status !== 'completed' && (
                        <>
                          <Button 
                            danger 
                            icon={<CloseOutlined />} 
                            onClick={() => handleRejectApplicant(
                              applicantModal.currentRequirement.id, 
                              applicant.id
                            )}
                            size="small"
                            loading={actionLoading}
                            disabled={!applicant.isSelected}
                          >
                            取消接单
                          </Button>
                          <Button 
                            type="primary" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleApproveApplicant(
                              applicantModal.currentRequirement.id, 
                              applicant.id
                            )}
                            size="small"
                            loading={actionLoading}
                            disabled={applicant.isSelected}
                          >
                            同意接单
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                )}
              />
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MyRequirementsPage;
