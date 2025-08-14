import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Table,  Button,  Tag,  Card,  Input,  Select,  Modal,  Space,  Popover,  
  Badge, Descriptions, Divider,  message,  Switch, Layout} from 'antd';
import {StarOutlined,  SearchOutlined,  FilterOutlined,  InfoCircleOutlined} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';

const { Search } = Input;
const {Option} = Select;
const { Footer, Content } = Layout;

const mockAchievements = [
  {
    id: 1,
    title: "基于深度学习的垃圾分类系统",
    studentName: "张明",
    category: "科研项目",
    reviewTime: "2023-10-05 09:15:00",
    recommended: true,
    recommendLevel: 3,
    recommendComment: "创新性强，已申请专利",
    keywords: ["AI", "环保"]
  },
  {
    id: 2,
    title: "校园二手交易平台",
    studentName: "李华",
    category: "软件开发",
    reviewTime: "2023-10-08 14:30:00",
    recommended: true,
    recommendLevel: 2,
    recommendComment: "已在三个校区推广使用",
    keywords: ["SpringBoot", "Vue"]
  },
  {
    id: 3,
    title: "大学生心理健康研究",
    studentName: "赵雪",
    category: "论文",
    reviewTime: "2023-11-20 16:45:00",
    recommended: false,
    recommendLevel: null,
    recommendComment: "",
    keywords: ["心理学", "数据分析"]
  }
].map(item => ({ ...item, key: item.id }));

const AchievementRecommendPage = () => {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    minLevel: null
  });
  const [commentModal, setCommentModal] = useState({
    visible: false,
    currentItem: null,
    comment: ''
  });

  useEffect(() => {
    const loadUserAndData = async () => {
      setLoading(true);
      
      try {
        const role = localStorage.getItem('user_role') || 'visitor';
        const username = localStorage.getItem('username') || '访客';
        setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });
          
        const filtered = mockAchievements.filter(item => {
          const matchesSearch = searchParams.keyword
            ? item.title.includes(searchParams.keyword) ||
              item.studentName.includes(searchParams.keyword) ||
              item.keywords.some(kw => kw.includes(searchParams.keyword))
            : true;
          
          const matchesCategory = searchParams.category
            ? item.category === searchParams.category
            : true;
          
          const matchesLevel = searchParams.minLevel
            ? item.recommendLevel >= searchParams.minLevel
            : true;
          
          return matchesSearch && matchesCategory && matchesLevel;
        });
        
        setData(filtered);
        setPagination(prev => ({
          ...prev,
          total: filtered.length
        }));
        
      } catch (error) {
        console.error('加载数据失败:', error);
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, [pagination.current, searchParams]);

  const handleToggleRecommend = (id, recommended) => {
    const updated = data.map(item =>
      item.id === id ? { ...item, recommended } : item
    );
    setData(updated);
    message.success(recommended ? '已推荐该成果' : '已取消推荐');
  };

  const handleLevelChange = (id, level) => {
    const updated = data.map(item =>
      item.id === id ? { ...item, recommendLevel: level } : item
    );
    setData(updated);
    message.success('推荐等级已更新');
  };

  const handleCommentSubmit = () => {
    const { currentItem, comment } = commentModal;
    const updated = data.map(item =>
      item.id === currentItem.id
        ? { ...item, recommendComment: comment }
        : item
    );
    setData(updated);
    setCommentModal({ ...commentModal, visible: false });
    message.success('推荐说明已保存');
  };
  
  const navigate = useNavigate(); 

  const columns = [
    {
      title: '成果标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => (
        <Popover
          content={
            <div style={{ width: 300 }}>
              <p><strong>学生：</strong>{record.studentName}</p>
              <p><strong>类型：</strong>{record.category}</p>
              <p><strong>关键词：</strong>{record.keywords.join(', ')}</p>
              {record.recommendComment && (
                <p><strong>推荐说明：</strong>{record.recommendComment}</p>
              )}
            </div>
          }
        >
          <a onClick={() => navigate(`/achievement/detail`)}>
            {text}</a>
        </Popover>
      )
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: category => <Tag color="blue">{category}</Tag>
    },
    {
      title: '推荐等级',
      dataIndex: 'recommendLevel',
      key: 'recommendLevel',
      width: 150,
      render: (level, record) => (
        <Select
          value={level}
          style={{ width: 120 }}
          onChange={value => handleLevelChange(record.id, value)}
          options={[
            { value: 1, label: '⭐ 一般' },
            { value: 2, label: '⭐⭐ 重点' },
            { value: 3, label: '⭐⭐⭐ 强烈' }
          ]}
          disabled={!record.recommended}
        />
      )
    },
    {
      title: '推荐状态',
      dataIndex: 'recommended',
      key: 'recommended',
      width: 120,
      render: (recommended, record) => (
        <Switch
          checked={recommended}
          onChange={checked => handleToggleRecommend(record.id, checked)}
          checkedChildren="已推荐"
          unCheckedChildren="未推荐"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          icon={<StarOutlined />}
          onClick={() => setCommentModal({
            visible: true,
            currentItem: record,
            comment: record.recommendComment || ''
          })}
          disabled={!record.recommended}
        >
          {record.recommendComment ? '编辑说明' : '添加说明'}
        </Button>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentUser={currentUser} />
      
      {/* 主要内容区域 - 设置为块级元素，不使用flex居中 */}
      <Content style={{ 
        flex: '1', 
        padding: '24px', 
        display: 'block',  /* 确保不是flex布局 */
        background: '#fff' 
      }}>
        <Card
          title={
            <Space>
              <span>优秀成果推荐</span>
              <Badge
                count={data.filter(d => d.recommended).length}
                style={{ backgroundColor: '#52c41a' }}
              />
            </Space>
          }
          bordered={false}
          extra={
            <Space wrap>
              <Search
                placeholder="搜索成果/学生/关键词"
                allowClear
                style={{ width: 250 }}
                onSearch={value => setSearchParams({
                  ...searchParams,
                  keyword: value
                })}
              />
              <Select
                placeholder="成果类型"
                allowClear
                style={{ width: 120 }}
                onChange={value => setSearchParams({
                  ...searchParams,
                  category: value
                })}
              >
                <Option value="科研项目">科研项目</Option>
                <Option value="软件开发">软件开发</Option>
                <Option value="论文">论文</Option>
              </Select>
              <Select
                placeholder="推荐等级"
                allowClear
                style={{ width: 140 }}
                onChange={value => setSearchParams({
                  ...searchParams,
                  minLevel: value
                })}
                suffixIcon={<FilterOutlined />}
              >
                <Option value={1}>⭐ 及以上</Option>
                <Option value={2}>⭐⭐ 及以上</Option>
                <Option value={3}>⭐⭐⭐</Option>
              </Select>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条成果`
            }}
            onChange={pag => setPagination(pag)}
            scroll={{ x: 800 }}
            rowClassName={record => record.recommended ? 'recommended-row' : ''}
          />

          <Modal
            title="设置推荐说明"
            visible={commentModal.visible}
            onOk={handleCommentSubmit}
            onCancel={() => setCommentModal({
              ...commentModal,
              visible: false
            })}
            width={600}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="成果标题">
                {commentModal.currentItem?.title}
              </Descriptions.Item>
              <Descriptions.Item label="当前推荐等级">
                {commentModal.currentItem?.recommendLevel && (
                  <Tag color="gold">
                    {Array(commentModal.currentItem.recommendLevel)
                      .fill('⭐')
                      .join('')}
                  </Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Input.TextArea
              rows={4}
              value={commentModal.comment}
              onChange={e => setCommentModal({
                ...commentModal,
                comment: e.target.value
              })}
              placeholder="请输入推荐理由（如创新性、实用性等）"
              maxLength={200}
              showCount
            />
            <div style={{ marginTop: 8, color: '#999' }}>
              <InfoCircleOutlined /> 说明将展示在成果详情页
            </div>
          </Modal>
        </Card>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default AchievementRecommendPage;
    