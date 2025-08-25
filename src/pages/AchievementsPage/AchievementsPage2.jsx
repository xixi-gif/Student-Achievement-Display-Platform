import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Tag,
  Space,
  Input,
  Button,
  Typography,
  Divider,
  Spin,
  Row,
  Col,
  Pagination,
  Empty,
  message,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  InboxOutlined,
  BookOutlined,
  FolderOpenOutlined,
  StarOutlined,
  FilterOutlined,
  EyeOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { achievementApi, adminApi } from "../../service/api";
import moment from "moment";

const { Content } = Layout;
const { Title, Text } = Typography;

const AchievementsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await adminApi.getCategoryList();
        if (response.code === 0) {
          setCategories(response.data);
        } else {
          message.error(response.message || "获取分类数据失败");
        }
      } catch (error) {
        console.error("获取分类失败:", error);
        message.error("获取分类数据失败");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 获取成果数据
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const keyword = params.get("search") || "";
        const category = params.get("category") || "all";

        setSearchText(keyword);
        setSelectedCategory(category);

        // 构建请求参数
        const requestParams = {
          status: "published",
          page: currentPage,
          size: pageSize,
          keyword: keyword,
        };

        if (category !== "all") {
          requestParams.categoryName = category;
        }

        const response = await achievementApi.getList(requestParams);

        if (response.code === 0) {
          const data = response.data;
          setAchievements(data.records || []);
          setTotal(data.total || 0);
        } else {
          throw new Error(response.message || "获取成果列表失败");
        }
      } catch (error) {
        console.error("获取成果失败:", error);
        message.error(error.message || "获取成果数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [location.search, currentPage, pageSize]);

  const handleSearch = (value) => {
    setCurrentPage(1);
    if (value) {
      navigate(
        `/achievements?search=${encodeURIComponent(value)}${
          selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
        }`
      );
    } else {
      navigate(
        `/achievements${
          selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
        }`
      );
    }
  };

  const handleCategoryChange = (category) => {
    setCurrentPage(1);
    setSelectedCategory(category);
    if (category === "all") {
      navigate(
        searchText
          ? `/achievements?search=${encodeURIComponent(searchText)}`
          : "/achievements"
      );
    } else {
      navigate(
        searchText
          ? `/achievements?category=${category}&search=${encodeURIComponent(
              searchText
            )}`
          : `/achievements?category=${category}`
      );
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // 获取分类图标
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      毕业论文: <FileTextOutlined />,
      一级项目: <ExperimentOutlined />,
      竞赛作品: <TrophyOutlined />,
      技术专利: <InboxOutlined />,
      期刊论文: <BookOutlined />,
      课程作业: <FolderOpenOutlined />,
    };
    return iconMap[categoryName] || <FilterOutlined />;
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f7f8fa" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              padding: "24px 32px",
            }}
          >
            <Title
              level={2}
              style={{ margin: "0 0 24px", textAlign: "center", color: "#333" }}
            >
              成果展示
            </Title>
            <Divider style={{ margin: "0 0 24px" }} />

            <Row gutter={[16, 24]}>
              <Col xs={24}>
                <Input.Search
                  placeholder="搜索成果标题、作者或专业"
                  allowClear
                  enterButton={<Button type="primary">搜索</Button>}
                  size="middle"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  style={{
                    width: "100%",
                    maxWidth: 600,
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              </Col>

              <Col xs={24}>
                <Space
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "8px 12px",
                  }}
                >
                  {/* 全部分类按钮 */}
                  <Button
                    key="all"
                    type={selectedCategory === "all" ? "primary" : "default"}
                    icon={<FilterOutlined />}
                    onClick={() => handleCategoryChange("all")}
                    size="middle"
                    style={{
                      borderRadius: 20,
                      padding: "6px 16px",
                      boxShadow: "none",
                    }}
                  >
                    全部
                  </Button>

                  {/* 动态生成分类按钮 */}
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      type={
                        selectedCategory === category.name
                          ? "primary"
                          : "default"
                      }
                      icon={getCategoryIcon(category.name)}
                      onClick={() => handleCategoryChange(category.name)}
                      size="middle"
                      style={{
                        borderRadius: 20,
                        padding: "6px 16px",
                        boxShadow: "none",
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>

          <Spin
            spinning={loading}
            tip="加载中..."
            style={{ display: "block", margin: "40px auto" }}
          >
            {achievements.length > 0 ? (
              <>
                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                  {achievements.map((achievement) => (
                    <Col xs={24} sm={12} md={6} key={achievement.id}>
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
                                "https://picsum.photos/id/1/600/400"
                              }
                              alt={achievement.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.5s ease",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.08)")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            />
                            {achievement.recommended && (
                              <Tag
                                icon={<StarOutlined />}
                                color="gold"
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                }}
                              >
                                精选
                              </Tag>
                            )}
                          </div>
                        }
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                          transition: "boxShadow 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(0,0,0,0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.06)")
                        }
                      >
                        <Card.Meta
                          title={
                            <Link
                              to={`/achievement/detail/${achievement.id}`}
                              style={{
                                textDecoration: "none",
                                color: "#1677ff",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  height: 40,
                                }}
                              >
                                {achievement.title}
                              </Text>
                            </Link>
                          }
                          description={
                            <div style={{ marginTop: 8 }}>
                              <Space
                                size="small"
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "4px 8px",
                                  marginBottom: 6,
                                }}
                              >
                                <Tag
                                  color="blue"
                                  style={{ fontSize: 12, padding: "2px 6px" }}
                                >
                                  {achievement.category}
                                </Tag>
                              </Space>

                              <div style={{ fontSize: 12, color: "#666" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 4,
                                  }}
                                >
                                  <span>
                                    <UserOutlined
                                      style={{ fontSize: 12, marginRight: 4 }}
                                    />
                                    {achievement.userName || "未知用户"}
                                  </span>
                                  {achievement.major && (
                                    <Tag color="gray" size="small">
                                      {achievement.major}
                                    </Tag>
                                  )}
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span>
                                    <CalendarOutlined
                                      style={{ fontSize: 12, marginRight: 4 }}
                                    />
                                    {moment(achievement.createTime).format(
                                      "YYYY-MM-DD"
                                    )}
                                  </span>
                                  <span>
                                    <EyeOutlined
                                      style={{ fontSize: 12, marginRight: 4 }}
                                    />
                                    {achievement.views || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          }
                        />

                        <div style={{ marginTop: 12, textAlign: "right" }}>
                          <Button
                            type="link"
                            size="small"
                            onClick={() =>
                              navigate(`/achievement/detail/${achievement.id}`)
                            }
                            style={{
                              padding: 0,
                              height: "auto",
                              color: "#1677ff",
                            }}
                          >
                            查看详情 →
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <div style={{ textAlign: "center", marginTop: 36 }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 项成果`}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 48,
                  textAlign: "center",
                  marginTop: 24,
                }}
              >
                <Empty description={<Text>未找到符合条件的成果</Text>}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSearchText("");
                      setSelectedCategory("all");
                      navigate("/achievements");
                    }}
                  >
                    查看全部成果
                  </Button>
                </Empty>
              </div>
            )}
          </Spin>
        </div>
      </Content>

      <Layout.Footer
        style={{
          textAlign: "center",
          background: "transparent",
          padding: "24px 16px",
          color: "#666",
        }}
      >
        学生成果展示平台 ©{new Date().getFullYear()}
      </Layout.Footer>
    </Layout>
  );
};

export default AchievementsPage;
