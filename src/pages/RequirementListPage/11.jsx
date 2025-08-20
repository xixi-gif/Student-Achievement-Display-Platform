import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Tag, Avatar, Button, Space, Input, Select, Pagination, Layout, Spin, message } from 'antd';
import { SearchOutlined, MessageOutlined, DollarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';

const { Search } = Input;
const { Option } = Select;

const RequirementListPage = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ 
    sortField: '', 
    sortOrder: '' 
  });
  const navigate = useNavigate();

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        status: 1, // 固定传递status=0给后端
        keyword: searchKeyword || undefined
      };

      const response = await authApi.getRequirement(params);
      const { records, total } = response.data.data;
      setRequirements(records || []);
      setPagination(prev => ({ ...prev, total: total || 0 }));

      // 空数据友好提示
      if (total === 0) {
        message.info('当前条件下暂无需求数据');
      }
    } catch (error) {
      const errorMsg = error.response 
        ? (error.response.data?.message || '接口请求失败') 
        : '网络连接异常，请稍后重试';
      message.error('获取需求列表失败：' + errorMsg);
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [pagination.current, pagination.pageSize, filters, searchKeyword]);

  // 状态标签渲染：根据后端返回的status值展示文本（此处假设0对应"默认状态"，可根据实际调整）
  const getStatusTag = (statusValue) => {
    // 可根据后端实际status=0的含义调整文本（例：0代表"待处理"）
    const statusMap = {
      0: { label: '待处理', color: 'orange' },
      // 若后端可能返回其他状态，可补充映射
      1: { label: '进行中', color: 'blue' },
      2: { label: '已完成', color: 'green' }
    };
    const statusConf = statusMap[statusValue] || { label: '未知状态', color: 'gray' };
    return <Tag color={statusConf.color}>{statusConf.label}</Tag>;
  };

  const handleDetail = (id) => {
    navigate(`/requirements/${id}`);
  };

  const handleTableChange = (newCurrent, newPageSize) => {
    setPagination(prev => ({ 
      ...prev, 
      current: newCurrent, 
      pageSize: newPageSize || prev.pageSize 
    }));
  };

  const handleSortChange = (value) => {
    if (!value) {
      setFilters(prev => ({ ...prev, sortField: '', sortOrder: '' }));
      return;
    }
    const [sortField, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortField, sortOrder }));
  };

  const handleSearch = (value) => {
    setSearchKeyword(value.trim());
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '24px', background: '#f7f8fa' }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search 
              placeholder="搜索需求标题或描述" 
              allowClear 
              enterButton={<SearchOutlined />} 
              style={{ width: 300 }} 
              onSearch={handleSearch} 
              defaultValue={searchKeyword} 
            />
            {/* 移除状态筛选下拉框（因status固定传0，无需用户选择） */}
            <Select 
              placeholder="排序方式" 
              style={{ width: 160 }} 
              onChange={handleSortChange}
            >
              <Option value="requirement_id-desc">发布时间（最新）</Option>
              <Option value="requirement_id-asc">发布时间（最早）</Option>
              <Option value="applicants-desc">申请人数（最多）</Option>
            </Select>
          </Space>
        </div>
        <Spin spinning={loading}>
          <List 
            itemLayout="vertical" 
            size="large" 
            dataSource={requirements} 
            renderItem={(item) => (
              <List.Item 
                key={item.requirementId} 
                extra={
                  <Space direction="vertical" align="end">
                    <div>{getStatusTag(item.status)}</div>
                    <div>
                      <Tag icon={<ClockCircleOutlined />}>
                        {item.publishTime 
                          ? new Date(item.publishTime).toLocaleString() 
                          : '未知时间'
                        }
                      </Tag>
                    </div>
                  </Space>
                }
              >
                <List.Item.Meta 
                  avatar={
                    <Avatar 
                      src={`https://randomuser.me/api/portraits/${
                        item.publisher?.role === 'student' 
                          ? 'men' 
                          : 'women'
                      }/${Math.floor(Math.random() * 10)}.jpg`} 
                    />
                  }
                  title={<a onClick={() => handleDetail(item.requirementId)}>
                    {item.title || '无标题'}
                  </a>}
                  description={
                    <Space>
                      <span>发布者: {item.publisher?.name || '未知用户'}</span>
                      <Tag 
                        color={item.publisher?.role === 'student' 
                          ? 'green' 
                          : 'orange'
                        }
                      >
                        {item.publisher?.role === 'student' 
                          ? '学生' 
                          : '教师'
                        }
                      </Tag>
                    </Space>
                  }
                />
                <div style={{ margin: '12px 0' }}>
                  {item.description 
                    ? (item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description
                    ) 
                    : '无描述'
                  }
                </div>
                <Space>
                  <Tag icon={<DollarOutlined />}>
                    {item.budget || '无预算'}
                  </Tag>
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
                    disabled={!item.publisher?.id}
                  >
                    联系发布者
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => handleDetail(item.requirementId)} 
                    style={{ marginLeft: 8 }}
                  >
                    查看详情
                  </Button>
                </div>
              </List.Item>
            )} 
            locale={{ emptyText: '暂无需求数据' }} 
          />
        </Spin>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination 
            current={pagination.current} 
            pageSize={pagination.pageSize} 
            total={pagination.total} 
            showSizeChanger 
            showQuickJumper 
            showTotal={total => `共 ${total} 条需求`} 
            onChange={(page, pageSize) => handleTableChange(page, pageSize)} 
            onShowSizeChange={(current, pageSize) => handleTableChange(current, pageSize)} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default RequirementListPage;