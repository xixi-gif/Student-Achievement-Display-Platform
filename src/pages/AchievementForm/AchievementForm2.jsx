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
import dayjs from "dayjs";
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
  // 修改参与者和指导教师为对象数组，包含isTemporary标识
  const [participants, setParticipants] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [oldFiles, setOldFiles] = useState([]);
  const [deleteFiles, setDeleteFiles] = useState([]); // 存储用户删除的文件ID
  const [oldCoverUrl, setOldCoverUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [searchingTeachers, setSearchingTeachers] = useState(false);
  const [studentSearchKeyword, setStudentSearchKeyword] = useState("");
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

  const studentStatusOptions = [
    { value: 0, label: "草稿" },
    { value: 1, label: "进入审核流程" },
  ];

  const CustomDateTimePicker = ({ value, onChange }) => {
    return (
      <DatePicker
        showTime={{
          format: "HH:mm",
          defaultValue: dayjs().set("hour", 8).set("minute", 0),
        }}
        format="YYYY-MM-DD HH:mm"
        value={value ? dayjs(value) : dayjs()}
        onChange={(date, dateString) => {
          onChange(dateString);
        }}
        style={{ width: "100%" }}
        allowClear={false}
        getPopupContainer={(trigger) => trigger.parentElement}
      />
    );
  };

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

            // 处理参与者数据，统一为对象格式
            if (
              achievement.participants &&
              achievement.participants.length > 0
            ) {
              setParticipants(
                achievement.participants.map((participant) =>
                  typeof participant === "string"
                    ? { name: participant, isTemporary: true }
                    : {
                        name: participant.realName || participant.name,
                        userId: participant.userId || participant.id,
                        isTemporary: false,
                      }
                )
              );
            }

            // 设置多个指导教师，统一为对象格式
            if (achievement.instructors && achievement.instructors.length > 0) {
              const formattedInstructors = achievement.instructors
                .map((inst) => {
                  if (typeof inst === "string") {
                    return { name: inst, isTemporary: true };
                  }
                  return {
                    name: inst.realName || inst.name || inst.username,
                    userId: inst.userId || inst.id,
                    isTemporary: false,
                  };
                })
                .filter((item) => item.name); // 过滤掉undefined/null

              setInstructors(formattedInstructors);
            } else if (achievement.instructor) {
              // 处理单个指导教师的多种情况
              let instructorData;
              if (typeof achievement.instructor === "string") {
                instructorData = {
                  name: achievement.instructor,
                  isTemporary: true,
                };
              } else {
                instructorData = {
                  name:
                    achievement.instructor.realName ||
                    achievement.instructor.name,
                  userId:
                    achievement.instructor.userId || achievement.instructor.id,
                  isTemporary: false,
                };
              }
              setInstructors([instructorData]);
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
            if (achievement.videos && achievement.videos.length > 0) {
              const videoFiles = achievement.videos.map((video) => ({
                uid: `video-${video.id}`,
                id: video.id,
                name: video.name || `video-${video.id}.mp4`,
                url: video.url,
                size: video.size,
                status: "done",
                isOld: true,
              }));
              setVideoFiles([videoFiles]);

              // 将旧视频添加到oldFiles中
              setOldFiles((prev) => [
                ...prev,
                ...achievement.videos.map((video) => ({
                  id: video.id,
                  fileUrl: video.url,
                  fileName: video.name || `video-${video.id}.mp4`,
                  fileType: "video",
                  fileSize: video.size,
                })),
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
            // 默认添加当前用户作为参与者
            setParticipants([
              {
                name: userInfo.realName || username,
                userId: userInfo.id,
                isTemporary: false,
              },
            ]);
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
        // 使用函数式更新确保状态正确
        setDeleteFiles((prev) => {
          const newDeleteFiles = [...prev, file.id];
          console.log("更新删除文件列表:", newDeleteFiles);
          return newDeleteFiles;
        });
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
    multiple: true,
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
        // 使用函数式更新确保状态正确
        setDeleteFiles((prev) => {
          const newDeleteFiles = [...prev, file.id];
          console.log("更新删除文件列表:", newDeleteFiles);
          return newDeleteFiles;
        });
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
        // 使用函数式更新确保状态正确
        setDeleteFiles((prev) => {
          const newDeleteFiles = [...prev, file.id];
          console.log("更新删除文件列表:", newDeleteFiles);
          return newDeleteFiles;
        });
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
    if (!studentSearchKeyword.trim()) return;

    setSearchingStudents(true);
    try {
      const response = await achievementApi.searchStudents({
        keyword: studentSearchKeyword,
      });
      if (response.code === 0) {
        const students = response.data;
        if (students.length === 0) {
          // 无搜索结果，提示可手动输入
          message.info("未找到该学生，可手动添加");
        } else {
          // 展示搜索结果，选择时标记isTemporary: false
          setStudentOptions(
            students.map((student) => ({
              ...student,
              label: student.name || student.realName,
              value: student.id,
            }))
          );
        }
      }
    } catch (error) {
      console.error("搜索学生失败:", error);
    } finally {
      setSearchingStudents(false);
    }
  };

  // 选择搜索到的学生（非临时）
  const handleStudentSelect = (student) => {
    // 检查是否已存在
    const exists = participants.some(
      (p) =>
        (p.userId && p.userId === student.value) ||
        (p.name === student.label && p.isTemporary)
    );

    if (exists) {
      message.warning("该学生已在列表中");
      return;
    }

    setParticipants((prev) => [
      ...prev,
      {
        name: student.label,
        isTemporary: false,
        userId: student.value,
      },
    ]);
    setStudentSearchKeyword("");
    setStudentOptions([]);
  };

  // 手动输入学生（无搜索结果时，临时数据）
  const handleAddManualStudent = () => {
    const name = studentSearchKeyword.trim();
    if (!name) return;

    // 检查是否已存在
    const exists = participants.some((p) => p.name === name);

    if (exists) {
      message.warning("该学生已在列表中");
      return;
    }

    setParticipants((prev) => [...prev, { name, isTemporary: true }]);
    setStudentSearchKeyword("");
  };

  // 教师搜索函数
  const handleTeacherSearch = async () => {
    if (!instructorSearchKeyword.trim()) return;

    setSearchingTeachers(true);
    try {
      const response = await achievementApi.searchTeachers({
        keyword: instructorSearchKeyword,
      });
      if (response.code === 0) {
        const instructors = response.data;
        if (instructors.length === 0) {
          // 无搜索结果，提示可手动输入
          message.info("未找到该教师，可手动添加");
        } else {
          // 展示搜索结果，选择时标记isTemporary: false
          setTeacherOptions(
            instructors.map((instructor) => ({
              ...instructor,
              label:
                instructor.name || instructor.realName || instructor.username,
              value: instructor.id,
            }))
          );
        }
      }
    } catch (error) {
      console.error("搜索教师失败:", error);
    } finally {
      setSearchingTeachers(false);
    }
  };

  // 选择搜索到的教师（非临时）
  const handleInstructorSelect = (teacher) => {
    // 检查是否已存在
    const exists = instructors.some(
      (i) =>
        (i.userId && i.userId === teacher.value) ||
        (i.name === teacher.label && i.isTemporary)
    );

    if (exists) {
      message.warning("该教师已在列表中");
      return;
    }

    setInstructors((prev) => [
      ...prev,
      {
        name: teacher.label,
        isTemporary: false,
        userId: teacher.value,
      },
    ]);
    setInstructorSearchKeyword("");
    setTeacherOptions([]);
  };

  // 手动输入教师（无搜索结果时，临时数据）
  const handleAddManualInstructor = () => {
    const name = instructorSearchKeyword.trim();
    if (!name) return;

    // 检查是否已存在
    const exists = instructors.some((i) => i.name === name);

    if (exists) {
      message.warning("该教师已在列表中");
      return;
    }

    setInstructors((prev) => [...prev, { name, isTemporary: true }]);
    setInstructorSearchKeyword("");
  };

  // 移除指导教师
  const handleRemoveInstructor = (index) => {
    setInstructors(instructors.filter((_, i) => i !== index));
  };

  // 移除参与人员
  const handleRemoveParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  // 表单提交
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      console.log("表单提交开始，删除文件列表:", deleteFiles);

      // 创建FormData
      const formData = new FormData();

      // 1. 添加基本字段
      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("level", values.level);
      formData.append("date", values.date.format("YYYY-MM-DDTHH:mm:ss"));
      formData.append("description", values.description);
      formData.append("price", values.price);

      // 处理状态（管理员和学生都可以设置）
      if (values.status !== undefined) {
        formData.append("status", values.status.toString());
      }

      // 处理参与人员 - 包含isTemporary字段
      participants.forEach((participant, index) => {
        formData.append(`participants[${index}].name`, participant.name);
        formData.append(
          `participants[${index}].isTemporary`,
          participant.isTemporary
        );
      });

      // 处理指导教师
      instructors.forEach((instructor, index) => {
        formData.append(`instructors[${index}].name`, instructor.name);
        formData.append(
          `instructors[${index}].isTemporary`,
          instructor.isTemporary
        );
      });

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
        console.log("要删除的文件ID:", deleteFiles);
        if (deleteFiles.length > 0) {
          deleteFiles.forEach((id) => {
            formData.append("deleteFiles", id);
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
      videoFiles.forEach((file) => {
        if (file && file.originFileObj && !file.isOld) {
          formData.append("videos", file.originFileObj);
        }
      });

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

      if (isEditMode) {
        response = await achievementApi.updateAchievement(formData, config);
      } else {
        if (isAdmin()) {
          response = await adminApi.addAchievement(formData, config);
        } else {
          response = await achievementApi.createAchievement(formData, config);
        }
      }

      if (response.code === 0) {
        const successMessage = isAdmin()
          ? isEditMode
            ? "成果更新成功"
            : "成果创建成功"
          : values.status === 1
          ? "成果已创建，等待审核"
          : "成果已保存为草稿";

        message.success(successMessage);
        navigate(-1);
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
    navigate(-1);
  };

  // 管理员专用的状态选择字段
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

  // 学生状态选择字段
  const renderStudentStatusField = () => {
    if (isAdmin()) return null;

    return (
      <Form.Item
        name="status"
        label="成果状态"
        rules={[{ required: true, message: "请选择成果状态" }]}
        initialValue={0}
      >
        <Select placeholder="请选择成果状态">
          {studentStatusOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
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
                  {(file.fileSize / 1024).toFixed(2)} KB
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
                {/* 学生状态选择字段 */}
                <Col span={24}>{renderStudentStatusField()}</Col>

                <Col span={24}>
                  <Form.Item
                    name="date"
                    label="完成日期"
                    rules={[{ required: true, message: "请选择成果完成日期" }]}
                  >
                    <CustomDateTimePicker />
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
                    {/* 已选参与人标签 */}
                    <Space size="small" wrap style={{ marginBottom: 12 }}>
                      {participants.map((participant, index) => (
                        <Badge
                          key={index}
                          color="#1890ff"
                          text={
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {participant.name}
                              <CloseOutlined
                                style={{
                                  marginLeft: 5,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onClick={() => handleRemoveParticipant(index)}
                              />
                            </span>
                          }
                        />
                      ))}
                    </Space>

                    {/* 搜索输入框 */}
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

                    {/* 搜索结果与手动添加选项 */}
                    <div style={{ marginTop: 8 }}>
                      {/* 显示搜索结果（如有） */}
                      {studentOptions.length > 0 && (
                        <div
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            marginBottom: 8, // 与手动添加按钮保持距离
                          }}
                        >
                          {studentOptions.map((option) => (
                            <div
                              key={option.value}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                              }}
                              onClick={() => handleStudentSelect(option)}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 始终显示手动添加按钮（当有输入时） */}
                      {studentSearchKeyword.trim() && (
                        <Button
                          type="dashed"
                          onClick={handleAddManualStudent}
                          style={{ width: "100%" }}
                        >
                          {studentOptions.length > 0
                            ? `添加新参与人: "${studentSearchKeyword}"`
                            : `未找到 "${studentSearchKeyword}"，手动添加`}
                        </Button>
                      )}
                    </div>
                  </div>
                </Form.Item>
               
                <Form.Item label="指导教师" rules={[{ required: false }]}>
                  <div>
                    {/* 已选指导教师标签 */}
                    <Space size="small" wrap style={{ marginBottom: 12 }}>
                      {instructors.map((instructor, index) => (
                        <Badge
                          key={index}
                          color="#52c41a"
                          text={
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {instructor.name}
                              <CloseOutlined
                                style={{
                                  marginLeft: 5,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onClick={() => handleRemoveInstructor(index)}
                              />
                            </span>
                          }
                        />
                      ))}
                    </Space>

                    {/* 搜索输入框 */}
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

                    {/* 搜索结果与手动添加选项 */}
                    <div style={{ marginTop: 8 }}>
                      {/* 显示搜索结果（如有） */}
                      {teacherOptions.length > 0 && (
                        <div
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            marginBottom: 8,
                            maxHeight: 200,
                            overflowY: "auto",
                          }}
                        >
                          {teacherOptions.map((option) => (
                            <div
                              key={option.value}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: "#fff",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#f5f5f5")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#fff")
                              }
                              onClick={() => handleInstructorSelect(option)}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 始终显示手动添加按钮（当有输入时） */}
                      {instructorSearchKeyword.trim() && (
                        <Button
                          type="dashed"
                          onClick={handleAddManualInstructor}
                          style={{ width: "100%" }}
                        >
                          {teacherOptions.length > 0
                            ? `添加新指导教师: "${instructorSearchKeyword}"`
                            : `未找到 "${instructorSearchKeyword}"，手动添加`}
                        </Button>
                      )}
                    </div>
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
                  extra="支持MP4格式，单个文件不超过100MB"
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
