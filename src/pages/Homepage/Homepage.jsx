import React, { useState, useEffect } from "react";
import {
  Layout,
  Carousel,
  Card,
  Statistic,
  Row,
  Col,
  Tabs,
  Tag,
  Button,
  Space,
  Input,
  Typography,
  Divider,
  Spin,
  message,
  Modal
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  StarOutlined,
  BookOutlined,
  ProjectOutlined,
  TeamOutlined,
  InboxOutlined,
  FilePdfOutlined,
  TagOutlined,
  CodeOutlined,
  ExperimentOutlined,
  BulbOutlined,
  CrownOutlined,
  InfoOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { achievementApi, adminApi } from "../../service/api";
import moment from "moment";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 分类颜色和图标映射配置
const CATEGORY_CONFIG = {
  软件开发: {
    color: "#1890ff", // 蓝色
    icon: <CodeOutlined />,
    badgeColor: "#1890ff",
  },
  学术论文: {
    color: "#52c41a", // 绿色
    icon: <BookOutlined />,
    badgeColor: "#52c41a",
  },
  创新设计: {
    color: "#faad14", // 橙色
    icon: <BulbOutlined />,
    badgeColor: "#faad14",
  },
  竞赛成果: {
    color: "#f5222d", // 红色
    icon: <TrophyOutlined />,
    badgeColor: "#f5222d",
  },
  科研项目: {
    color: "#722ed1", // 紫色
    icon: <ExperimentOutlined />,
    badgeColor: "#722ed1",
  },
  // 默认配置（用于未知分类）
  default: {
    color: "#8c8c8c", // 灰色
    icon: <TagOutlined />,
    badgeColor: "#8c8c8c",
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 获取用户信息
        const token = localStorage.getItem("token");
        const role = token ? localStorage.getItem("user_role") : "visitor";
        const username = token ? localStorage.getItem("username") : "访客";
        setCurrentUser({ role, username });

        // 获取轮播图数据
        const carouselResponse = await adminApi.getCarousel();
        if (carouselResponse.code === 0) {
          setCarouselItems(carouselResponse.data);
        } else {
          throw new Error(carouselResponse.message || "获取轮播图数据失败");
        }

        // 获取统计数据
        const statsResponse = await adminApi.getStatistics();
        if (statsResponse.code === 0) {
          setStatistics([
            {
              title: "总成果数",
              value: statsResponse.data.approvedCount,
              icon: <TrophyOutlined />,
              color: "#1890ff",
            },
            {
              title: "展示学生",
              value: statsResponse.data.hasAchievementStudentCount,
              icon: <UserOutlined />,
              color: "#52c41a",
            },
            {
              title: "成果分类",
              value: statsResponse.data.categoryCount,
              icon: <TagOutlined />,
              color: "#faad14",
            },
            {
              title: "本月成果",
              value: statsResponse.data.currentMonthAchievementCount,
              icon: <CalendarOutlined />,
              color: "#f5222d",
            },
          ]);
        }

        // 获取分类数据
        const categoriesResponse = await adminApi.getCategoryList();
        if (categoriesResponse.code === 0) {
          // 根据图片中的分类名称映射配置
          const formattedCategories = categoriesResponse.data.map((cat) => {
            const config = CATEGORY_CONFIG[cat.name] || CATEGORY_CONFIG.default;
            return {
              key: cat.id,
              name: cat.name,
              count: cat.achievementCount || 0,
              color: config.color,
              icon: config.icon,
              badgeColor: config.badgeColor,
            };
          });
          setCategories(formattedCategories);
        }

        // 只请求一次，获取所有已发布的成果
        const achievementsResponse = await achievementApi.getList({
          page: 1,
          size: 8,
        });

        if (achievementsResponse.code === 0) {
          const allData = achievementsResponse.data.records;
          setAllAchievements(allData);
        }
      } catch (error) {
        console.error("获取数据失败:", error);
        message.error("获取数据失败，请刷新重试");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取分类配置
  const getCategoryConfig = (categoryName) => {
    return CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG.default;
  };

  // 根据 recommended 字段筛选数据
  const getLatestAchievements = () => {
    return allAchievements
      .sort(
        (a, b) =>
          moment(b.createTime).valueOf() - moment(a.createTime).valueOf()
      )
      .slice(0, 4);
  };

  const getFeaturedAchievements = () => {
    return allAchievements
      .filter((item) => item.recommended)
      .sort((a, b) => (b.recommendLevel || 0) - (a.recommendLevel || 0))
      .slice(0, 4);
  };

  // 法律免责声明内容
  const disclaimerContent = ` 学生成果展示平台法律免责声明

 一、声明目的
本法律免责声明（以下简称"声明"）旨在明确"学生成果展示平台"（以下简称"平台"）的服务性质、用户权利与义务，以及平台的免责范围，保护平台及用户的合法权益。请所有使用本平台的用户（包括但不限于学生、教师、访客等）在使用平台前仔细阅读本声明，您对平台的使用行为将被视为对本声明全部内容的认可与接受。

 二、适用范围
本声明适用于所有访问、浏览、使用本平台及平台提供的各项服务（包括但不限于成果展示、信息发布、评论互动等）的用户。

 三、内容免责
1. 平台仅为学生成果（包括学术论文、项目报告、创意作品等）提供展示与交流的技术服务平台，并非内容的发布者或审核者。平台上展示的所有内容均由用户自行上传、发布，其内容的真实性、准确性、合法性、完整性由内容发布者自行负责。
   
2. 平台对用户发布内容的真实性、准确性、合法性不做任何明示或暗示的保证，也不对内容所涉及的观点、判断、结论等承担责任。用户因依赖平台内容所产生的任何损失（包括但不限于直接损失、间接损失），平台不承担赔偿责任。

3. 平台有权对用户发布的内容进行必要的合规性审查（包括但不限于过滤违法、违规信息），但该审查不构成对内容的认可或担保，也不免除内容发布者的法律责任。

 四、知识产权
1. 用户保证其在平台发布的所有内容（包括文字、图片、视频、音频等）均拥有合法的知识产权或已获得合法授权，不会侵犯任何第三方的知识产权、肖像权、隐私权等合法权益。

2. 如第三方认为平台上的内容侵犯其合法权益，可按照平台公示的投诉流程向平台提出异议，平台在收到有效异议后将依法依规进行处理（包括但不限于删除侵权内容、暂停相关用户权限等）。

3. 平台自身的商标、LOGO、软件代码、界面设计等知识产权归平台所有，未经平台书面授权，任何用户不得擅自使用（包括但不限于复制、传播、修改、商用等）。

 五、用户责任
1. 用户在使用平台服务时，应遵守国家法律法规、社会公序良俗及平台用户协议，不得利用平台从事任何违法违规活动（包括但不限于发布虚假信息、传播不良内容、侵犯他人权益、扰乱平台秩序等）。

2. 因用户违反法律法规或本声明约定，导致平台或第三方遭受损失的，由该用户承担全部责任，平台有权向其追偿。

 六、免责条款
1. 平台对因不可抗力（包括但不限于自然灾害、网络故障、服务器故障、政府行为等）导致的服务中断、数据丢失或用户损失，不承担责任。

2. 平台对用户因使用第三方链接（包括但不限于平台中指向其他网站的链接）所产生的任何损失，不承担责任，第三方链接的内容与责任由该第三方自行负责。

3. 平台仅提供技术服务，不对用户之间因使用平台服务产生的纠纷（包括但不限于成果归属、评价争议等）承担责任，用户应自行协商解决或通过法律途径处理。

4. 因用户自身操作失误、设备故障、网络安全问题等非平台原因导致的损失，平台不承担责任。

 七、条款修改
平台有权根据法律法规变化及运营需要，随时修改本声明内容。修改后的声明将在平台显著位置公示，公示后即生效。用户应定期查阅本声明，若继续使用平台服务，视为接受修改后的声明。

 八、联系方式
如对本声明有任何疑问或异议，可通过以下方式联系平台：
电子邮件：dzjiang@stu.edu.cn 或 ynchen@stu.edu.cn

 九、生效日期
本声明自发布之日起生效。

学生成果展示平台运营团队  
©${new Date().getFullYear()} 汕头大学数学与计算机学院计算机系`;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />

      <Content style={{ background: "#f0f2f5" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "80vh",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Carousel
              autoplay
              effect="fade"
              style={{ maxHeight: 400, overflow: "hidden" }}
            >
              {carouselItems.map((item, index) => (
                <div key={index}>
                  <div
                    style={{
                      background: `url(${item.imageUrl}) center/cover no-repeat`,
                      height: 400,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 10%",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "32px",
                        borderRadius: 8,
                        maxWidth: 600,
                      }}
                    >
                      <Title level={2} style={{ margin: 0 }}>
                        {item.title}
                      </Title>
                      <Paragraph style={{ fontSize: 16, marginTop: 16 }}>
                        {item.description}
                      </Paragraph>
                      <Button
                        type="primary"
                        size="large"
                        style={{ marginTop: 16 }}
                        onClick={() =>
                          navigate(
                            item.link || `/achievements?category=featured`
                          )
                        }
                      >
                        查看详情 <ArrowRightOutlined />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>

            <div style={{ padding: "30px 5%" }}>
              <Row gutter={[16, 16]}>
                {statistics.map((stat, index) => (
                  <Col xs={12} sm={6} key={index}>
                    <Card>
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        prefix={stat.icon}
                        valueStyle={{ color: stat.color }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <div style={{ padding: "0 5% 30px" }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                  <Card title="成果分类浏览" bordered={false}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {categories.map((category) => (
                        <Button
                          key={category.key}
                          type="text"
                          icon={category.icon}
                          onClick={() =>
                            navigate(`/achievements?category=${category.name}`)
                          }
                          style={{
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            borderLeft: `3px solid ${category.color}`,
                            color: category.color,
                            fontWeight: 500,
                          }}
                        >
                          <span>{category.name}</span>
                          <Tag color={category.badgeColor}>
                            {category.count}
                          </Tag>
                        </Button>
                      ))}
                    </div>

                    <Divider style={{ margin: "16px 0" }} />

                    <div>
                      <Title level={5} style={{ marginBottom: 12 }}>
                        搜索成果
                      </Title>
                      <Input
                        placeholder="输入关键词搜索"
                        prefix={<SearchOutlined />}
                        onPressEnter={(e) =>
                          navigate(`/achievements?search=${e.target.value}`)
                        }
                        style={{ marginBottom: 12 }}
                      />
                      <Button
                        type="primary"
                        block
                        onClick={() => navigate("/achievements")}
                      >
                        查看全部成果
                      </Button>
                    </div>
                  </Card>
                  {/* 新增法律声明区域 */}
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#666",
                      }}
                    >
                      <InfoOutlined
                        style={{ marginRight: 8, color: "#1890ff" }}
                      />
                      <Typography.Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ margin: 0 }}
                      >
                        本平台内容仅作展示用途，发布者对内容真实性负责，平台不承担法律责任
                      </Typography.Paragraph>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setDisclaimerVisible(true)}
                      style={{ padding: 0, marginLeft: 24, color: "#1890ff" }}
                    >
                      查看完整法律声明
                    </Button>
                  </div>
                </Col>

                <Col xs={24} md={18}>
                  <Tabs defaultActiveKey="latest" size="large">
                    <TabPane tab="最新成果" key="latest">
                      <Row gutter={[16, 16]}>
                        {getLatestAchievements().map((achievement) => {
                          // const categoryConfig = getCategoryConfig(achievement.category);
                          return (
                            <Col xs={24} sm={12} key={achievement.id}>
                              <Card
                                hoverable
                                cover={
                                  <div
                                    style={{
                                      height: 180,
                                      overflow: "hidden",
                                      position: "relative",
                                    }}
                                  >
                                    <img
                                      src={
                                        achievement.cover ||
                                        "https://picsum.photos/id/1/300/200"
                                      }
                                      alt={achievement.title}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transition: "transform 0.3s",
                                      }}
                                    />
                                    {achievement.recommended && (
                                      <Tag icon={<StarOutlined />} color="gold">
                                        精选
                                      </Tag>
                                    )}
                                  </div>
                                }
                                actions={[
                                  <Space size="small">
                                    <UserOutlined />
                                    <Text>
                                      {achievement.userName || "未知用户"}
                                    </Text>
                                  </Space>,
                                  <Space size="small">
                                    <CalendarOutlined />
                                    <Text>
                                      {moment(achievement.createTime).format(
                                        "YYYY-MM-DD"
                                      )}
                                    </Text>
                                  </Space>,
                                ]}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                  }}
                                >
                                  <Title level={5} style={{ margin: 0 }}>
                                    {achievement.title}
                                  </Title>
                                </div>
                                <Paragraph
                                  ellipsis={{ rows: 2 }}
                                  style={{
                                    color: "#666",
                                    marginBottom: 12,
                                    textAlign: "left",
                                  }}
                                >
                                  {/* <Tag color={categoryConfig.color} icon={categoryConfig.icon}>
                                    {achievement.category}
                                  </Tag> */}
                                  {/* {achievement.major && ` · ${achievement.major}`} */}
                                  {achievement.major || "未知专业"} ·{" "}
                                  {achievement.category}
                                </Paragraph>
                                <div style={{ textAlign: "left" }}>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() =>
                                      navigate(
                                        `/achievement/detail/${achievement.id}`
                                      )
                                    }
                                  >
                                    查看详情
                                  </Button>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>

                      <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Button
                          type="dashed"
                          onClick={() => navigate("/achievements")}
                          icon={<ArrowRightOutlined />}
                        >
                          查看更多成果
                        </Button>
                      </div>
                    </TabPane>

                    <TabPane tab="特色推荐" key="featured">
                      <Row gutter={[16, 16]}>
                        {getFeaturedAchievements().map((achievement) => {
                          const categoryConfig = getCategoryConfig(
                            achievement.category
                          );
                          return (
                            <Col xs={24} sm={12} key={achievement.id}>
                              <Card
                                hoverable
                                cover={
                                  <div
                                    style={{
                                      height: 180,
                                      overflow: "hidden",
                                      position: "relative",
                                    }}
                                  >
                                    <img
                                      src={
                                        achievement.cover ||
                                        "https://picsum.photos/id/1/300/200"
                                      }
                                      alt={achievement.title}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transition: "transform 0.3s",
                                      }}
                                    />
                                    <Tag
                                      icon={<StarOutlined />}
                                      color="gold"
                                      style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                      }}
                                    >
                                      推荐等级:{" "}
                                      {achievement.recommendLevel || 0}
                                    </Tag>
                                  </div>
                                }
                                actions={[
                                  <Space size="small">
                                    <UserOutlined />
                                    <Text>
                                      {achievement.userName || "未知用户"}
                                    </Text>
                                  </Space>,
                                  <Space size="small">
                                    <CalendarOutlined />
                                    <Text>
                                      {moment(achievement.createTime).format(
                                        "YYYY-MM-DD"
                                      )}
                                    </Text>
                                  </Space>,
                                ]}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                  }}
                                >
                                  <Title level={5} style={{ margin: 0 }}>
                                    {achievement.title}
                                  </Title>
                                  <Tag
                                    color={categoryConfig.color}
                                    icon={categoryConfig.icon}
                                  >
                                    {achievement.category}
                                  </Tag>
                                </div>
                                <Paragraph
                                  ellipsis={{ rows: 2 }}
                                  style={{
                                    color: "#666",
                                    marginBottom: 12,
                                    textAlign: "left",
                                  }}
                                >
                                  {achievement.major || "未知专业"}
                                </Paragraph>
                                <div style={{ textAlign: "left" }}>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() =>
                                      navigate(
                                        `/achievement/detail/${achievement.id}`
                                      )
                                    }
                                  >
                                    查看详情
                                  </Button>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>

                      <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Button
                          type="dashed"
                          onClick={() =>
                            navigate("/achievements?featured=true")
                          }
                          icon={<ArrowRightOutlined />}
                        >
                          查看更多推荐成果
                        </Button>
                      </div>
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Content>

      {/* 法律声明弹窗 */}
      <Modal
        title="法律免责声明"
        open={disclaimerVisible}
        onCancel={() => setDisclaimerVisible(false)}
        footer={[
          <Button
            key="confirm"
            type="primary"
            onClick={() => setDisclaimerVisible(false)}
          >
            我已阅读并理解
          </Button>,
        ]}
        width={800}
        maskClosable={false}
      >
        <div
          style={{
            maxHeight: 500,
            overflowY: "auto",
            paddingRight: 8,
            lineHeight: 1.8,
            fontSize: 14,
          }}
        >
          <Typography.Paragraph
            style={{ whiteSpace: "pre-line", marginBottom: 16 }}
          >
            {disclaimerContent}
          </Typography.Paragraph>
        </div>
      </Modal>
    </Layout>
  );
};

export default HomePage;
