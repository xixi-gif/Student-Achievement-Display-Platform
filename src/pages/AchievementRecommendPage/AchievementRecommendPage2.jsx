import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Table, Button, Tag, Card, Input, Select, Modal, Space, Popover,  
  Badge, Descriptions, Divider, message, Switch, Layout} from 'antd';
import {StarOutlined, SearchOutlined, FilterOutlined, InfoCircleOutlined} from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { achievementApi } from '../../service/api';

const { Search } = Input;
const {Option} = Select;
const { Footer } = Layout;

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
  const navigate = useNavigate();

  // 获取可推荐成果列表
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      };
      
      const res = await achievementApi.getRecommendList(params);
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
    // 加载用户信息
    const role = localStorage.getItem('user_role') || 'visitor';
    const username = localStorage.getItem('username') || '访客';
    setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });

    // 加载推荐数据
    fetchData();
  }, [pagination.current, searchParams]);

  // 处理推荐状态切换
  const handleToggleRecommend = async (id, recommended) => {
    try {
      await achievementApi.toggleRecommend(id);
      setData(data.map(item =>
        item.id === id ? { ...item, recommended } : item
      ));
      message.success(recommended ? '已推荐该成果' : '已取消推荐');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理推荐等级变更
  const handleLevelChange = async (id, level) => {
    try {
      await achievementApi.setRecommendLevel(id, level);
      setData(data.map(item =>
        item.id === id ? { ...item, recommendLevel: level } : item
      ));
      message.success('推荐等级已更新');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理推荐说明提交
  const handleCommentSubmit = async () => {
    const { currentItem, comment } = commentModal;
    try {
      await achievementApi.setRecommendComment(currentItem.id, comment);
      setData(data.map(item =>
        item.id === currentItem.id
          ? { ...item, recommendComment: comment }
          : item
      ));
      setCommentModal({ ...commentModal, visible: false });
      message.success('推荐说明已保存');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 表格列配置
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
              <p><strong>学生：</strong>{record.userName}</p>
              <p><strong>类型：</strong>{record.category?.name}</p>
              <p><strong>关键词：</strong>{record.keyword?.join(', ') || '无'}</p>
              {record.recommendComment && (
                <p><strong>推荐说明：</strong>{record.recommendComment}</p>
              )}
            </div>
          }
        >
          <a onClick={() => navigate(`/achievement/detail/${record.id}`)}>
            {text}
          </a>
        </Popover>
      )
    },
    {
      title: '学生',
      dataIndex: 'userName',
      key: 'userName',
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: category => <Tag color="blue">{category?.name}</Tag>
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
          disabled={!record.isRecommended}
        />
      )
    },
    {
      title: '推荐状态',
      dataIndex: 'isRecommended',
      key: 'isRecommended',
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
          disabled={!record.isRecommended}
        >
          {record.recommendComment ? '编辑说明' : '添加说明'}
        </Button>
      )
    }
  ];

  return (
    <Layout>
      <Navbar currentUser={currentUser} />
      <Card
        title={
          <Space>
            <span>优秀成果推荐</span>
            <Badge
              count={data.filter(d => d.isRecommended).length}
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
              onSearch={value => {
                setSearchParams({
                  ...searchParams,
                  keyword: value
                });
                setPagination({...pagination, current: 1});
              }}
            />
            <Select
              placeholder="成果类型"
              allowClear
              style={{ width: 120 }}
              onChange={value => {
                setSearchParams({
                  ...searchParams,
                  category: value
                });
                setPagination({...pagination, current: 1});
              }}
            >
              <Option value="科研项目">科研项目</Option>
              <Option value="软件开发">软件开发</Option>
              <Option value="论文">论文</Option>
            </Select>
            <Select
              placeholder="推荐等级"
              allowClear
              style={{ width: 140 }}
              onChange={value => {
                setSearchParams({
                  ...searchParams,
                  minLevel: value
                });
                setPagination({...pagination, current: 1});
              }}
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
          rowClassName={record => record.isRecommended ? 'recommended-row' : ''}
        />

        {/* 推荐说明弹窗 */}
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
      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default AchievementRecommendPage;