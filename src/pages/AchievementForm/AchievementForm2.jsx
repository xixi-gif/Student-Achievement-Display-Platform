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
  Row,
  Col,
  Typography,
  AutoComplete,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  PlusOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import moment from "moment";
import { achievementApi, adminApi } from "../../service/api";

const { Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const AchievementFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [oldFiles, setOldFiles] = useState([]); // 存储需要保留的旧文件
  const [oldCoverUrl, setOldCoverUrl] = useState(""); // 存储旧封面图URL
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [searchingTeachers, setSearchingTeachers] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState(""); // 学生搜索关键词
  const [instructors, setInstructors] = useState([]); // 存储多个指导教师
  const [instructorSearchKeyword, setInstructorSearchKeyword] = useState(""); // 教师搜索关键词

  //判断是否是管理员
  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  // 成果级别选项，与后端Achievement实体的level字段对应
  const levels = [
    { value: "校级", label: "校级" },
    { value: "市级", label: "市级" },
    { value: "省级", label: "省级" },
    { value: "国家级", label: "国家级" },
    { value: "国际级", label: "国际级" },
  ];

  // 获取分类数据，与后端CategoryService对应
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await adminApi.getCategoryList();
        if (response.code === 0) {
          setCategories(
            response.data.map((item) => ({
              value: item.name,
              label: item.name,
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
              value: tag.name || tag.tagName,
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

  // 初始化用户数据和表单数据
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
          realName: localStorage.getItem("realName"),
        };

        setCurrentUser(userInfo);

        if (isEditMode) {
          // 编辑模式：获取已有成果数据
          const response = await achievementApi.getDetail(Number(id));
          if (response.code === 0) {
            const achievement = response.data;
            form.setFieldsValue({
              title: achievement.title,
              category: achievement.category,
              level: achievement.level,
              date: moment(achievement.date),
              description: achievement.description,
              keywords: achievement.keywords || [],
              price: achievement.price,
              // 管理员编辑时可以设置状态
              ...(isAdmin() && { status: achievement.status }),
            });
            setParticipants(achievement.participants || []);
            // 设置多个指导教师（从 instructor 改为 instructors）
            if (achievement.instructors && achievement.instructors.length > 0) {
              setInstructors(
                achievement.instructors.map((inst) => inst.realName || inst)
              );
            } else if (achievement.instructor) {
              // 兼容旧数据：单个指导教师
              setInstructors([
                achievement.instructor.realName || achievement.instructor,
              ]);
            }

            // 保存旧封面图URL
            setOldCoverUrl(achievement.cover);

            // 加载已有图片（转换为上传组件需要的格式）
            if (achievement.images && achievement.images.length > 0) {
              const imageFileList = achievement.images.map((img, index) => ({
                uid: `img-${index}`,
                name: img.fileName || `image-${index}.jpg`,
                url: img.fileUrl,
                status: "done",
                isOld: true,
                id: img.id, // 保存文件ID用于后端识别
              }));
              setImageFiles(imageFileList);
            }

            // 加载已有视频
            if (achievement.videos) {
              const videoFileList = [
                {
                  uid: "video-0",
                  name: achievement.videos.fileName || "video.mp4",
                  url: achievement.videos.fileUrl,
                  status: "done",
                  isOld: true,
                  id: achievement.videos.id, // 保存文件ID用于后端识别
                },
              ];
              setVideoFiles(videoFileList);
            }

            // 加载已有附件
            if (achievement.files && achievement.files.length > 0) {
              // 过滤掉可能为null或undefined的文件
              const validFiles = achievement.files.filter(
                (file) => file != null
              );

              setOldFiles(
                validFiles.map((file) => ({
                  id: file.id || 0,
                  fileUrl: file.fileUrl || "",
                  fileName: file.fileName || "",
                  fileType: file.fileType || "",
                  fileSize: file.fileSize || 0,
                }))
              );

              const attachmentFileList = validFiles.map((file, index) => ({
                uid: `file-${index}`,
                name: file.fileName || `file-${index}`,
                url: file.fileUrl,
                status: "done",
                isOld: true,
                id: file.id || 0,
              }));
              setAttachmentFiles(attachmentFileList);
            }
          }
        } else {
          // 创建模式：设置默认值
          form.setFieldsValue({
            date: moment(),
            level: levels[0].value,
            keywords: [],
            // 管理员创建时可以设置默认状态
            ...(isAdmin() && { status: 0 }), // 默认设置为草稿状态
          });
          if (!isAdmin()) {
            setParticipants([userInfo.realName || username]);
          } else {
            setParticipants([]); // 管理员创建时参与者为空
          }
        }
      } catch (error) {
        console.error("加载数据失败:", error);
        message.error("加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [form, id, isEditMode]);

  // 图片上传配置修正
  const uploadImageProps = {
    name: "images",
    multiple: true,
    beforeUpload: () => false,
    onChange: (info) => {
      const { fileList } = info;
      setImageFiles(fileList);
    },
    onRemove: (file) => {
      setImageFiles(imageFiles.filter((item) => item && item.uid !== file.uid));
      // 如果删除的是旧文件，从oldFiles中移除
      if (file.isOld && file.id) {
        setOldFiles(oldFiles.filter((old) => old && old.id !== file.id));
      }
    },
    fileList: imageFiles,
  };

  // 视频上传配置修正
  const uploadVideoProps = {
    name: "videos",
    multiple: false,
    beforeUpload: () => false,
    onChange: (info) => {
      const { fileList } = info;
      setVideoFiles(fileList);
    },
    onRemove: (file) => {
      setVideoFiles(videoFiles.filter((item) => item && item.uid !== file.uid));
      if (file.isOld && file.id) {
        setOldFiles(oldFiles.filter((old) => old && old.id !== file.id));
      }
    },
    fileList: videoFiles,
  };

  // 附件上传配置修正
  const uploadAttachmentProps = {
    name: "files",
    multiple: true,
    beforeUpload: () => false,
    onChange: (info) => {
      const { fileList } = info;
      setAttachmentFiles(fileList);
    },
    onRemove: (file) => {
      setAttachmentFiles(
        attachmentFiles.filter((item) => item && item.uid !== file.uid)
      );
      if (file.isOld && file.id) {
        setOldFiles(oldFiles.filter((old) => old && old.id !== file.id));
      }
    },
    fileList: attachmentFiles,
  };

  const handleStudentSearch = async () => {
    if (!studentSearchKeyword.trim()) {
      setStudentOptions([]);
      return;
    }

    try {
      setSearchingStudents(true);
      // 使用正确的API调用方式
      const response = await achievementApi.searchStudents({
        keyword: studentSearchKeyword.trim(),
        limit: 10,
      });

      if (response.code === 0) {
        setStudentOptions(
          response.data.map((student) => ({
            value: student.name,
            label: `${student.name} (${student.userNo})`,
            key: student.userId,
          }))
        );
      }
    } catch (error) {
      console.error("搜索学生失败:", error);
      message.error("搜索学生失败");
      setStudentOptions([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  // 教师搜索函数
  const handleTeacherSearch = async () => {
    if (!instructorSearchKeyword.trim()) {
      setTeacherOptions([]);
      return;
    }

    try {
      setSearchingTeachers(true);
      const response = await achievementApi.searchTeachers({
        keyword: instructorSearchKeyword.trim(),
        limit: 10,
      });

      if (response.code === 0) {
        setTeacherOptions(
          response.data.map((teacher) => ({
            value: teacher.name,
            label: `${teacher.name} (${teacher.userNo})`,
            key: teacher.userId,
          }))
        );
      }
    } catch (error) {
      console.error("搜索老师失败:", error);
      message.error("搜索老师失败");
      setTeacherOptions([]);
    } finally {
      setSearchingTeachers(false);
    }
  };

  // 教师选择处理函数
  const handleInstructorSelect = (teacherName) => {
    // 检查是否已存在
    const alreadyExists = instructors.includes(teacherName);
    if (alreadyExists) {
      message.warning("该教师已在列表中");
      return;
    }

    setInstructors([...instructors, teacherName]);
    setTeacherOptions([]);
    setInstructorSearchKeyword("");
  };

  // 移除指导教师
  const handleRemoveInstructor = (nameToRemove) => {
    setInstructors(instructors.filter((name) => name !== nameToRemove));
  };

  // 移除参与人员
  const handleRemoveParticipant = (nameToRemove) => {
    setParticipants(
      participants.filter((participant) =>
        typeof participant === "string"
          ? participant !== nameToRemove
          : participant.realName !== nameToRemove
      )
    );
  };

  // 表单提交
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();

      // 创建FormData
      const formData = new FormData();

      // 1. 添加基本字段
      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("level", values.level);
      formData.append("date", values.date.format("YYYY-MM-DDTHH:mm:ss"));
      formData.append("description", values.description);
      formData.append("price", values.price);

      // 管理员可以设置状态
      if (isAdmin() && values.status) {
        formData.append("status", values.status.toString());
      }

      // 数组字段格式
      // 处理参与人员
      const participantsList = participants.map((participant) =>
        typeof participant === "string" ? participant : participant.realName
      );
      formData.append("participants", JSON.stringify(participantsList));

      // 处理指导教师
      formData.append("instructors", JSON.stringify(instructors));

      // 处理关键词
      if (values.keywords) {
        formData.append("keywords", JSON.stringify(values.keywords));
      } else {
        formData.append("keywords", JSON.stringify([]));
      }

      // 3. 编辑模式特有字段
      if (isEditMode) {
        formData.append("id", id);

        // 处理旧文件信息 - 添加安全检查
        oldFiles.forEach((file, index) => {
          // 安全检查：确保file对象存在
          if (file) {
            if (file.id) {
              formData.append(`oldFiles[${index}].id`, file.id.toString());
            }
            if (file.fileUrl) {
              formData.append(`oldFiles[${index}].fileUrl`, file.fileUrl);
            }
            if (file.fileName) {
              formData.append(`oldFiles[${index}].fileName`, file.fileName);
            }
            if (file.fileType) {
              formData.append(`oldFiles[${index}].fileType`, file.fileType);
            }
            if (file.fileSize) {
              formData.append(
                `oldFiles[${index}].fileSize`,
                file.fileSize.toString()
              );
            } else {
              formData.append(`oldFiles[${index}].fileSize`, "0");
            }
          }
        });

        // 封面图处理
        if (oldCoverUrl) {
          formData.append("cover", oldCoverUrl);
        }
      }

      // 4. 文件上传处理
      // 图片文件
      imageFiles.forEach((file) => {
        if (file && file.originFileObj && !file.isOld) {
          formData.append("images", file.originFileObj);
        }
      });

      // 视频文件
      if (
        videoFiles.length > 0 &&
        videoFiles[0] &&
        videoFiles[0].originFileObj &&
        !videoFiles[0].isOld
      ) {
        formData.append("videos", videoFiles[0].originFileObj);
      }

      // 附件文件
      attachmentFiles.forEach((file) => {
        if (file && file.originFileObj && !file.isOld) {
          formData.append("files", file.originFileObj);
        }
      });

      // 5. 提交请求
      let response;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isAdmin()) {
        // 管理员使用管理员接口
        if (isEditMode) {
          // 管理员编辑 - 使用普通编辑接口或特殊的管理员编辑接口
          response = await achievementApi.updateAchievement(formData, config);
        } else {
          // 管理员创建
          response = await adminApi.addAchievement(formData, config);
        }
      } else {
        // 学生使用普通接口
        if (isEditMode) {
          response = await achievementApi.updateAchievement(formData, config);
        } else {
          response = await achievementApi.createAchievement(formData, config);
        }
      }

      if (response.code === 0) {
        const successMessage = isAdmin()
          ? isEditMode
            ? "成果更新成功"
            : "成果创建成功"
          : isEditMode
          ? "成果更新成功，等待审核"
          : "成果发布成功，等待审核";

        message.success(successMessage);

        // 根据用户角色跳转到不同的页面
        if (isAdmin()) {
          navigate("/admin/achievements-manage"); // 管理员跳转到管理页面
        } else {
          navigate("/student/my-achievements"); // 学生跳转到我的成果页面
        }
      } else {
        message.error(response.message || "操作失败");
      }
    } catch (error) {
      console.error("提交失败:", error);
      if (error.response) {
        console.error("错误响应:", error.response.data);
        message.error(
          `提交失败: ${error.response.data.message || "服务器错误"}`
        );
      } else {
        message.error("网络错误或表单填写有误，请检查后重试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    if (isAdmin()) {
      navigate("/admin/achievements-manage");
    } else if (isEditMode) {
      navigate(`/achievement/detail/${id}`);
    } else {
      navigate("/student/my-achievements");
    }
  };

  // 在表单中添加管理员专用的状态选择字段
  const renderAdminStatusField = () => {
    if (!isAdmin()) return null;

    return (
      <Form.Item
        name="status"
        label="成果状态"
        rules={[{ required: true, message: "请选择成果状态" }]}
      >
        <Select placeholder="请选择成果状态">
          <Option value={0}>草稿</Option>
          <Option value={1}>审核中</Option>
          <Option value={2}>已发布</Option>
          <Option value={3}>已驳回</Option>
          <Option value={4}>老师已通过</Option>
        </Select>
      </Form.Item>
    );
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
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Card
            title={
              <Space>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleCancel}
                >
                  返回
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  {isEditMode
                    ? `${isAdmin() ? "更新" : "编辑"}成果`
                    : `${isAdmin() ? "创建" : "发布"}新成果`}
                </Title>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                level: "校级",
              }}
            >
              {/* 基本信息部分 */}
              <Divider orientation="center" plain>
                基本信息
              </Divider>
              <Row gutter={16}>
                <Col span={24}>
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
                </Col>

                <Col xs={24} md={12}>
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
                        <Option key={cat.value} value={cat.value}>
                          {cat.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="level"
                    label="成果级别"
                    rules={[{ required: true, message: "请选择成果级别" }]}
                  >
                    <Select placeholder="请选择成果的级别">
                      {levels.map((level) => (
                        <Option key={level.value} value={level.value}>
                          {level.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* 管理员状态选择字段 */}
                {renderAdminStatusField()}

                <Col span={24}>
                  <Form.Item
                    name="date"
                    label="完成日期"
                    rules={[{ required: true, message: "请选择成果完成日期" }]}
                  >
                    <DatePicker
                      placeholder="选择成果完成的日期"
                      style={{ width: "100%" }}
                      suffixIcon={<CalendarOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* 详细信息部分 */}
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
                <Form.Item label="参与人员">
                  <div>
                    <Space size="small" wrap style={{ marginBottom: 12 }}>
                      {participants.map((participant, index) => (
                        <Badge
                          key={index}
                          color="#1890ff"
                          text={
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {typeof participant === "string"
                                ? participant
                                : participant.realName}{" "}
                              <CloseOutlined
                                style={{
                                  marginLeft: 5,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onClick={() =>
                                  handleRemoveParticipant(
                                    typeof participant === "string"
                                      ? participant
                                      : participant.realName
                                  )
                                }
                              />
                            </span>
                          }
                        />
                      ))}
                    </Space>

                    <Space.Compact style={{ width: "100%" }}>
                      <Input
                        placeholder="输入姓名搜索学生"
                        value={studentSearchKeyword}
                        onChange={(e) =>
                          setStudentSearchKeyword(e.target.value)
                        }
                        onPressEnter={handleStudentSearch}
                      />
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleStudentSearch}
                        loading={searchingStudents}
                      >
                        搜索
                      </Button>
                    </Space.Compact>

                    {/* 显示搜索结果 */}
                    {studentOptions.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          border: "1px solid #d9d9d9",
                          borderRadius: 4,
                        }}
                      >
                        {studentOptions.map((option) => (
                          <div
                            key={option.key}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                            onClick={() => {
                              // 添加选中的学生
                              const alreadyExists = participants.some((p) =>
                                typeof p === "string"
                                  ? p === option.value
                                  : p.realName === option.value
                              );

                              if (alreadyExists) {
                                message.warning("该人员已在列表中");
                                return;
                              }

                              setParticipants([
                                ...participants,
                                {
                                  userId: option.key,
                                  realName: option.value,
                                  userNo:
                                    option.label.match(/\((.*?)\)/)?.[1] || "",
                                },
                              ]);
                              setStudentSearchKeyword("");
                              setStudentOptions([]);
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Item>

                <Form.Item label="指导教师" rules={[{ required: false }]}>
                  <div>
                    <Space size="small" wrap style={{ marginBottom: 12 }}>
                      {instructors.map((instructor, index) => (
                        <Badge
                          key={index}
                          color="#52c41a"
                          text={
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {instructor}
                              <CloseOutlined
                                style={{
                                  marginLeft: 5,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onClick={() =>
                                  handleRemoveInstructor(instructor)
                                }
                              />
                            </span>
                          }
                        />
                      ))}
                    </Space>

                    <Space.Compact style={{ width: "100%" }}>
                      <Input
                        placeholder="输入姓名搜索指导教师"
                        value={instructorSearchKeyword}
                        onChange={(e) =>
                          setInstructorSearchKeyword(e.target.value)
                        }
                        onPressEnter={handleTeacherSearch}
                      />
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleTeacherSearch}
                        loading={searchingTeachers}
                      >
                        搜索
                      </Button>
                    </Space.Compact>

                    {/* 显示搜索结果 */}
                    {teacherOptions.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          border: "1px solid #d9d9d9",
                          borderRadius: 4,
                          maxHeight: 200,
                          overflowY: "auto",
                        }}
                      >
                        {teacherOptions.map((option) => (
                          <div
                            key={option.key}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f0f0f0",
                              backgroundColor: "#fff",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f5f5f5";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#fff";
                            }}
                            onClick={() => handleInstructorSelect(option.value)}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Item>
                <Form.Item
                  name="keywords"
                  label="关键词"
                  rules={[
                    { required: true },
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

              {/* 价格信息 */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>价格信息</h3>

                <Form.Item
                  name="price"
                  label="价格"
                  rules={[
                    { required: true, message: "请输入价格信息" },
                    {
                      validator: (_, value) => {
                        // 支持三种格式：具体价格、价格区间、面议
                        const validFormats = [
                          /^\d+(\.\d{1,2})?$/, // 具体价格：50、99.99
                          /^\d+(\.\d{1,2})?-\d+(\.\d{1,2})?$/, // 价格区间：50-100、99.99-199.99
                          /^面议$/, // 面议
                        ];

                        if (!value) {
                          return Promise.reject(new Error("请输入价格信息"));
                        }

                        const isValid = validFormats.some((regex) =>
                          regex.test(value)
                        );
                        if (!isValid) {
                          return Promise.reject(
                            new Error(
                              "请输入有效价格格式（如：50、50-100、面议）"
                            )
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="请输入价格（如：50、50-100、面议）"
                    prefix={<DollarOutlined />}
                    suffix="元"
                  />
                </Form.Item>
              </div>

              <Divider />

              {/* 成果附件 */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>成果附件</h3>

                <Form.Item
                  name="images"
                  label="成果图片"
                  rules={
                    isEditMode
                      ? [] // 编辑模式不校验
                      : [{ required: true, message: "请至少上传一张成果图片" }]
                  }
                  extra="支持JPG/PNG格式，单张图片不超过10MB"
                >
                  <Upload {...uploadImageProps} listType="picture-card">
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="videos"
                  label="成果视频"
                  extra="支持MP4格式，单个文件不超过100MB"
                >
                  <Upload {...uploadVideoProps} listType="text">
                    <Button icon={<VideoCameraOutlined />}>
                      上传视频（可选）
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="files"
                  label="相关文件"
                  extra="支持PDF/Word/PPT等格式，单个文件不超过10MB"
                >
                  <Upload {...uploadAttachmentProps} listType="text">
                    <Button icon={<UploadOutlined />}>
                      上传相关文件（可选）
                    </Button>
                  </Upload>
                </Form.Item>
              </div>

              <Divider />

              {/* 表单操作按钮 */}
              <Form.Item>
                <Space
                  size="large"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Button
                    type="primary"
                    icon={
                      isEditMode ? <CheckCircleOutlined /> : <UploadOutlined />
                    }
                    onClick={handleSubmit}
                    loading={submitting}
                    size="large"
                  >
                    {isEditMode
                      ? `${isAdmin() ? "更新" : "编辑"}成果`
                      : `${isAdmin() ? "创建" : "发布"}新成果`}
                  </Button>

                  <Button
                    type="default"
                    onClick={handleCancel}
                    size="large"
                    disabled={submitting}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>

              {!isEditMode && !isAdmin() && (
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

export default AchievementFormPage;
