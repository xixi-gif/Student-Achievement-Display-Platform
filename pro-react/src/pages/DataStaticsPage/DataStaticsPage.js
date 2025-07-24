import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, DatePicker, Select, Spin, Divider, Statistic, Tabs, Table, Tag, Space, Layout} from 'antd';
import { BarChartOutlined, PieChartOutlined,  LineChartOutlined, UserOutlined, BookOutlined,  StarOutlined} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import Navbar from '../Navbar/Navbar';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Footer } = Layout;


// 模拟学生数据
const mockStudents = [
  {
    id: 's1001',
    name: '张明',
    studentId: '20230001',
    className: '计算机2001班',
    major: '计算机科学与技术',
    status: 'active',
    achievementCount: 5,
    lastLogin: '2023-11-15 09:30:45',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 's1002',
    name: '李华',
    studentId: '20230002',
    className: '软件工程2002班',
    major: '软件工程',
    status: 'active',
    achievementCount: 3,
    lastLogin: '2023-11-14 14:20:10',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    id: 's1003',
    name: '赵雪',
    studentId: '20230003',
    className: '人工智能2001班',
    major: '人工智能',
    status: 'inactive',
    achievementCount: 7,
    lastLogin: '2023-10-20 08:15:30',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
].map((item, index) => ({
  ...item,
  // 添加更多统计相关字段
  loginCount: Math.floor(Math.random() * 50) + 10,
  lastAchievementDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  achievementTypes: ['科研', '竞赛', '论文'].slice(0, Math.floor(Math.random() * 3) + 1)
}));

const DataStatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    summary: {},
    achievements: [],
    userActivities: [],
    trends: []
  });

  // 模拟数据加载
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'visitor';
      const username = localStorage.getItem('username') || '访客';
      setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });
      setStats({
        summary: {
          totalStudents: 12,
          activeStudents: 9,
          totalAchievements: 68,
          avgAchievements: 5.7,
          approvalRate: '92%'
        },
        achievements: [
          { type: '科研项目', count: 28, ratio: '41%' },
          { type: '学术论文', count: 18, ratio: '26%' },
          { type: '竞赛作品', count: 15, ratio: '22%' },
          { type: '其他', count: 7, ratio: '11%' }
        ],
        userActivities: mockStudents.map(student => ({
          name: student.name,
          loginCount: student.loginCount,
          achievementCount: student.achievementCount,
          status: student.status,
          lastActive: student.lastLogin
        })),
        trends: Array.from({ length: 30 }, (_, i) => ({
          date: `11/${i + 1}`,
          total: Math.floor(Math.random() * 10) + 2,
          approved: Math.floor(Math.random() * 8) + 1,
          recommended: Math.floor(Math.random() * 3)
        }))
      });
      setLoading(false);
    }, 800);
  }, []);

  // 数据概览卡片
  const StatCard = ({ icon, title, value, color }) => (
    <Card 
      bordered={false} 
      bodyStyle={{ padding: '16px 24px' }}
      style={{ background: color ? `${color}10` : '#fff' }}
    >
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
    </Card>
  );

  // 成果分类统计图
  const getAchievementChartOption = () => ({
    title: {
      text: '成果分类统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [{
      name: '成果类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      data: stats.achievements.map(item => ({
        value: item.count,
        name: item.type
      }))
    }]
  });

  const navigate = useNavigate();
  // 用户活跃度图表
  const getUserActivityChartOption = () => ({
    title: {
      text: '用户活跃度排名',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '登录次数'
    },
    yAxis: {
      type: 'category',
      data: stats.userActivities
        .sort((a, b) => b.loginCount - a.loginCount)
        .slice(0, 8)
        .map(user => user.name),
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    series: [{
      name: '登录次数',
      type: 'bar',
      data: stats.userActivities
        .sort((a, b) => b.loginCount - a.loginCount)
        .slice(0, 8)
        .map(user => user.loginCount),
      itemStyle: {
        color: '#1890ff'
      }
    }]
  });

  // 成果趋势图表
  const getTrendChartOption = () => ({
    title: {
      text: '成果提交趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总成果数', '通过审核', '推荐成果'],
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.trends.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总成果数',
        type: 'line',
        data: stats.trends.map(item => item.total),
        smooth: true,
        lineStyle: {
          width: 3
        }
      },
      {
        name: '通过审核',
        type: 'line',
        data: stats.trends.map(item => item.approved),
        smooth: true
      },
      {
        name: '推荐成果',
        type: 'line',
        data: stats.trends.map(item => item.recommended),
        smooth: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    ]
  });

  // 用户活跃度表格列
  const userActivityColumns = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a onClick={() => navigate(`/student/profile`)}>{text}</a>
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
      sorter: (a, b) => a.loginCount - b.loginCount
    },
    {
      title: '成果数量',
      dataIndex: 'achievementCount',
      key: 'achievementCount',
      sorter: (a, b) => a.achievementCount - b.achievementCount
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已禁用'}
        </Tag>
      )
    }
  ];

  return (
    <Layout>
      <Navbar currentUser={currentUser} />
    <div style={{ padding: 24 }}>
      <Card
        title="数据统计中心"
        bordered={false}
        extra={
          <Space>
            <RangePicker 
              onChange={setTimeRange} 
              style={{ width: 250 }}
            />
            <Select
              defaultValue="month"
              style={{ width: 120 }}
            >
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="quarter">本季</Option>
              <Option value="year">全年</Option>
            </Select>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{ marginBottom: 24 }}
          >
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  数据概览
                </span>
              }
              key="overview"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <StatCard 
                    icon={<UserOutlined />} 
                    title="学生总数" 
                    value={stats.summary.totalStudents} 
                    color="#1890ff"
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <StatCard 
                    icon={<UserOutlined style={{ color: '#52c41a' }} />} 
                    title="活跃学生" 
                    value={stats.summary.activeStudents} 
                    color="#52c41a"
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <StatCard 
                    icon={<BookOutlined style={{ color: '#722ed1' }} />} 
                    title="成果总数" 
                    value={stats.summary.totalAchievements} 
                    color="#722ed1"
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <StatCard 
                    icon={<StarOutlined style={{ color: '#faad14' }} />} 
                    title="平均成果" 
                    value={stats.summary.avgAchievements} 
                    color="#faad14"
                  />
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card>
                    <ReactECharts
                      option={getTrendChartOption()}
                      style={{ height: 400 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <PieChartOutlined />
                  成果分析
                </span>
              }
              key="achievements"
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card>
                    <ReactECharts
                      option={getAchievementChartOption()}
                      style={{ height: 500 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="成果分类明细">
                    <Table
                      columns={[
                        { title: '成果类型', dataIndex: 'type' },
                        { title: '数量', dataIndex: 'count' },
                        { title: '占比', dataIndex: 'ratio' }
                      ]}
                      dataSource={stats.achievements}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <LineChartOutlined />
                  用户活跃度
                </span>
              }
              key="users"
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card>
                    <ReactECharts
                      option={getUserActivityChartOption()}
                      style={{ height: 500 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="学生活跃度详情">
                    <Table
                      columns={userActivityColumns}
                      dataSource={stats.userActivities}
                      pagination={{ pageSize: 5 }}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>
    </div>
    <Footer style={{ textAlign: 'center' }}>
            学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
          </Footer>
    </Layout>
  );
};

export default DataStatisticsPage;