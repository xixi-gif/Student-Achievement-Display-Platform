import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Space, Button, Card, Typography, Divider, Tag, message, Spin, Empty } from 'antd';
import { SearchOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar'; 

const { Content, Header, Footer } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const mockAnnouncements = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  title: `${['系统更新通知', '学期成果展示安排', '平台使用指南', '用户反馈收集', '新功能上线公告'][index % 5]}${index + 1}`,
  content: `这是公告内容示例，包含了关于${['系统维护', '成果提交', '账号安全', '活动安排', '数据统计'][index % 5]}的详细说明。用户可以通过本公告了解相关事项的具体要求和时间节点，如有疑问请联系管理员。${'内容延伸'.repeat(index % 3 + 1)}`,
  createTime: moment().subtract(index, 'days').format('YYYY-MM-DD HH:mm:ss'),
  viewCount: Math.floor(Math.random() * 500) + 10,
  author: `管理员${(index % 3) + 1}`
}));

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = { role: 'student', username: '用户' }; 

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword');
    if (keyword) {
      setSearchKeyword(keyword);
    }

    setTimeout(() => {
      try {
        const sortedData = [...mockAnnouncements].sort((a, b) => 
          moment(b.createTime).valueOf() - moment(a.createTime).valueOf()
        );
        
        const filteredData = keyword 
          ? sortedData.filter(item => 
              item.title.includes(keyword) || item.content.includes(keyword)
            )
          : sortedData;
          
        setTotalCount(filteredData.length);
        const paginatedData = filteredData.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        );
        setAnnouncements(paginatedData);
      } catch (error) {
        message.error('获取公告失败');
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [currentPage, searchKeyword, location.search]);
  
  const handleSearch = (value) => {
    setCurrentPage(1);
    navigate(`/announcements?keyword=${encodeURIComponent(value)}`);
  };
  
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/annoucementdetail`}>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
            {text}
          </Text>
        </Link>
      ),
      align: 'center'
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD'),
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/announcements/${record.id}`)}
          style={{ color: '#1890ff' }}
        >
          查看详情
        </Button>
      ),
      align: 'center'
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
  };

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
          
          <Spin spinning={loading}>
            {announcements.length > 0 ? (
              <Table
                rowSelection={rowSelection}
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