import React, { useState, useEffect } from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  Card,
  Select,
  Upload,
  Space,
  Divider,
  message,
  Spin,
  DatePicker,
  Badge,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import moment from "moment";
import { achievementApi, adminApi } from "../../service/api";

const { Content } = Layout;
const { TextArea } = Input;

const AchievementCreationPage = () => {
  const navigate = useNavigate();
  const { string_id } = useParams();
  const id = string_id ? Number(string_id) : undefined; //给后端传整数型的id而不是字符串类型
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // 获取分类的数据
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await adminApi.getCategoryList();
        if (response.code === 0) {
          setCategories(
            response.data.map((item) => ({
              value: item.id || item.tag_id,
              label: item.name || item.tag_name,
            }))
          );
        }
      } catch (error) {
        console.error("获取分类失败:", error);
        message.error("获取分类数据失败");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 添加获取标签的数据
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const response = await adminApi.getTagList();
        if (response.code === 0) {
          setTags(
            response.data.map((tag) => ({
              value: tag.id || tag.tagId,
              label: tag.name || tag.tagName,
            }))
          );
        }
      } catch (error) {
        console.error("获取标签失败:", error);
        message.error("获取标签数据失败");
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const levels = [
    { value: "校级", label: "校级" },
    { value: "市级", label: "市级" },
    { value: "省级", label: "省级" },
    { value: "国家级", label: "国家级" },
    { value: "国际级", label: "国际级" },
  ];

  // 图片上传配置
  const uploadImageProps = {
    name: "images",
    multiple: true,
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info) => {
      const { fileList } = info;
      setImageFiles(fileList);
    },
    fileList: imageFiles,
  };

  // 视频上传配置
  const uploadVideoProps = {
    name: "videos",
    multiple: true,
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info) => {
      const { fileList } = info;
      setVideoFiles(fileList);
    },
    onRemove: (file) => {
      setVideoFiles(videoFiles.filter((item) => item.uid !== file.uid));
    },
    fileList: videoFiles,
  };

  // 附件上传配置
  const uploadAttachmentProps = {
    name: "files",
    multiple: true,
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info) => {
      const { fileList } = info;
      setAttachmentFiles(fileList);
    },
    onRemove: (file) => {
      setAttachmentFiles(
        attachmentFiles.filter((item) => item.uid !== file.uid)
      );
    },
    fileList: attachmentFiles,
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const role = localStorage.getItem("user_role") || "student";
        const username = localStorage.getItem("username") || "访客";
        const userInfo = JSON.parse(
          localStorage.getItem("user_info") || "null"
        ) || {
          role,
          username,
          realName: username,
        };

        setCurrentUser(userInfo);

        if (id) {
          // 如果是编辑模式，获取已有成果数据
          const response = await achievementApi.getDetail(Number(id));
          if (response.code === 0) {
            const achievement = response.data;
            form.setFieldsValue({
              ...achievement,
              date: moment(achievement.date),
              keywords: achievement.keywords.join(","),
            });
            setParticipants(achievement.participants || []);
          }
        } else {
          form.setFieldsValue({
            date: moment(),
          });
          setParticipants([userInfo.realName || username]);
        }

        setLoading(false);
      } catch (error) {
        console.error("加载数据失败:", error);
        message.error("加载数据失败");
        setLoading(false);
      }
    };

    loadUserData();
  }, [form, id]);

  const handleAddParticipant = () => {
    if (!newParticipant.trim()) {
      message.warning("请输入参与人员姓名");
      return;
    }

    if (participants.includes(newParticipant.trim())) {
      message.warning("该人员已在列表中");
      return;
    }

    setParticipants([...participants, newParticipant.trim()]);
    setNewParticipant("");
  };

  const handleRemoveParticipant = (name) => {
    setParticipants(participants.filter((item) => item !== name));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      // 1. 处理关键词
      formData.append('keywords', JSON.stringify(values.keywords));

      // 2. 处理文件（覆盖Upload自动注入）
      imageFiles.forEach((file) => {
        formData.delete("images"); // 先清除自动注入的字段
        formData.append("images", file.originFileObj);
      });
      // 添加视频文件
      videoFiles.forEach((file) => {
        formData.delete("videos"); // 先清除自动注入的字段
        formData.append("videos", file.originFileObj);
      });

      // 添加附件文件
      attachmentFiles.forEach((file) => {
        formData.delete("files"); // 先清除自动注入的字段
        formData.append("files", file.originFileObj);
      });

      // 3. 其他必须字段
      const requiredFields = [
        "title",
        "category",
        "level",
        "description",
        "instructor",
        "price",
      ];
      requiredFields.forEach((field) => {
        if (values[field]) formData.append(field, values[field]);
      });

      // 4. 特殊字段
      formData.append("date", values.date.format("YYYY-MM-DD"));
      formData.append("participants", JSON.stringify(participants));

      // 5. 调试输出
      for (let [key, val] of formData.entries()) {
        console.log(key, val instanceof Blob ? `[BLOB] ${val.name}` : val);
      }

      if (id) {
        // 更新已有成果
        const response = await achievementApi.updateAchievement(id, formData);
        if (response.code === 0) {
          message.success("成果更新成功");
          navigate("/student/my-achievements");
        } else {
          message.error(response.message || "更新失败");
        }
      } else {
        // 创建新成果
        const response = await achievementApi.createAchievement(formData);
        if (response.code === 0) {
          message.success("成果发布成功，等待审核");
          navigate("/student/my-achievements");
        } else {
          message.error(response.message || "发布失败");
        }
      }
    } catch (error) {
      console.error("提交失败:", error);
      message.error("表单填写有误，请检查后重试");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar currentUser={currentUser} />
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar currentUser={currentUser} />

      <Content
        style={{
          background: "#f0f2f5",
          padding: "30px 5%",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Card
            title={
              <span>
                {id ? (
                  <>
                    <FileTextOutlined /> 编辑成果
                  </>
                ) : (
                  <>
                    <UploadOutlined /> 发布新成果
                  </>
                )}
              </span>
            }
            bordered={false}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                level: "school",
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>基本信息</h3>

                <Form.Item
                  name="title"
                  label="成果标题"
                  rules={[
                    { required: true, message: "请输入成果标题" },
                    { min: 5, message: "标题长度至少5个字符" },
                    { max: 100, message: "标题长度不能超过100个字符" },
                  ]}
                >
                  <Input
                    placeholder="请输入成果的标题"
                    prefix={<FileTextOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="成果分类"
                  rules={[{ required: true, message: "请选择成果分类" }]}
                >
                  <Select
                    loading={categoriesLoading}
                    placeholder="请选择成果所属分类"
                    showSearch
                    optionFilterProp="children"
                  >
                    {categories.map((cat) => (
                      <Select.Option key={cat.value} value={cat.label}>
                        {cat.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="level"
                  label="成果级别"
                  rules={[{ required: true, message: "请选择成果级别" }]}
                >
                  <Select placeholder="请选择成果的级别">
                    {levels.map((level) => (
                      <Select.Option key={level.value} value={level.value}>
                        {level.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="date"
                  label="完成日期"
                  rules={[{ required: true, message: "请选择成果完成日期" }]}
                >
                  <DatePicker
                    placeholder="选择成果完成的日期"
                    style={{ width: "100%" }}
                    prefix={<CalendarOutlined />}
                  />
                </Form.Item>
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>详细信息</h3>

                <Form.Item
                  name="description"
                  label="成果描述"
                  rules={[
                    { required: true, message: "请输入成果描述" },
                    { min: 30, message: "描述内容至少30个字符" },
                    { max: 2000, message: "描述内容不能超过2000个字符" },
                  ]}
                >
                  <TextArea
                    placeholder="请详细描述成果的背景、实现过程、创新点和应用价值等内容..."
                    rows={8}
                    showCount
                  />
                </Form.Item>

                <Form.Item label="参与人员（可选）">
                  <div>
                    <Space size="small" wrap style={{ marginBottom: 12 }}>
                      {participants.map((name, index) => (
                        <Badge
                          key={index}
                          color="#1890ff"
                          text={
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {name}
                              <CloseOutlined
                                style={{
                                  marginLeft: 5,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onClick={() => handleRemoveParticipant(name)}
                              />
                            </span>
                          }
                        />
                      ))}
                    </Space>

                    <Space.Compact style={{ width: "100%" }}>
                      <Input
                        placeholder="请输入参与人员姓名"
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        onPressEnter={handleAddParticipant}
                      />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddParticipant}
                      >
                        添加
                      </Button>
                    </Space.Compact>

                    <p style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                      可添加多位参与人员，也可全部删除（个人项目）
                    </p>
                  </div>
                </Form.Item>

                <Form.Item name="instructor" label="指导教师">
                  <Input placeholder="请输入指导教师姓名（如无指导教师可留空）" />
                </Form.Item>

                <Form.Item
                  name="keywords"
                  label="关键词"
                  rules={[
                    { required: true, message: "请选择至少一个关键词" },
                    {
                      validator: (_, value) => {
                        if (!value || value.length === 0) {
                          return Promise.reject("请至少选择一个关键词");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择关键词"
                    loading={tagsLoading}
                    options={tags}
                    optionFilterProp="label"
                    showSearch
                    allowClear
                  />
                </Form.Item>
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>价格信息</h3>

                <Form.Item
                  name="price"
                  label="价格信息"
                  rules={[
                    { required: true, message: "请输入价格信息" },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject("请输入价格信息");
                        }

                        const fixedPriceRegex = /^\d+(\.\d{1,2})?$/;
                        const rangePriceRegex =
                          /^\d+(\.\d{1,2})?\s*-\s*\d+(\.\d{1,2})?$/;
                        const negotiableRegex = /^面议$/i;

                        if (
                          fixedPriceRegex.test(value) ||
                          rangePriceRegex.test(value) ||
                          negotiableRegex.test(value)
                        ) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          "请输入有效的价格格式（如：50、50-100 或 面议）"
                        );
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="请输入价格（支持格式：50、50-100、面议）"
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>成果附件</h3>

                <Form.Item
                  name="images"
                  label="成果图片"
                  rules={[
                    { required: true, message: "请至少上传一张成果图片" },
                  ]}
                >
                  <Upload {...uploadImageProps} listType="picture-card">
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  </Upload>
                </Form.Item>

                <Form.Item name="videos" label="成果视频">
                  <Upload {...uploadVideoProps} listType="text">
                    <Button icon={<VideoCameraOutlined />}>
                      上传视频（可选）
                    </Button>
                    <p style={{ color: "#666", marginTop: 8 }}>
                      支持上传MP4、AVI等常见视频格式，单个文件不超过100MB
                    </p>
                  </Upload>
                </Form.Item>

                <Form.Item name="files" label="相关文件">
                  <Upload
                    name="files"
                    {...uploadAttachmentProps}
                    listType="text"
                    multiple
                  >
                    <Button icon={<UploadOutlined>上传文件</UploadOutlined>}>
                      上传相关文件（可选）
                    </Button>
                    <p style={{ color: "#666", marginTop: 8 }}>
                      支持上传PDF、Word、PPT等格式文件，单个文件不超过10MB
                    </p>
                  </Upload>
                </Form.Item>
              </div>

              <Divider />

              <Form.Item>
                <Space
                  size="middle"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Button
                    type="primary"
                    icon={id ? <CheckCircleOutlined /> : <UploadOutlined />}
                    onClick={handleSubmit}
                    loading={submitting}
                    size="large"
                  >
                    {id ? "更新成果" : "提交发布"}
                  </Button>

                  <Button
                    type="default"
                    onClick={() =>
                      navigate(
                        id
                          ? `/achievement/detail/${id}`
                          : "/student/my-achievements"
                      )
                    }
                    size="large"
                    disabled={submitting}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>

              {!id && (
                <div
                  style={{ textAlign: "center", color: "#666", fontSize: 12 }}
                >
                  <p>提交后将进入审核流程，审核通过后将在成果展示区公开显示</p>
                  <p>请确保所提交的成果内容真实有效，不得涉及违规信息</p>
                </div>
              )}
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AchievementCreationPage;
