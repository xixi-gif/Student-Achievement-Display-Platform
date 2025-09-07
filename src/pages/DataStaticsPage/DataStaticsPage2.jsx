import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Spin,
  Divider,
  Statistic,
  Tabs,
  Table,
  Tag,
  Space,
  Layout,
  message,
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  UserOutlined,
  BookOutlined,
  StarOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import Navbar from "../Navbar/Navbar";
import { adminApi } from "../../service/api";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Footer } = Layout;

const DataStatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    summary: {
      activeStudent: 0,
      //   approvalRate: "0%",
      avgAchievement: 0,
      totalAchievement: 0,
      totalStudent: 0,
    },
    trends: [],
  });
  const [achievementStats, setAchievementStats] = useState({
    summary: {},
    achievements: [], // 成果分类统计数据
    userActivities: [],
    trends: [],
  });
  const [userActivities, setUserActivities] = useState({
    data: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  // 获取统计数据概览
  const fetchSummaryStats = async (params = {}) => {
    try {
      const response = await adminApi.getStatistics({
        startTime: params.startTime,
        endTime: params.endTime,
      });
      if (response.code === 0) {
        setStats((prev) => ({
          ...prev,
          summary: {
            ...response.data,
            // approvalRate: response.data.approvalRate || "0%"
          },
        }));
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
      message.error("获取统计数据失败");
    }
  };

  // 获取成果趋势数据
  const fetchTrendStats = async (params = {}) => {
    try {
      const response = await adminApi.getStatsTrend({
        startDate: params.startDate,
        endDate: params.endDate,
        interval: params.interval,
      });
      if (response.code === 0) {
        setStats((prev) => ({
          ...prev,
          trends: response.data.map((item) => ({
            date: moment(item.date).format("MM/DD"),
            total: item.total || 0,
            approved: item.approved || 0,
            recommended: item.recommended || 0,
          })),
        }));
      }
    } catch (error) {
      console.error("获取趋势数据失败:", error);
      message.error("获取趋势数据失败");
    }
  };

  // 获取成果分类统计数据
  const fetchAchievementTypeStats = async (params = {}) => {
    try {
      const response = await adminApi.getAchievementStats({
        startTime: params.startTime,
        endTime: params.endTime,
      });

      if (response.code === 0) {
        // 格式化接口返回的数据
        const formattedData = response.data.map((item) => ({
          type: item.type,
          count: item.count,
          ratio: `${item.ratio.toFixed(1)}%`, // 将小数转换为百分比字符串
        }));

        setAchievementStats((prev) => ({
          ...prev,
          achievements: formattedData,
        }));
      } else {
        throw new Error(response.message || "获取成果分类数据失败");
      }
    } catch (error) {
      console.error("获取成果分类数据失败:", error);
      message.error(error.message || "获取成果分类数据失败");
    }
  };

  // 获取用户活跃度数据（带排序）
  const fetchUserActivities = async (params = {}) => {
    setLoading(true);
    try {
      const pageRequest = {
        current: params.current || userActivities.pagination.current,
        pageSize: params.pageSize || userActivities.pagination.pageSize,
        sortField: params.field || "loginCount", // 默认按登录次数排序
        sortOrder: params.order || "descend", // 默认降序
        startTime: params.startTime,
        endTime: params.endTime,
      };

      const response = await adminApi.getUserStats(pageRequest);

      if (response.code === 0) {
        setUserActivities({
          data: response.data.records.map((item) => ({
            key: item.userId,
            name: item.realName,
            loginCount: item.loginCount,
            achievementCount: item.achievementCount,
            lastLoginTime: moment(item.lastActive).format("YYYY-MM-DD HH:mm:ss"),
            status: item.status === "0" ? "active" : "inactive",
          })),
          pagination: {
            current: response.data.current,
            pageSize: response.data.size,
            total: response.data.total,
          },
        });
      }
    } catch (error) {
      console.error("获取用户活跃度数据失败:", error);
      message.error("获取用户活跃度数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理表格变化（分页、排序）
  const handleTableChange = (pagination, sorter) => {
    fetchUserActivities({
      current: pagination.current,
      pageSize: pagination.pageSize,
      field: sorter.field, // 排序字段
      order: sorter.order, // 排序方向
    });
  };
  // 时间范围变化处理
  const handleTimeRangeChange = (dates, dateStrings) => {
    if (dates) {
      setTimeRange(dates);
      const params = {
        startTime: dateStrings[0],
        endTime: dateStrings[1],
        startDate: dateStrings[0],
        endDate: dateStrings[1],
      };
      fetchSummaryStats(params);
      fetchTrendStats(params);
      fetchAchievementTypeStats(params);
      fetchUserActivities(params);
    } else {
      setTimeRange([]);
      fetchSummaryStats();
      fetchTrendStats();
      fetchAchievementTypeStats();
      fetchUserActivities();
    }
  };

  // 初始化加载数据
  useEffect(() => {
    setLoading(true);
    const role = localStorage.getItem("user_role") || "visitor";
    const username = localStorage.getItem("username") || "访客";
    setCurrentUser({
      role,
      username,
      avatar: `https://picsum.photos/id/${
        1030 + Math.floor(Math.random() * 10)
      }/200/200`,
    });

    Promise.all([
      fetchSummaryStats(),
      fetchTrendStats(),
      // 获取成果分类统计数据
      fetchAchievementTypeStats(),
      fetchUserActivities(),
    ]).finally(() => setLoading(false));
  }, []);

  // 数据概览卡片组件
  const StatCard = ({ icon, title, value, color }) => (
    <Card
      bordered={false}
      bodyStyle={{ padding: "16px 24px" }}
      style={{ background: color ? `${color}10` : "#fff" }}
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
      text: "成果提交趋势",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["总成果数", "通过审核", "推荐成果"],
      top: "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: stats.trends.map((item) => item.date),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "总成果数",
        type: "line",
        data: stats.trends.map((item) => item.total),
        smooth: true,
        lineStyle: {
          width: 3,
        },
      },
      {
        name: "通过审核",
        type: "line",
        data: stats.trends.map((item) => item.approved),
        smooth: true,
      },
      {
        name: "推荐成果",
        type: "line",
        data: stats.trends.map((item) => item.recommended),
        smooth: true,
        lineStyle: {
          type: "dashed",
        },
      },
    ],
  });

  // 成果分类统计图
  const getAchievementChartOption = () => ({
    title: {
      text: "成果分类统计",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
    },
    series: [
      {
        name: "成果类型",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "18",
            fontWeight: "bold",
          },
        },
        data: achievementStats.achievements.map((item) => ({
          value: item.count,
          name: item.type,
        })),
      },
    ],
  });

  // 用户活跃度表格列定义
  const userActivityColumns = [
    {
      title: "用户姓名",
      dataIndex: "name",
      key: "name",
      render: (name) => <a>{name}</a>,
    },
    {
      title: "登录次数",
      dataIndex: "loginCount",
      key: "loginCount",
      render: (count) => <Tag color="blue">{count}</Tag>,
      defaultSortOrder: "descend",
    sorter: (a, b) => b.loginCount - a.loginCount, // 改为降序
    },
    {
      title: "成果数量",
      dataIndex: "achievementCount",
      key: "achievementCount",
      render: (count) => <Tag color="green">{count}</Tag>,
    },
    {
      title: "最后活跃",
      dataIndex: "lastLoginTime",
      key: "lastLoginTime",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "正常" : "已禁用"}
        </Tag>
      ),
    },
  ];

  // 添加一个状态来存储图表数据
const [chartData, setChartData] = useState([]);

// 当 userActivities.data 变化时，更新图表数据
useEffect(() => {
  if (userActivities.data && userActivities.data.length > 0) {
    const sortedData = [...userActivities.data]
      .sort((a, b) => b.loginCount - a.loginCount)
      .slice(0, 10);
    setChartData(sortedData);
  }
}, [userActivities.data]);
  // 用户活跃度图表配置
  const getUserActivityChartOption = () => ({
    title: {
      text: "用户活跃度排名",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    legend: { data: ["登录次数"], top: "bottom" }, // 让图例完整展示
    xAxis: {
      type: "value",
      // name: "登录次数",
    },
    yAxis: {
      type: "category",
      data: chartData.map((user) => user.name || user.realName),
      axisLabel: {
        interval: 0,
        rotate: 0,
      },
    },
    series: [
      {
        name: "登录次数",
        type: "bar",
        data: chartData.map((user) => user.loginCount),
        itemStyle: {
          color: "#1890ff",
        },
        label: { show: true, position: "right" }, // 在柱子尾部显示数值
      },
    ],
  });

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
                defaultValue="week"
                style={{ width: 120 }}
                onChange={(value) => {
                  let days = 30;
                  if (value === "week") days = 7;
                  if (value === "quarter") days = 90;
                  if (value === "year") days = 365;

                  const endDate = moment();
                  const startDate = moment().subtract(days, "days");

                  setTimeRange([startDate, endDate]);
                  handleTimeRangeChange(
                    [startDate, endDate],
                    [
                      startDate.format("YYYY-MM-DD"),
                      endDate.format("YYYY-MM-DD"),
                    ]
                  );
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
                      icon={<UserOutlined style={{ color: "#52c41a" }} />}
                      title="活跃学生"
                      value={stats.summary.activeStudent}
                      color="#52c41a"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <StatCard
                      icon={<BookOutlined style={{ color: "#722ed1" }} />}
                      title="成果总数"
                      value={stats.summary.totalAchievement}
                      color="#722ed1"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <StatCard
                      icon={<StarOutlined style={{ color: "#faad14" }} />}
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
                          { title: "成果类型", dataIndex: "type", key: "type" },
                          { title: "数量", dataIndex: "count", key: "count" },
                          {
                            title: "占比",
                            dataIndex: "ratio",
                            key: "ratio",
                            render: (ratio) => <Tag color="blue">{ratio}</Tag>,
                          },
                        ]}
                        dataSource={achievementStats.achievements}
                        pagination={false}
                        size="small"
                        rowKey="type"
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
                        key={chartData.length} // 添加 key 属性，当数据长度变化时重新渲染
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="用户活跃度详情">
                      <Table
                        columns={userActivityColumns}
                        dataSource={userActivities.data}
                        pagination={userActivities.pagination}
                        onChange={handleTableChange}
                        size="small"
                        rowKey="key"
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Spin>
        </Card>
      </div>
      <Footer style={{ textAlign: "center" }}>
        学生成果展示平台 ©{new Date().getFullYear()}{" "}
        汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default DataStatisticsPage;
