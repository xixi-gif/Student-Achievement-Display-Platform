import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Space, Button, Card, Typography, Divider, Tag, message, Spin, Empty } from 'antd';
import { SearchOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar'; 
import { announcementApi } from '../../service/api'; // 导入公告接口

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = { role: localStorage.getItem('role') || 'vistor', username: localStorage.getItem('username') || '访客' }; 

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
      // 调用公告列表接口
      const response = await announcementApi.getList({
        current: currentPage,
        pageSize: pageSize,
        keyword: keyword.trim() || null
      });
      
      if (response.code === 0) {
        // 转换接口返回数据格式
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
  setSearchKeyword(value); // 立即更新本地状态
  
 fetchAnnouncements(value.trim() || null); // 空值传null
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
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      align: 'center'
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => text ? moment(text).format('YYYY-MM-DD') : '-',
      align: 'center'
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/announcement/detail/${record.id}`)}
          style={{ color: '#1890ff' }}
        >
          查看详情
        </Button>
      ),
      align: 'center'
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ padding: '0 50px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', padding: 24, marginTop: 24, borderRadius: 8 }}>
          <Title level={2} style={{ textAlign: 'center' }}>公告列表</Title>
          <Divider />
          
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
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalCount,
                  onChange: (page) => {
                    setCurrentPage(page);
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
    </Layout>
  );
};

export default AnnouncementList;