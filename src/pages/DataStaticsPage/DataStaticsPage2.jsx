import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Row, Col, DatePicker, Select, Spin, Divider, 
  Statistic, Tabs, Table, Tag, Space, Layout, message 
} from 'antd';
import { 
  BarChartOutlined, PieChartOutlined, LineChartOutlined, 
  UserOutlined, BookOutlined, StarOutlined 
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import Navbar from '../Navbar/Navbar';
import { adminApi} from '../../service/api'; 
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Footer } = Layout;

const DataStatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    summary: {
      activeStudent: 0,
    //   approvalRate: "0%",
      avgAchievement: 0,
      totalAchievement: 0,
      totalStudent: 0
    },
    trends: []
  });

  // 获取统计数据概览
  const fetchSummaryStats = async (params = {}) => {
    try {
      const response = await adminApi.getStatistics({
        startTime: params.startTime,
        endTime: params.endTime
      });
      if (response.code === 0) {
        setStats(prev => ({
          ...prev,
          summary: {
            ...response.data,
            // approvalRate: response.data.approvalRate || "0%"
          }
        }));
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
    }
  };

  // 获取成果趋势数据
  const fetchTrendStats = async (params = {}) => {
    try {
      const response = await adminApi.getStatsTrend({
        startDate: params.startDate,
        endDate: params.endDate,
        interval: params.interval
      });
      if (response.code === 0) {
        setStats(prev => ({
          ...prev,
          trends: response.data.map(item => ({
            date: moment(item.date).format('MM/DD'),
            total: item.total || 0,
            approved: item.approved || 0,
            recommended: item.recommended || 0
          }))
        }));
      }
    } catch (error) {
      console.error('获取趋势数据失败:', error);
      message.error('获取趋势数据失败');
    }
  };

  // 时间范围变化处理
  const handleTimeRangeChange = (dates, dateStrings) => {
    if (dates) {
      setTimeRange(dates);
      const params = {
        startTime: dateStrings[0],
        endTime: dateStrings[1],
        startDate: dateStrings[0],
        endDate: dateStrings[1]
      };
      fetchSummaryStats(params);
      fetchTrendStats(params);
    } else {
      setTimeRange([]);
      fetchSummaryStats();
      fetchTrendStats();
    }
  };

  // 初始化加载数据
  useEffect(() => {
    setLoading(true);
    const role = localStorage.getItem('user_role') || 'visitor';
    const username = localStorage.getItem('username') || '访客';
    setCurrentUser({ 
      role, 
      username, 
      avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` 
    });

    Promise.all([
      fetchSummaryStats(),
      fetchTrendStats()
    ]).finally(() => setLoading(false));
  }, []);

  // 数据概览卡片组件
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

  // 成果趋势图表配置
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

  const navigate = useNavigate();

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
                onChange={handleTimeRangeChange}
                value={timeRange}
                style={{ width: 250 }}
              />
              <Select
                defaultValue="month"
                style={{ width: 120 }}
                onChange={(value) => {
                  let days = 30;
                  if (value === 'week') days = 7;
                  if (value === 'quarter') days = 90;
                  if (value === 'year') days = 365;
                  
                  const endDate = moment();
                  const startDate = moment().subtract(days, 'days');
                  
                  setTimeRange([startDate, endDate]);
                  handleTimeRangeChange([startDate, endDate], [
                    startDate.format('YYYY-MM-DD'),
                    endDate.format('YYYY-MM-DD')
                  ]);
                }}
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
                      value={stats.summary.totalStudent} 
                      color="#1890ff"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <StatCard 
                      icon={<UserOutlined style={{ color: '#52c41a' }} />} 
                      title="活跃学生" 
                      value={stats.summary.activeStudent} 
                      color="#52c41a"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <StatCard 
                      icon={<BookOutlined style={{ color: '#722ed1' }} />} 
                      title="成果总数" 
                      value={stats.summary.totalAchievement} 
                      color="#722ed1"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <StatCard 
                      icon={<StarOutlined style={{ color: '#faad14' }} />} 
                      title="平均成果" 
                      value={stats.summary.avgAchievement} 
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
                {/* 这里可以添加其他分析图表 */}
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <h3>成果分类分析</h3>
                  <p>此处可添加饼图等分析图表</p>
                </div>
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
                {/* 这里可以添加用户活跃度分析 */}
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <h3>用户活跃度分析</h3>
                  <p>此处可添加用户活跃度图表</p>
                </div>
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