import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Card, List, Avatar, Tag, Button, Space, 
  Modal, Spin, message, Empty, Input, Select,
  Popconfirm, Pagination
} from 'antd';
import { 
  ClockCircleOutlined, DollarOutlined, UserOutlined, 
  CheckOutlined, CloseOutlined, EyeOutlined, 
  DeleteOutlined, MessageOutlined, SearchOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const statusNumMap = {
  1: 'pending',
  2: 'in_progress',
  3: 'completed'
};

const statusTextMap = {
  pending: 1,
  in_progress: 2,
  completed: 3
};

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

const MyRequirementsPage = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantModal, setApplicantModal] = useState({
    visible: false,
    currentRequirement: null,
    currentApplicants: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 5,
      total: 0
    }
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0
  });

  useEffect(() => {
    const fetchMyRequirements = async () => {
      try {
        setLoading(true);
        const params = {
          current: pagination.current - 1,
          size: pagination.size,
          status: selectedStatus === 'all' ? undefined : statusTextMap[selectedStatus],
          keyword: searchText || undefined
        };
        const response = await authApi.getMyRequirements(params);
        
        if (response.code !== 0) {
          throw new Error(response.message || '获取需求失败');
        }
        
        const { records, total, current, size } = response.data;
        const formattedRequirements = records.map(item => ({
          id: item.requirementId.toString(),
          title: item.requirementTitle,
          type: item.requireType,
          description: item.description,
          status: statusNumMap[item.status],
          publishTime: item.publishTime,
          deadline: item.deadline,
          budget: `${item.budget}元`,
          urgency: item.urgency,
          requirementId: item.requirementId
        }));
        
        setRequirements(formattedRequirements);
        setFilteredRequirements(formattedRequirements);
        setPagination(prev => ({
          ...prev,
          total,
          current: current + 1,
          size
        }));
      } catch (error) {
        console.error('加载我的需求失败:', error);
        message.error(error.message || '网络错误，获取我的需求失败');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequirements();
  }, [pagination.current, pagination.size, searchText, selectedStatus]);

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
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePaginationChange = (current, size) => {
    setPagination(prev => ({ ...prev, current, size }));
  };

  // 修改点：将GET请求改为POST请求，通过请求体传递参数
  const fetchApplicants = async (requirementId, current, pageSize) => {
    try {
      setApplicantModal(prev => ({ ...prev, loading: true }));
      const requestData = {
        current: current - 1,
        pageSize,
        requirementId
      };
      // 使用POST方法而不是GET方法
      const response = await authApi.getApplicationList(requestData);
      
      if (response.code !== 0) {
        throw new Error(response.message || '获取申请人失败');
      }
      
      const { records, total } = response.data;
      const formattedApplicants = records.map(item => ({
        id: item.applicantsId?.toString() || item.id?.toString(),
        name: item.userName,
        role: item.userRole,
        avatar: item.userAvatar,
        applyTime: item.applyTime,
        introduction: item.introduction,
        isSelected: item.status === 1
      }));
      
      setApplicantModal(prev => ({
        ...prev,
        currentApplicants: formattedApplicants,
        pagination: {
          ...prev.pagination,
          total,
          current
        },
        loading: false
      }));
    } catch (error) {
      console.error('获取申请人列表失败:', error);
      message.error(error.message || '获取申请人信息失败');
      setApplicantModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenApplicants = async (requirement) => {
    setApplicantModal(prev => ({
      ...prev,
      visible: true,
      currentRequirement: requirement
    }));
    await fetchApplicants(requirement.requirementId, 1, 5);
  };

  const handleApplicantPaginationChange = async (current, pageSize) => {
    const { currentRequirement } = applicantModal;
    if (currentRequirement) {
      await fetchApplicants(currentRequirement.requirementId, current, pageSize);
    }
  };

  const handleCloseApplicants = () => {
    setApplicantModal({
      visible: false,
      currentRequirement: null,
      currentApplicants: [],
      loading: false,
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0
      }
    });
  };

  const handleApproveApplicant = async (requirementId, applicantId) => {
    if (!window.confirm('确定选择该申请人承接此需求吗？')) return;
    try {
      setActionLoading(true);
      const data = {
        applicantsId: parseInt(applicantId),
        requirementId: parseInt(requirementId),
        status: 1
      };
      const response = await authApi.agreeApplication(data);
      
      if (response.code !== 0) {
        throw new Error(response.message || '同意申请失败');
      }
      
      await fetchApplicants(requirementId, applicantModal.pagination.current, applicantModal.pagination.pageSize);
      message.success('已成功选择申请人承接需求');
    } catch (error) {
      console.error('同意申请人失败:', error);
      message.error(error.message || '网络错误，操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplicant = async (requirementId, applicantId) => {
    if (!window.confirm('确定取消该申请人的接单资格吗？')) return;
    try {
      setActionLoading(true);
      const data = {
        applicantsId: parseInt(applicantId),
        requirementId: parseInt(requirementId),
        status: 0
      };
      const response = await authApi.agreeApplication(data);
      
      if (response.code !== 0) {
        throw new Error(response.message || '拒绝申请失败');
      }
      
      await fetchApplicants(requirementId, applicantModal.pagination.current, applicantModal.pagination.pageSize);
      message.success('已取消该申请人的接单资格');
    } catch (error) {
      console.error('取消申请人失败:', error);
      message.error(error.message || '网络错误，操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequirement = async (requirementId) => {
    try {
      setActionLoading(true);
      const response = await authApi.deleteRequirements(requirementId);
      if (response.code !== 0) {
        throw new Error(response.message || '删除失败');
      }
      const updatedRequirements = requirements.filter(req => req.id !== requirementId);
      setRequirements(updatedRequirements);
      message.success('需求已删除');
    } catch (error) {
      console.error('删除需求失败:', error);
      message.error(error.message || '网络错误，删除失败');
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

  const handleStatusSelect = async (newStatus, requirement) => {
    if (requirement.status === newStatus) return;
    if (!window.confirm(`确定将需求状态从【${statusMap[requirement.status].text}】修改为【${statusMap[newStatus].text}】吗？`)) return;
    
    try {
      setActionLoading(true);
      const updatedRequirements = requirements.map(req => 
        req.id === requirement.id ? { ...req, status: newStatus } : req
      );
      setRequirements(updatedRequirements);
      message.success(`需求已更新为${statusMap[newStatus].text}`);
    } catch (error) {
      console.error('更新状态失败:', error);
      message.error(error.message || '网络错误，状态更新失败');
    } finally {
      setActionLoading(false);
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
            <>
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
                              const firstSelected = requirement.applicants?.find(app => app.isSelected);
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
              
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.size}
                  total={pagination.total}
                  onChange={handlePaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条`}
                />
              </div>
            </>
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
            {applicantModal.loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin tip="正在加载申请人列表..." />
              </div>
            ) : applicantModal.currentApplicants.length === 0 ? (
              <Empty description="暂无申请人" />
            ) : (
              <>
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
                                applicantModal.currentRequirement.requirementId, 
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
                                applicantModal.currentRequirement.requirementId, 
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
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                  <Pagination
                    current={applicantModal.pagination.current}
                    pageSize={applicantModal.pagination.pageSize}
                    total={applicantModal.pagination.total}
                    onChange={handleApplicantPaginationChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条`}
                  />
                </div>
              </>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MyRequirementsPage;

<Route path="/requirements/:id" element={<RequirementDetailPage />} />
详细页