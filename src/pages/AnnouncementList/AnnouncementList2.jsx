import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Table, 
  Input, 
  Space, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Tag, 
  message, 
  Spin, 
  Empty,
  Modal,
  Checkbox
} from 'antd';
import { 
  SearchOutlined, 
  CalendarOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs'; // 替换 moment.js
import Navbar from '../Navbar/Navbar'; 
import { announcementApi } from '../../service/api';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

// React 19 兼容性包装器
const CompatibleModal = {
  confirm: (config) => {
    return Modal.confirm({
      ...config,
      // 确保不使用已弃用的属性
      okButtonProps: config.okType ? { danger: config.okType === 'danger' } : undefined
    });
  }
};

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [modalApi, modalContextHolder] = Modal.useModal(); // 使用新的Modal API
  const pageSize = 10;
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = { 
    role: localStorage.getItem('user_role') || 'visitor', 
    username: localStorage.getItem('username') || '访客' 
  };

  // 检查是否为管理员
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    if (keyword !== searchKeyword) {
      setSearchKeyword(keyword);
    }
    fetchAnnouncements(keyword);
  }, [currentPage, location.search]);

  const fetchAnnouncements = async (keyword) => {
    setLoading(true);
    try {
      const response = await announcementApi.getList({
        current: currentPage,
        pageSize: pageSize,
        keyword: keyword.trim() || null
      });
      
      if (response.code === 0) {
        const formattedData = response.data.records.map(item => ({
          id: item.announcementId,
          title: item.title,
          content: item.content,
          createTime: item.createTime,
          viewCount: item.viewCount,
          author: item.author || '管理员'
        }));

        setAnnouncements(formattedData);
        setTotalCount(response.data.total);
      } else {
        message.error(response.message || '获取公告失败');
      }
    } catch (error) {
      console.error('获取公告失败:', error);
      message.error('获取公告失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (value) => {
    setCurrentPage(1);
    setSearchKeyword(value);
    fetchAnnouncements(value.trim() || null);
  };

  // 统一的删除函数（支持单条和批量）- React 19 兼容版本
  const handleDelete = async (ids, title = '') => {
    try {
      const isSingleDelete = !Array.isArray(ids);
      const idList = Array.isArray(ids) ? ids : [ids];
      
      // 使用新的Modal API
      modalApi.confirm({
        title: isSingleDelete ? '确认删除' : '确认批量删除',
        icon: <ExclamationCircleOutlined />,
        content: isSingleDelete 
          ? `确定要删除公告"${title}"吗？此操作不可恢复。`
          : `确定要删除选中的 ${idList.length} 条公告吗？此操作不可恢复。`,
        okText: '确认删除',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: async () => {
          setBatchLoading(true);
          try {
            const response = await announcementApi.deleteAnnouncement(idList);
            
            if (response.code === 0) {
              message.success(isSingleDelete ? '删除成功' : `成功删除 ${idList.length} 条公告`);
              setSelectedRowKeys([]);
              fetchAnnouncements(searchKeyword);
            } else {
              message.error(response.message || '删除失败');
            }
          } catch (error) {
            console.error('删除请求失败:', error);
            message.error('删除失败: ' + (error.message || '网络错误'));
          } finally {
            setBatchLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('删除操作异常:', error);
      message.error('操作异常，请检查控制台错误');
    }
  };

  // 批量删除公告
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的公告');
      return;
    }
    handleDelete(selectedRowKeys);
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/announcement/detail/${record.id}`}>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
            {text}
          </Text>
        </Link>
      ),
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => navigate(`/announcement/detail/${record.id}`)}
            style={{ color: '#1890ff' }}
            icon={<EyeOutlined />}
          >
            查看详情
          </Button>
          {isAdmin && (
            <Button 
              type="link" 
              danger
              onClick={(e) => {
                e.stopPropagation(); // 防止事件冒泡
                handleDelete(record.id, record.title);
              }}
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          )}
        </Space>
      ),
      align: 'center'
    },
  ];

  // 行选择配置（仅管理员可见）- 使用新版API
  const rowSelection = isAdmin ? {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: false,
      name: record.title,
    }),
    columnWidth: 60,
    preserveSelectedRowKeys: true
  } : null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ padding: '0 50px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', padding: 24, marginTop: 24, borderRadius: 8 }}>
          <Title level={2} style={{ textAlign: 'center' }}>公告列表</Title>
          <Divider />
          
          {/* 批量操作区域（仅管理员可见） */}
          {isAdmin && selectedRowKeys.length > 0 && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0f8ff', borderRadius: 6 }}>
              <Space>
                <Text>已选择 {selectedRowKeys.length} 条公告</Text>
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                  loading={batchLoading}
                >
                  批量删除
                </Button>
                <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
              </Space>
            </div>
          )}
          
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <Search
              placeholder="搜索公告标题或内容"
              allowClear
              enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
              size="large"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 600 }}
            />
          </div>
          
          <Spin spinning={loading} tip="正在加载公告...">
            {announcements.length > 0 ? (
              <Table
                columns={columns}
                dataSource={announcements}
                rowKey="id"
                rowSelection={rowSelection}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalCount,
                  onChange: (page) => {
                    setCurrentPage(page);
                    setSelectedRowKeys([]);
                    window.scrollTo(0, 0);
                  },
                  showTotal: total => `共 ${total} 条公告`,
                  showSizeChanger: false
                }}
                locale={{
                  emptyText: <Empty description="暂无公告数据" />
                }}
              />
            ) : (
              <Empty description="暂无公告数据" />
            )}
          </Spin>
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>

      {/* Modal上下文持有器 */}
      {modalContextHolder}
    </Layout>
  );
};

export default AnnouncementList;