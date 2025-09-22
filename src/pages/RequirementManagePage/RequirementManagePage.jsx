import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Tag, Avatar, Button, Input, Select, Pagination, 
  Layout, Spin, message, Modal, Space, Typography,
  Card, Popconfirm, Empty, Checkbox
} from 'antd';
import { 
  SearchOutlined, DollarOutlined, UserOutlined, 
  DeleteOutlined, EyeOutlined, ClockCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { adminApi, authApi } from '../../service/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { Title, Text } = Typography;
const { Content } = Layout;

const STATUS_CONFIG = {
  0: { text: '审核中', color: 'purple' },
  1: { text: '待接单', color: 'orange' },
  2: { text: '进行中', color: 'blue' },
  3: { text: '已完成', color: 'green' },
  4: { text: '已驳回', color: 'red' },
};

const STATUS_OPTIONS = [
  { value: 0, label: '审核中' },
  { value: 1, label: '待接单' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已驳回' },
];

const ROLE_CONFIG = {
  admin: { text: '超级管理员', color: 'red' },
  teacher: { text: '教师', color: 'orange' },
  student: { text: '学生', color: 'green' },
  visitor: { text: '访客', color: 'gray' },
};

const RequirementManagePage = () => {
  const [requirements, setRequirements] = useState([]);
  const [allRequirements, setAllRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentDetail, setCurrentDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  const navigate = useNavigate();

  const verifyAdminPermission = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    
    const user = JSON.parse(userInfo);
    if (user.userRole !== 'admin') {
      message.error('无管理员权限，无法访问此页面');
      navigate('/');
      return false;
    }
    return true;
  };

  const fetchUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  };

  const fetchRequirements = useCallback(async () => {
    if (!verifyAdminPermission()) return;
    
    try {
      setLoading(true);
      const params = {
        current: 1,
        pageSize: 10000
      };

      const response = await authApi.getRequirement(params);

      if (response.code === 0) {
        const { records } = response.data;
        const formattedData = records.map(item => ({
          id: item.requirementId?.toString() || item.id?.toString(),
          title: item.title || '无标题',
          type: item.requireType || item.requirementType || item.type || '未知类型',
          description: item.description || '无描述',
          status: item.status || 0,
          publishTime: item.publishTime || new Date().toISOString(),
          publisher: {
            id: item.publisher?.id?.toString() || 'unknown',
            name: item.publisher?.name || item.publisher?.username || '未知用户',
            role: item.publisher?.role || '',
            avatar: item.publisher?.avatar || ''
          },
          applicants: item.applicants || 0,
          budget: item.budget === 0 ? '无偿' : (item.budget || '面议')
        }));
        
        setAllRequirements(formattedData);
        applyFilters(formattedData);
        setPagination(prev => ({ ...prev, total: formattedData.length }));
      } else {
        setAllRequirements([]);
        setRequirements([]);
        message.warning('未获取到需求数据');
      }
    } catch (error) {
      console.error('获取需求列表失败:', error);
      message.error('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const applyFilters = useCallback((data = allRequirements) => {
    let filteredData = [...data];
    
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.publisher.name.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(item => item.status.toString() === statusFilter);
    }

    const total = filteredData.length;
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setRequirements(paginatedData);
    setPagination(prev => ({ ...prev, total }));
  }, [searchKeyword, statusFilter, pagination.current, pagination.pageSize, allRequirements]);

  useEffect(() => {
    fetchUserInfo();
    fetchRequirements();
  }, [fetchRequirements]);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, statusFilter, pagination.current, pagination.pageSize, applyFilters]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selectAllCheckboxProps: {
      disabled: loading,
    },
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = requirements.map(item => item.id);
      setSelectedRowKeys(allIds);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const renderStatusTag = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[0];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setOperationLoading(prev => ({ ...prev, [id]: true }));
      
      const updateData = {
        id: id,
        status: newStatus
      };

      const response = await authApi.updateRequirement(updateData);

      if (response.code === 0) {
        const updatedData = allRequirements.map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        );
        setAllRequirements(updatedData);
        applyFilters(updatedData);
        
        const statusText = STATUS_CONFIG[newStatus]?.text || '未知状态';
        message.success(`需求已更新为${statusText}`);
      } else {
        message.error(`操作失败: ${response.msg || '系统错误'}`);
      }
    } catch (error) {
      console.error('更新需求状态失败:', error);
      message.error('操作失败，请稍后重试');
    } finally {
      setOperationLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChangeAction = (record) => {
    confirm({
      title: '修改需求状态',
      content: `确定要将需求状态从【${STATUS_CONFIG[record.status].text}】修改为【${STATUS_CONFIG[record.newStatus].text}】吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        handleStatusUpdate(record.id, record.newStatus);
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      setOperationLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await authApi.deleteRequirements(id);
      if (response.code === 0) {
        const updatedData = allRequirements.filter(item => item.id !== id);
        setAllRequirements(updatedData);
        applyFilters(updatedData);
        setSelectedRowKeys(selectedRowKeys.filter(key => key !== id));
        message.success('需求删除成功');
      } else {
        message.error(`删除失败: ${response.msg || '系统错误'}`);
      }
    } catch (error) {
      console.error('删除需求失败:', error);
      message.error('删除失败，请稍后重试');
    } finally {
      setOperationLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择需要删除的需求');
      return;
    }

    confirm({
      title: `确定要删除选中的${selectedRowKeys.length}条需求吗？`,
      content: '删除后数据将无法恢复，请谨慎操作',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setBatchActionLoading(true);
          
          const response = await adminApi.batchOperateRequirement({
            ids: selectedRowKeys.map(id => Number(id)),
            operationType: 'delete'
          });

          if (response.code === 0) {
            const updatedData = allRequirements.filter(item => !selectedRowKeys.includes(item.id));
            setAllRequirements(updatedData);
            applyFilters(updatedData);
            message.success(`成功删除${response.data}条需求`);
            setSelectedRowKeys([]);
          } else {
            message.error(`删除失败: ${response.msg || '系统错误'}`);
          }
        } catch (error) {
          console.error('批量删除失败详情:', error);
          message.error('批量删除失败，请稍后重试');
        } finally {
          setBatchActionLoading(false);
        }
      }
    });
  };

  const handleBatchStatusChange = (newStatus) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择需要修改的需求');
      return;
    }

    const statusText = STATUS_CONFIG[newStatus]?.text || '未知状态';
    
    confirm({
      title: `批量修改状态`,
      content: `确定要将选中的${selectedRowKeys.length}条需求状态修改为【${statusText}】吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setBatchActionLoading(true);
          
          const response = await adminApi.batchOperateRequirement({
            ids: selectedRowKeys.map(id => Number(id)),
            operationType: 'updateStatus',
            status: newStatus
          });

          if (response.code === 0) {
            const updatedData = allRequirements.map(item => 
              selectedRowKeys.includes(item.id) ? { ...item, status: newStatus } : item
            );
            setAllRequirements(updatedData);
            applyFilters(updatedData);
            message.success(`成功将${response.data}条需求改为【${statusText}】`);
            setSelectedRowKeys([]);
          } else {
            message.error(`操作失败: ${response.msg || '系统错误'}`);
          }
        } catch (error) {
          console.error('批量修改状态失败详情:', error);
          message.error('批量操作失败，请稍后重试');
        } finally {
          setBatchActionLoading(false);
        }
      }
    });
  };

  const handleViewDetail = (item) => {
    setCurrentDetail(item);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setCurrentDetail(null);
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
    setSelectedRowKeys([]);
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedRowKeys([]);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedRowKeys([]);
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedRowKeys([]);
  };

  const renderDetailModal = () => {
    if (!currentDetail) return null;
    
    const { 
      title, type, description, status, publishTime, 
      publisher, applicants, budget
    } = currentDetail;
    
    return (
      <Modal
        title="需求详情"
        open={showDetail}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            关闭
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ marginBottom: 8 }}>{title}</Title>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {renderStatusTag(status)}
            <Tag>{type}</Tag>
            <Tag icon={<DollarOutlined />}>{budget}</Tag>
            {applicants > 0 && (
              <Tag icon={<UserOutlined />}>{applicants}人申请</Tag>
            )}
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>发布信息：</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Avatar
              src={publisher.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`}
              alt={publisher.name}
            />
            <div>
              <div>
                <Text strong>{publisher.name}</Text>
                <Tag 
                  color={ROLE_CONFIG[publisher.role]?.color || 'gray'} 
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  {ROLE_CONFIG[publisher.role]?.text || '未知角色'}
                </Tag>
              </div>
              <div style={{ marginTop: 4, color: '#666' }}>
                <ClockCircleOutlined style={{ fontSize: 12, marginRight: 4 }} />
                发布时间：{moment(publishTime).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Text strong>需求描述：</Text>
          <div style={{ marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {description || '无描述内容'}
          </div>
        </div>
      </Modal>
    );
  };

  const renderBatchLoadingModal = () => (
    <Modal
      title="批量操作进行中"
      visible={batchActionLoading}
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>正在处理，请稍候...</p>
      </div>
    </Modal>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: "24px 20px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", width: '100%' }}>
          <Title level={2}>需求管理</Title>
          
          <Card>
            <div style={{ 
              marginBottom: 16, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Search
                  placeholder="搜索需求标题/描述/发布者"
                  allowClear
                  enterButton={<SearchOutlined />}
                  style={{ width: 320 }}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onSearch={handleSearch}
                />
                
                <Select
                  defaultValue="all"
                  style={{ width: 180 }}
                  onChange={handleStatusChange}
                  value={statusFilter}
                  placeholder="筛选状态"
                >
                  <Option value="all">全部状态</Option>
                  {STATUS_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value.toString()}>
                      {option.label}
                    </Option>
                  ))}
                </Select>

                <Button 
                  type="text" 
                  icon={<FilterOutlined />}
                  onClick={handleClearFilters}
                >
                  清除筛选
                </Button>
              </div>
              
              <Space>
                <Select
                  placeholder="批量修改状态"
                  style={{ width: 180 }}
                  onSelect={handleBatchStatusChange}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {STATUS_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                  disabled={selectedRowKeys.length === 0 || batchActionLoading}
                  loading={batchActionLoading}
                >
                  批量删除
                </Button>
              </Space>
            </div>
            
            {selectedRowKeys.length > 0 && (
              <div style={{
                marginBottom: 16,
                padding: '8px 16px',
                background: '#f0f2f5',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <Checkbox
                    indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < requirements.length}
                    checked={requirements.length > 0 && selectedRowKeys.length === requirements.length}
                    onChange={handleSelectAll}
                    style={{ marginRight: 8 }}
                  >
                    已选择 {selectedRowKeys.length} 条需求
                  </Checkbox>
                </div>
                <Button 
                  type="text" 
                  onClick={() => setSelectedRowKeys([])}
                >
                  取消选择
                </Button>
              </div>
            )}
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Spin size="large" />
              </div>
            ) : requirements.length > 0 ? (
              <Table
                rowSelection={{
                  type: "checkbox",
                  ...rowSelection,
                }}
                dataSource={requirements}
                pagination={false}
                bordered
                scroll={{ x: 'max-content' }}
                style={{ width: '100%' }}
                rowKey="id"
              >
                <Table.Column 
                  title="序号" 
                  key="index"
                  width={80}
                  render={(text, record, index) => (
                    <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
                  )}
                />
                <Table.Column 
                  title="需求标题" 
                  dataIndex="title" 
                  key="title"
                  width={250}
                  render={(text, record) => (
                    <a onClick={() => handleViewDetail(record)} style={{ color: '#1890ff' }}>
                      {text}
                    </a>
                  )}
                />
                <Table.Column 
                  title="需求类型" 
                  dataIndex="type" 
                  key="type"
                  width={120}
                  render={(text) => <Tag>{text}</Tag>}
                />
                <Table.Column 
                  title="发布者" 
                  key="publisher"
                  width={200}
                  render={(text, record) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar
                        src={record.publisher.avatar || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`}
                        alt={record.publisher.name}
                        size="small"
                      />
                      <div>
                        <div>{record.publisher.name}</div>
                        <Tag 
                          color={ROLE_CONFIG[record.publisher.role]?.color || 'gray'} 
                          size="small"
                        >
                          {ROLE_CONFIG[record.publisher.role]?.text || '未知'}
                        </Tag>
                      </div>
                    </div>
                  )}
                />
                <Table.Column 
                  title="预算" 
                  dataIndex="budget" 
                  key="budget"
                  width={100}
                  render={(text) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarOutlined style={{ fontSize: 13 }} />
                      <span>{text}</span>
                    </div>
                  )}
                />
                <Table.Column 
                  title="当前状态" 
                  dataIndex="status" 
                  key="status"
                  width={120}
                  render={(status) => renderStatusTag(status)}
                />
                <Table.Column 
                  title="修改状态" 
                  key="changeStatus"
                  width={180}
                  render={(text, record) => (
                    <Select
                      value={record.status}
                      style={{ width: '100%' }}
                      onChange={(newStatus) => handleStatusChangeAction({
                        ...record,
                        newStatus
                      })}
                      disabled={operationLoading[record.id] || batchActionLoading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <Option 
                          key={option.value} 
                          value={option.value}
                          disabled={record.status === option.value}
                        >
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                <Table.Column 
                  title="发布时间" 
                  dataIndex="publishTime" 
                  key="publishTime"
                  width={160}
                  render={(time) => moment(time).format("YYYY-MM-DD HH:mm")}
                />
                <Table.Column 
                  title="操作" 
                  key="action"
                  width={180}
                  render={(text, record) => (
                    <Space size="small">
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDetail(record)}
                        disabled={batchActionLoading}
                      >
                        查看详情
                      </Button>
                      
                      <Popconfirm
                        title="确定要删除这条需求吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          loading={operationLoading[record.id] || batchActionLoading}
                          disabled={batchActionLoading}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                />
              </Table>
            ) : (
              <Empty description="没有找到匹配的需求" />
            )}
            
            {requirements.length > 0 && (
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条需求`}
                  onShowSizeChange={(current, size) => {
                    setPagination(prev => ({ ...prev, pageSize: size, current: 1 }));
                  }}
                />
              </div>
            )}
          </Card>
          
          {renderDetailModal()}
          {renderBatchLoadingModal()}
        </div>
      </Content>
    </Layout>
  );
};

export default RequirementManagePage;
    