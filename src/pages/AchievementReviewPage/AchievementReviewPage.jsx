import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, message, Tag, Space, Card, Input, Select,  
  Divider, Descriptions, Badge, Tooltip, Layout} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined, 
  SearchOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { achievementApi } from '../../service/api';

const { Search } = Input;
const { Option } = Select;
const { Footer, Content } = Layout;

const AchievementReviewPage = () => {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchText,
        status: filterStatus === 'all' ? null : filterStatus
      };
      
      const res = await achievementApi.getPendingList(queryParams);
      setData(res.records);
      setPagination({
        ...pagination,
        total: res.total
      });
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('user_role') || 'visitor';
    const username = localStorage.getItem('username') || '访客';
    setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });

    fetchData();
  }, [pagination.current, filterStatus, searchText]);

  const handleApprove = async (id) => {
    try {
      await achievementApi.approve(id);
      message.success('审核通过');
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      message.warning('请填写驳回理由');
      return;
    }
    try {
      await achievementApi.reject(selectedItem.id, rejectReason);
      message.success('已驳回该成果');
      setReviewModalVisible(false);
      setRejectReason('');
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const viewDetail = (item) => {
    navigate(`/achievement/detail/${item.id}`);
  };

  const statusTag = (status, reason) => {
    switch(status) {
      case 2:
        return <Tag color="success">已通过</Tag>;
      case 3:
        return (
          <Tooltip title={`驳回原因: ${reason}`}>
            <Tag color="error">已驳回</Tag>
          </Tooltip>
        );
      default:
        return <Tag color="processing">待审核</Tag>;
    }
  };

  const columns = [
    {
      title: '成果标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => viewDetail(record)}>
          {text}
        </a>
      ),
    },
    {
      title: '学生姓名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '成果类型',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category?.name}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => statusTag(status, record.rejectReason),
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 1 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedItem(record);
                  setReviewModalVisible(true);
                }}
              >
                驳回
              </Button>
            </>
          )}
          <Button
            icon={<EyeOutlined />}
            onClick={() => viewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentUser={currentUser}/>
      
      {}
      <Content style={{ 
        padding: '24px', 
        display: 'block',  
        background: '#fff' 
      }}>
        <Card 
          title={
            <Space>
              <span>成果审核</span>
              <Badge 
                count={data.filter(d => d.status === 1).length} 
                style={{ backgroundColor: '#1890ff' }} 
              />
            </Space>
          }
          bordered={false}
          extra={
            <Space>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">全部状态</Option>
                <Option value="1">待审核</Option>
                <Option value="2">已通过</Option>
                <Option value="3">已驳回</Option>
              </Select>
              <Search
                placeholder="搜索成果/学生/关键词"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 250 }}
                onSearch={(value) => {
                  setSearchText(value);
                  setPagination({...pagination, current: 1});
                }}
              />
            </Space>
          }
        >
          <Table
            columns={columns}
            rowKey="id"
            dataSource={data}
            pagination={pagination}
            loading={loading}
            onChange={(pag) => {
              setPagination(pag);
            }}
            scroll={{ x: true }}
          />
          
          <Modal
            title="驳回理由"
            visible={reviewModalVisible}
            onOk={handleReject}
            onCancel={() => {
              setReviewModalVisible(false);
              setRejectReason('');
            }}
            okText="确认驳回"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="成果标题">{selectedItem?.title}</Descriptions.Item>
              <Descriptions.Item label="提交学生">{selectedItem?.userName}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <p style={{ marginBottom: 8 }}>请填写驳回理由：</p>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请详细说明驳回原因（至少20字）"
              showCount
              maxLength={200}
            />
          </Modal>
        </Card>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default AchievementReviewPage;
    