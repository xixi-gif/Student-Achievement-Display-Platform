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
  Modal,
  Image,
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
  EyeOutlined,
  DeleteOutlined,
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
  const [oldFiles, setOldFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]); // 新增：存储用户删除的文件ID
  const [oldCoverUrl, setOldCoverUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [searchingTeachers, setSearchingTeachers] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [instructorSearchKeyword, setInstructorSearchKeyword] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // 判断是否是管理员
  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  // 成果级别选项
  const levels = [
    { value: "校级", label: "校级" },
    { value: "市级", label: "市级" },
    { value: "省级", label: "省级" },
    { value: "国家级", label: "国家级" },
    { value: "国际级", label: "国际级" },
  ];

  // 获取分类数据
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

  // 获取标签数据
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
        const username = localStorage.getItem("username") || "用户";
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
              ...(isAdmin() && { status: achievement.status }),
            });
            setParticipants(achievement.participants || []);

            // 设置多个指导教师
            if (achievement.instructors && achievement.instructors.length > 0) {
              setInstructors(
                achievement.instructors.map((inst) => inst.name || inst)
              );
            } else if (achievement.instructor) {
              // 兼容旧数据：单个指导教师
              setInstructors([
                achievement.instructor.name || achievement.instructor,
              ]);
            }

            // 保存旧封面图URL
            setOldCoverUrl(achievement.cover);

            // 处理图片文件
            if (achievement.images && achievement.images.length > 0) {
              const imageFileList = achievement.images.map((img) => ({
                uid: `image-${img.id}`,
                id: img.id,
                name: img.name || `image-${img.id}.jpg`,
                url: img.url,
                size: img.size,
                status: "done",
                isOld: true,
                thumbUrl: img.url,
              }));
              setImageFiles(imageFileList);

              // 将旧图片添加到oldFiles中
              setOldFiles((prev) => [
                ...prev,
                ...achievement.images.map((img) => ({
                  id: img.id,
                  fileUrl: img.url,
                  fileName: img.name || `image-${img.id}.jpg`,
                  fileType: "image",
                  fileSize: img.size,
                })),
              ]);
            }

            // 处理视频文件
            if (achievement.video && achievement.video.length > 0) {
              const videoFile = {
                uid: `video-${achievement.video[0].id}`,
                id: achievement.video[0].id,
                name: achievement.video[0].name || "video.mp4",
                url: achievement.video[0].url,
                size: achievement.video[0].size,
                status: "done",
                isOld: true,
                type: "video",
              };
              setVideoFiles([videoFile]);

              // 将旧视频添加到oldFiles中
              setOldFiles((prev) => [
                ...prev,
                {
                  id: achievement.video[0].id,
                  fileUrl: achievement.video[0].url,
                  fileName: achievement.video[0].name || "video.mp4",
                  fileType: "video",
                  fileSize: achievement.video[0].size,
                },
              ]);
            }

            // 处理附件文件
            if (achievement.files && achievement.files.length > 0) {
              const attachmentFileList = achievement.files.map((file) => ({
                uid: `file-${file.id}`,
                id: file.id,
                name: file.name || `file-${file.id}`,
                url: file.url,
                size: file.size,
                status: "done",
                isOld: true,
              }));
              setAttachmentFiles(attachmentFileList);

              // 将旧附件添加到oldFiles中
              setOldFiles((prev) => [
                ...prev,
                ...achievement.files.map((file) => ({
                  id: file.id,
                  fileUrl: file.url,
                  fileName: file.name || `file-${file.id}`,
                  fileType: "attachment",
                  fileSize: file.size,
                })),
              ]);
            }
          }
        } else {
          // 创建模式：设置默认值
          form.setFieldsValue({
            date: moment(),
            level: levels[0].value,
            keywords: [],
            ...(isAdmin() && { status: 0 }),
          });
          if (!isAdmin()) {
            setParticipants([userInfo.realName || username]);
          } else {
            setParticipants([]);
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

  // 图片上传配置
  const uploadImageProps = {
    name: "images",
    multiple: true,
    listType: "picture-card",
    beforeUpload: (file) => {
      // 检查文件类型和大小
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("只能上传图片文件!");
        return Upload.LIST_IGNORE;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("图片必须小于10MB!");
        return Upload.LIST_IGNORE;
      }

      return false;
    },
    onChange: (info) => {
      let fileList = [...info.fileList];

      // 为本地文件生成预览URL
      fileList = fileList.map((file) => {
        if (file.originFileObj && !file.url) {
          file.url = URL.createObjectURL(file.originFileObj);
          file.thumbUrl = URL.createObjectURL(file.originFileObj);
        }
        return file;
      });

      setImageFiles(fileList);
    },
    onRemove: (file) => {
      if (file.isOld && file.id) {
        // 记录被删除的旧文件ID
        setDeletedFiles((prev) => [...prev, file.id]);
        // 从oldFiles中移除
        setOldFiles(oldFiles.filter((old) => old.id !== file.id));
      }

      // 从imageFiles中移除
      setImageFiles(imageFiles.filter((item) => item.uid !== file.uid));

      // 释放创建的URL
      if (file.url && file.url.startsWith("blob:")) {
        URL.revokeObjectURL(file.url);
      }

      return true;
    },
    onPreview: (file) => {
      setPreviewImage(file.url || file.thumbUrl);
      setPreviewVisible(true);
    },
    fileList: imageFiles,
  };

  // 视频上传配置
  const uploadVideoProps = {
    name: "videos",
    multiple: false,
    beforeUpload: (file) => {
      const isVideo = file.type.startsWith("video/");
      if (!isVideo) {
        message.error("只能上传视频文件!");
        return Upload.LIST_IGNORE;
      }

      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        message.error("视频必须小于100MB!");
        return Upload.LIST_IGNORE;
      }

      return false;
    },
    onChange: (info) => {
      const { fileList } = info;
      setVideoFiles(fileList);
    },
    onRemove: (file) => {
      if (file.isOld && file.id) {
        // 记录被删除的旧文件ID
        setDeletedFiles((prev) => [...prev, file.id]);
        // 从oldFiles中移除
        setOldFiles(oldFiles.filter((old) => old.id !== file.id));
      }

      setVideoFiles(videoFiles.filter((item) => item.uid !== file.uid));

      return true;
    },
    fileList: videoFiles,
  };

  // 附件上传配置
  const uploadAttachmentProps = {
    name: "files",
    multiple: true,
    beforeUpload: () => false,
    onChange: (info) => {
      const { fileList } = info;
      setAttachmentFiles(fileList);
    },
    onRemove: (file) => {
      if (file.isOld && file.id) {
        // 记录被删除的旧文件ID
        setDeletedFiles((prev) => [...prev, file.id]);
        // 从oldFiles中移除
        setOldFiles(oldFiles.filter((old) => old.id !== file.id));
      }

      setAttachmentFiles(
        attachmentFiles.filter((item) => item.uid !== file.uid)
      );

      return true;
    },
    fileList: attachmentFiles,
  };

  // 学生搜索函数
  const handleStudentSearch = async () => {
    if (!studentSearchKeyword.trim()) {
      setStudentOptions([]);
      return;
    }

    try {
      setSearchingStudents(true);
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

      // 封面图处理
      if (imageFiles.length > 0) {
        const firstImage = imageFiles[0];
        if (firstImage.url) {
          formData.append("cover", firstImage.url);
        }
      } else if (oldCoverUrl) {
        formData.append("cover", oldCoverUrl);
      }

      // 3. 编辑模式特有字段
      if (isEditMode) {
        formData.append("id", id);

        // 传递需要删除的文件ID列表
        // 传递需要删除的文件ID列表
      if (deletedFiles.length > 0) {
        formData.append("deletedFileIds", JSON.stringify(deletedFiles));
      }

        // 传递需要保留的旧文件信息
        if (oldFiles.length > 0) {
          oldFiles.forEach((file, index) => {
            if (file) {
              if (file.id) {
                formData.append(`oldFiles[${index}].id`, file.id.toString());
              }
              formData.append(`oldFiles[${index}].fileUrl`, file.fileUrl || "");
              formData.append(
                `oldFiles[${index}].fileName`,
                file.fileName || ""
              );
              formData.append(
                `oldFiles[${index}].fileType`,
                file.fileType || ""
              );
              formData.append(
                `oldFiles[${index}].fileSize`,
                file.fileSize?.toString() || "0"
              );
            }
          });
        }
      }

      // 4. 文件上传处理 - 只上传新文件
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
        formData.append("video", videoFiles[0].originFileObj);
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
        if (isEditMode) {
          response = await achievementApi.updateAchievement(formData, config);
        } else {
          response = await adminApi.addAchievement(formData, config);
        }
      } else {
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
          navigate("/admin/achievements-manage");
        } else {
          navigate("/student/my-achievements");
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

  // 自定义文件列表渲染
  const renderFileList = (fileList, type) => {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {fileList.map((file) => (
          <div
            key={file.uid}
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              maxWidth: "300px",
            }}
          >
            {type === "image" && file.url ? (
              <img
                src={file.url}
                alt={file.name}
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
            ) : (
              <FileTextOutlined style={{ fontSize: "24px" }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: "bold",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.name}
              </div>
              {file.fileSize && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>

            <Space>
              {type === "image" && file.url && (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setPreviewImage(file.url);
                    setPreviewVisible(true);
                  }}
                />
              )}
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (type === "image") {
                    uploadImageProps.onRemove(file);
                  } else if (type === "video") {
                    uploadVideoProps.onRemove(file);
                  } else {
                    uploadAttachmentProps.onRemove(file);
                  }
                }}
              />
            </Space>
          </div>
        ))}
      </div>
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
                  <div>
                    {renderFileList(imageFiles, "image")}
                    <Upload {...uploadImageProps}>
                      <Button
                        icon={<UploadOutlined />}
                        style={{ marginTop: 16 }}
                      >
                        上传图片
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>

                <Form.Item
                  name="videos"
                  label="成果视频"
                  extra="最多上传一个视频，支持MP4格式，单个文件不超过100MB"
                >
                  <div>
                    {renderFileList(videoFiles, "video")}
                    <Upload {...uploadVideoProps}>
                      <Button
                        icon={<VideoCameraOutlined />}
                        style={{ marginTop: 16 }}
                      >
                        上传视频（可选）
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>

                <Form.Item
                  name="files"
                  label="相关文件"
                  extra="支持PDF/Word/PPT等格式，单个文件不超过10MB"
                >
                  <div>
                    {renderFileList(attachmentFiles, "attachment")}
                    <Upload {...uploadAttachmentProps}>
                      <Button
                        icon={<UploadOutlined />}
                        style={{ marginTop: 16 }}
                      >
                        上传相关文件（可选）
                      </Button>
                    </Upload>
                  </div>
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

        {/* 图片预览模态框 */}
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="auto"
          style={{ maxWidth: "90vw" }}
        >
          <img alt="预览" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </Content>
    </Layout>
  );
};

export default AchievementFormPage;
