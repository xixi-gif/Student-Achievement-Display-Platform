import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Modal, message, Tag, Space, Avatar, Row,
  Col, Popconfirm, Tabs, Layout, Form, Radio,
  Table, Checkbox, Spin, InputNumber, Progress, Upload } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, LockOutlined, 
  UserOutlined, TeamOutlined, PlusOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, UploadOutlined, FilterOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import Navbar from "../Navbar/Navbar";
import api, { adminApi , authApi } from "../../service/api";
import { getAvatarUrl, importTemplateColumns, handleFileUploadHelper, exportTemplateHelper } from "./UserManageHelpers";
import { getTableColumns, getFilteredUsers, exportToExcel } from "./UserManageTableUtils";

const { Search } = Input;
const { TabPane } = Tabs;
const { Header, Content, Footer } = Layout;

const UserManage = () => {
  // 状态管理
  const [users, setUsers] = useState({ students: [], teachers: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPwdModalVisible, setResetPwdModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newUserType, setNewUserType] = useState("student");
  const [newUserForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [adding, setAdding] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importType, setImportType] = useState("student");
  const [fileList, setFileList] = useState([]);
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    status: [],
    major: [],
    department: []
  });
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 头像上传相关状态
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const fileDataRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 获取用户列表
  const fetchUserList = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        role: activeTab === "students" ? "student" : "teacher",
        keyword: searchKeyword || undefined,
        status: columnFilters.status.length > 0 ? columnFilters.status.join(",") : undefined,
        isDeleted: 0,
        ...(activeTab === "students" && columnFilters.major.length > 0 
          ? { major: columnFilters.major.join(",") } 
          : {}),
        ...(activeTab === "teachers" && columnFilters.department.length > 0 
          ? { department: columnFilters.department.join(",") } 
          : {})
      };
      const response = await adminApi.getUserList(params);
      if (response.code === 0) {
        const { records, total: totalCount } = response.data;
        const formattedUsers = records.map(user => ({
          id: user.id,
          realName: user.realname || '未知姓名',
          name: user.name || '',
          userName: user.userAccount || '',
          password: user.userPassword,
          avatar: getAvatarUrl(user.avatar, user.name),
          email: user.email || '',
          phone: user.phone || '',
          role: user.userRole || (activeTab === "students" ? "student" : "teacher"),
          status: user.status === "正常" ? 'active' : 'inactive',
          studentId: user.studentId || "",
          className: user.className || "",
          major: user.major || "",
          teacherId: user.teacherId || "",
          department: user.department || "",
          title: user.title || "",
          achievementCount: user.achievementCount || 0,
          lastLogin: user.lastLoginTime 
            ? new Date(user.lastLoginTime).toLocaleString() 
            : "从未登录"
        }));
        setUsers(prev => ({ ...prev, [activeTab]: formattedUsers }));
        setTotal(totalCount);
      } else {
        message.error(response.message || "获取用户列表失败");
      }
    } catch (error) {
      console.error("获取用户列表错误：", error);
      message.error("网络错误，无法获取用户列表");
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      const role = localStorage.getItem("user_role") || "visitor";
      const username = localStorage.getItem("username") || "访客";
      const userAvatar = localStorage.getItem("user_avatar") || "";
      setCurrentUser({
        role,
        username,
        avatar: getAvatarUrl(userAvatar, username),
      });
      await fetchUserList();
    };
    init();
  }, [currentPage, pageSize, activeTab, searchKeyword, columnFilters]);

  // 搜索处理
  const handleSearch = (value) => {
    setSearchKeyword(value.toLowerCase());
    setSelectedIds([]);
    setCurrentPage(1);
  };

  // 列筛选处理
  const handleColumnFilter = (columnKey, values) => {
    setColumnFilters(prev => ({ ...prev, [columnKey]: values }));
    setSelectedIds([]);
    setCurrentPage(1);
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (keys) => setSelectedIds(keys),
    selectAllCheckboxProps: {
      disabled: loading,
    },
  };

  // // 切换用户状态
  // const handleToggleStatus = async (user) => {
  //   const newStatus = user.status === "active" ? "inactive" : "active";
  //   try {
  //     const response = await adminApi.updateUser({ 
  //       id: user.id,
  //       status: newStatus === "active" ? "正常" : "禁用"
  //     });
  //     if (response.code === 0) {
  //       message.success(`已${newStatus === "active" ? "启用" : "禁用"} ${user.realName}`);
  //       fetchUserList();
  //     } else {
  //       message.error(response.message || "状态更新失败");
  //     }
  //   } catch (error) {
  //     console.error("更新状态错误：", error);
  //     message.error("网络错误，状态更新失败");
  //   }
  // };

  // 批量切换状态
  const handleBatchToggleStatus = async (enable) => {
    if (selectedIds.length === 0) {
      message.warning("请先选择用户");
      return;
    }

    setBatchActionLoading(true);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const user = users[activeTab].find(u => u.id === id);
        const response = await adminApi.updateUser({
          id: id,
          status: enable ? 0 : 1,
          userRole: user?.role,
          realName: user?.realName,
          userName: user?.userName,
          email: user?.email,
          phone: user?.phone
        });
        if (response.code === 0) successCount++;
      }
      message.success(`成功${enable ? "启用" : "禁用"} ${successCount}/${selectedIds.length} 个用户`);
      setSelectedIds([]);
      fetchUserList();
    } catch (error) {
      console.error("批量更新状态错误：", error);
      message.error("网络错误，批量操作失败");
    } finally {
      setBatchActionLoading(false);
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      message.warning("请先选择用户");
      return;
    }

    Modal.confirm({
      title: `确定删除选中的 ${selectedIds.length} 个用户吗？`,
      content: "此操作不可撤销，请谨慎操作！",
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        setBatchActionLoading(true);
        try {
          let successCount = 0;
          for (const id of selectedIds) {
            const response = await adminApi.deleteUser({ id });
            if (response.code === 0) successCount++;
          }
          message.success(`成功删除 ${successCount}/${selectedIds.length} 个用户`);
          setSelectedIds([]);
          fetchUserList();
        } catch (error) {
          console.error("批量删除错误：", error);
          message.error("网络错误，批量删除失败");
        } finally {
          setBatchActionLoading(false);
        }
      },
    });
  };

  // 批量重置密码
  const handleBatchResetPassword = async () => {
    if (selectedIds.length === 0) {
      message.warning("请先选择用户");
      return;
    }

    Modal.confirm({
      title: `确定重置选中的 ${selectedIds.length} 个用户的密码吗？`,
      content: "密码将被重置为初始密码123456789，请提醒用户及时修改。",
      okText: "确认重置",
      cancelText: "取消",
      onOk: async () => {
        setBatchActionLoading(true);
        try {
          let successCount = 0;
          const userNames = [];
          for (const id of selectedIds) {
            const user = users[activeTab].find(u => u.id === id);
            if (user) userNames.push(user.realName);
            const response = await adminApi.resetUserPassword(id, "123456789");
            if (response.code === 0) successCount++;
          }
          message.success(`已重置 ${successCount}/${selectedIds.length} 个用户的密码: ${userNames.join(", ")}`);
          setSelectedIds([]);
        } catch (error) {
          console.error("批量重置密码错误：", error);
          message.error("网络错误，批量重置密码失败");
        } finally {
          setBatchActionLoading(false);
        }
      },
    });
  };
  const handleEditSubmit = async () => {
  if (!selectedUser) return;
  
  try {
    const values = await editForm.validateFields();
    
    const updateData = {
      id: selectedUser.id,
      // 保留双角色逻辑，用 selectedUser.role 动态判断
      userRole: selectedUser.role || (activeTab === "students" ? "student" : "teacher"),
      userName: selectedUser.userName,
      // 状态值用数字（0/1），与后端 Integer 类型匹配
      status: values.status === "active" ? 0 : 1,  
      realName: values.name,
      email: values.email,
      phone: values.phone || "",
      
      // 关键修改：学生学号字段用 studentNo，而非 studentId
      ...(selectedUser.role === "student" && {
        studentNo: selectedUser.studentId, // 前端本地存的是 studentId，传递时用后端需要的 studentNo
        grade: values.grade,
        major: values.major
      }),
      ...(selectedUser.role === "teacher" && {
        department: values.department,
        title: values.title,
        // 教师工号字段同理，若后端用 teacherNo 则改这里
        teacherId: values.teacherId
      })
    };

    console.log("最终提交参数：", updateData); // 确认已无 studentId

    const response = await adminApi.updateUser(updateData);
    if (response.code === 0) {
      message.success("用户状态已更新");
      setEditModalVisible(false);
      fetchUserList();
    } else {
      message.error(`更新失败: ${response.message || '未知错误'}`);
    }
  } catch (error) {
    if (error.name !== "ValidateError") {
      console.error("更新错误详情:", error);
      message.error("网络错误，更新失败");
    }
  }
};





  // 修改handleEditSubmit函数中针对学生的参数处理部分
// const handleEditSubmit = async () => {
//   if (!selectedUser) return;
  
//   try {
//     const values = await editForm.validateFields();
    
//     // 构建更新数据对象
//     const updateData = {
//       id: selectedUser.id,
//       userRole: "student", // 明确指定学生角色，避免动态获取可能出现的问题
//       userName: selectedUser.userName,
//       status: values.status === "active" ? "正常" : "禁用", // 确保状态是数字类型
//       realName: values.name,
//       email: values.email,
//       phone: values.phone || "",
      
//       // 学生特有字段 - 关键修复：确保所有必要字段都被传递
//       ...(selectedUser.role === "student" && {
//         studentId: selectedUser.studentId, // 必须传递学号，后端可能以此作为关键标识
//         className: values.className,
//         major: values.major,
//         // 补充可能需要的其他学生字段
//         achievementCount: values.achievementCount || 0
//       }),
//       ...(selectedUser.role === "teacher" && {
//         department: values.department,
//         title: values.title,
//         teacherId: values.teacherId
//       })
//     };

//     // 调试信息：确认参数正确性
//     console.log("学生更新参数:", updateData);

//     const response = await adminApi.updateUser(updateData);
//     if (response.code === 0) {
//       message.success("用户状态已更新");
//       setEditModalVisible(false);
//       fetchUserList(); // 强制刷新列表
//     } else {
//       message.error(`更新失败: ${response.message || '未知错误'}`);
//     }
//   } catch (error) {
//     if (error.name !== "ValidateError") {
//       console.error("更新错误详情:", error);
//       message.error("网络错误，更新失败");
//     }
//   }
// };
const handleToggleStatus = async (user) => {
  const newStatus = user.status === "active" ? "禁用" : "正常"; 
  try {
    const updateData = {
      id: user.id,
      status: newStatus,
      userRole: user.role, 
      userName: user.userName,
      ...(user.role === "student" && {
        studentNo: user.studentId 
      }),
      ...(user.role === "teacher" && {
        teacherId: user.teacherId 
      })
    };

    const response = await adminApi.updateUser(updateData);
    if (response.code === 0) {
      message.success(`已${newStatus === 0 ? "启用" : "禁用"} ${user.realName}`);
      fetchUserList();
    } else {
      message.error(response.message || "状态更新失败");
    }
  } catch (error) {
    console.error("更新状态错误：", error);
    message.error("网络错误，状态更新失败");
  }
};
// const handleToggleStatus = async (user) => {
//   if (user.role !== "student") return;
  
//   const newStatus = user.status === "active" ? 1 : 0; // 直接使用数字状态值
//   try {
//     const response = await adminApi.updateUser({ 
//       id: user.id,
//       status: newStatus,
//       userRole: "student", // 明确传递角色
//       userName: user.userName,
//       studentId: user.studentId // 传递学号
//     });
//     if (response.code === 0) {
//       message.success(`已${newStatus === 0 ? "启用" : "禁用"} ${user.realName}`);
//       fetchUserList();
//     } else {
//       message.error(response.message || "状态更新失败");
//     }
//   } catch (error) {
//     console.error("更新状态错误：", error);
//     message.error("网络错误，状态更新失败");
//   }
// };

// // 同时检查学生状态切换的单独处理函数（如果有）
// const handleToggleStatus = async (user) => {
//   if (user.role !== "student") return; // 确保只处理学生
  
//   const newStatus = user.status === "active" ? 1 : 0; // 直接使用数字状态值
//   try {
//     const response = await adminApi.updateUser({ 
//       id: user.id,
//       status: newStatus,
//       userRole: "student", // 明确传递角色
//       userName: user.userName,
//       studentId: user.studentId // 传递学号
//     });
//     if (response.code === 0) {
//       message.success(`已${newStatus === 0 ? "启用" : "禁用"} ${user.realName}`);
//       fetchUserList();
//     } else {
//       message.error(response.message || "状态更新失败");
//     }
//   } catch (error) {
//     console.error("更新状态错误：", error);
//     message.error("网络错误，状态更新失败");
//   }
// };
    
  

  // 添加用户
  const handleAddUser = async () => {
    setAdding(true);
    try {
      const values = await newUserForm.validateFields();
      const userData = {
        userAccount: newUserType === "student" ? values.studentId : values.teacherId,
        userAvatar: "",
        realName: values.realname,
        userRole: newUserType,
        email: values.email,
        phone: values.phone || "",
        ...(newUserType === "student" && {
          studentId: values.studentId,
          className: values.className,
          major: values.major
        }),
        ...(newUserType === "teacher" && {
          teacherId: values.teacherId,
          department: values.department,
          title: values.title
        }),
        password: "123456789",
        status: 0
      };

      const response = await adminApi.createUser(userData);
      if (response.code === 0) {
        message.success(`成功添加${newUserType === "student" ? "学生" : "教师"}`);
        setAddModalVisible(false);
        newUserForm.resetFields();
        fetchUserList();
      } else {
        message.error(response.message || "添加失败");
      }
    } catch (error) {
      if (error.name !== "ValidateError") {
        console.error("添加用户错误：", error);
        message.error("网络错误，添加失败");
      }
    } finally {
      setAdding(false);
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      const response = await adminApi.deleteUser({ id });
      if (response.code === 0) {
        message.success("用户已删除");
        fetchUserList();
        setSelectedIds(prev => prev.filter(item => item !== id));
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      console.error("删除用户错误：", error);
      message.error("网络错误，删除失败");
    }
  };

  // 验证学号唯一性
  const validateStudentId = async (_, value) => {
    try {
      const response = await adminApi.checkIdExists({ type: 'student', id: value });
      if (response.code === 0 && response.data.exists) {
        return Promise.reject("该学号已存在");
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject("验证失败，请稍后重试");
    }
  };

  // 验证工号唯一性
  const validateTeacherId = async (_, value) => {
    try {
      const response = await adminApi.checkIdExists({ type: 'teacher', id: value });
      if (response.code === 0 && response.data.exists) {
        return Promise.reject("该工号已存在");
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject("验证失败，请稍后重试");
    }
  };

  // 文件上传处理
  const handleFileUpload = (file) => {
    return handleFileUploadHelper(file, importType, users, setImportData);
  };

  // 导入用户数据
  const handleImport = async () => {
    const validData = importData.filter(item => item._valid);
    if (validData.length === 0) {
      message.warning("没有有效数据可导入");
      return;
    }

    setImporting(true);
    try {
      let successCount = 0;
      for (const item of validData) {
        const userData = {
          userAccount: importType === "student" ? item.studentId : item.teacherId,
          userAvatar: "",
          realName: item.name,
          userRole: importType,
          email: item.email,
          phone: item.phone || "",
          password: item.password || "123456789",
          status: 0,
          ...(importType === "student" && {
            studentId: item.studentId,
            className: item.className,
            major: item.major
          }),
          ...(importType === "teacher" && {
            teacherId: item.teacherId,
            department: item.department,
            title: item.title
          })
        };
        const response = await adminApi.createUser(userData);
        if (response.code === 0) successCount++;
      }
      message.success(`成功导入 ${successCount}/${validData.length} 条数据`);
      setImportResult({
        total: validData.length,
        success: successCount,
        failed: validData.length - successCount
      });
      fetchUserList();
    } catch (error) {
      console.error("导入用户错误：", error);
      message.error("网络错误，导入失败");
    } finally {
      setImporting(false);
    }
  };

  // 处理重置密码
  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetPwdModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (user) => {
    if (!user) {
      message.warning("未找到用户数据");
      return;
    }
    
    setSelectedUser(user);
    // 根据用户角色设置表单字段值，修复字段不匹配问题
    editForm.setFieldsValue({
      name: user.realName,
      [user.role === "student" ? "className" : "title"]: user[user.role === "student" ? "className" : "title"],
      [user.role === "student" ? "major" : "department"]: user[user.role === "student" ? "major" : "department"],
      email: user.email,
      phone: user.phone,
      status: user.status,
      ...(user.role === "teacher" && { teacherId: user.teacherId })
    });
    setEditModalVisible(true);
  };

  // 确认重置密码
  const confirmResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await adminApi.resetUserPassword(selectedUser.id, "123456789");
      if (response.code === 0) {
        message.success(`已重置 ${selectedUser.realName} 的密码为123456789`);
        setResetPwdModalVisible(false);
      } else {
        message.error(response.message || "重置密码失败");
      }
    } catch (error) {
      console.error("重置密码错误：", error);
      message.error("网络错误，重置密码失败");
    }
  };

  

  // // 提交编辑表单
  // const handleEditSubmit = async () => {
  //   if (!selectedUser) return;
    
  //   try {
  //     const values = await editForm.validateFields();
  //     const originalData = selectedUser;
      
  //     // 检查是否有实际修改
  //     const hasChanges = Object.keys(values).some(key => {
  //       const originalValue = originalData[key === 'className' ? 'className' : 
  //                            key === 'major' ? 'major' : 
  //                            key === 'department' ? 'department' : 
  //                            key === 'title' ? 'title' : 
  //                            originalData[key]];
  //       return values[key] !== originalValue;
  //     });

  //     if (!hasChanges) {
  //       message.info("未修改任何用户信息");
  //       return;
  //     }

  //     const updateData = {
  //       id: selectedUser.id,
  //       realName: values.name,
  //       email: values.email,
  //       phone: values.phone || "",
  //       status: values.status === "active" ? 0 : 1,  
  //       userRole: selectedUser.role || (activeTab === "students" ? "student" : "teacher"),
  //       userName: selectedUser.userName,
  //       ...(selectedUser.role === "student" && {
  //         className: values.className,
  //         major: values.major
  //       }),
  //       ...(selectedUser.role === "teacher" && {
  //         department: values.department,
  //         title: values.title,
  //         teacherId: values.teacherId
  //       })
  //     };


  //     const response = await adminApi.updateUser(updateData);
  //     if (response.code === 0) {
  //       message.success("用户信息已更新");
  //       setEditModalVisible(false);
  //       fetchUserList();
  //     } else {
  //       message.error(response.message || "更新失败");
  //     }
  //   } catch (error) {
  //     if (error.name !== "ValidateError") {
  //       console.error("编辑用户错误：", error);
  //       message.error("网络错误，更新失败");
  //     }
  //   }
  // };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('请选择图片文件（JPG/PNG/WebP等）');
      e.target.value = '';
      return;
    }
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 2) {
      message.error('图片大小不能超过2MB');
      e.target.value = '';
      return;
    }
    
    fileDataRef.current = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
      setPreviewVisible(true);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    if (avatarUploading) return;
    if (currentUser?.role !== 'admin') {
      message.error('仅管理员可修改用户头像');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 取消上传
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    fileDataRef.current = null;
    setAvatarUploading(false);
    setUploadProgress(0);
    setPreviewVisible(false);
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    message.info('已取消上传');
  };


  // 更新头像到用户信息
  const handleAvatarUpdate = async (avatarUrl) => {
    if (!selectedUser) return;
    
    try {
      const updateData = {
        id: selectedUser.id,
        userAvatar: avatarUrl,
        userRole: selectedUser.role,
        realName: selectedUser.realName,
        userName: selectedUser.userName,
        email: selectedUser.email,
        phone: selectedUser.phone
      };
      
      const updateResponse = await adminApi.updateUser(updateData);
      if (updateResponse.code === 0) {
        // 更新本地状态
        setUsers(prev => ({
          ...prev,
          [activeTab]: prev[activeTab].map(user => 
            user.id === selectedUser.id ? { ...user, avatar: avatarUrl } : user
          )
        }));
        
        setSelectedUser(prev => prev ? { ...prev, avatar: avatarUrl } : prev);
        message.success('头像已更新');
      } else {
        throw new Error(`更新失败：${updateResponse.message || '用户信息未同步'}`);
      }
    } catch (updateError) {
      message.error(`头像上传成功，但更新用户信息失败：${updateError.message}`);
    }
  };

  // 确认头像上传
  const confirmAvatarUpload = async () => {
    if (!selectedUser) {
      message.warning("未选择用户");
      return;
    }
    
    const file = fileDataRef.current;
    if (!file) {
      message.warning("请先选择图片");
      return;
    }
    
    setAvatarUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadResult = await authApi.uploadAvatar(file, (percent) => {
        setUploadProgress(percent);
      });
      
      let avatarUrl = null;
      if (Array.isArray(uploadResult.data) && uploadResult.data.length > 0) {
        avatarUrl = uploadResult.data[0]?.url;
      } else if (typeof uploadResult.data === 'object' && uploadResult.data !== null) {
        avatarUrl = uploadResult.data.url;
      }
      
      if (!avatarUrl || !/^https?:\/\//.test(avatarUrl.trim())) {
        throw new Error('服务器返回的头像URL无效，请重试');
      }

      // 更新用户头像信息
      await handleAvatarUpdate(avatarUrl);
      
      setUploadProgress(100);
      
      setTimeout(() => {
        setPreviewVisible(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fileDataRef.current = null;
      }, 500);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('头像上传全流程错误:', error);
        const errorMsg = error.code === 401 
          ? '登录已过期，请重新登录后重试' 
          : error.code === 403
            ? '权限不足，无法修改该用户头像'
            : error.message || '上传失败，请稍后重试';
        message.error(errorMsg);
      }
    } finally {
      setTimeout(() => {
        setAvatarUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // 渲染头像上传组件
  const renderAvatarUpload = () => (
    <Form.Item label="头像">
      <Avatar
        src={selectedUser?.avatar || undefined}
        alt={selectedUser?.realName || "用户"}
        size={100}
        style={{ display: "block", margin: "0 auto 16px" }}
      >
        {selectedUser?.realName?.charAt(0) || "未"}
      </Avatar>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <Button 
        type="primary" 
        icon={<UploadOutlined />}
        onClick={triggerFileSelect}
        disabled={avatarUploading}
        style={{ display: 'block', margin: '0 auto' }}
      >
        选择头像
      </Button>
      
      <Modal
        visible={previewVisible}
        title={avatarUploading ? "上传中..." : "预览头像"}
        footer={!avatarUploading ? [
          <Button key="cancel" onClick={cancelUpload}>
            取消
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={confirmAvatarUpload}
          >
            确认上传
          </Button>
        ] : null}
        onCancel={avatarUploading ? undefined : cancelUpload}
        maskClosable={!avatarUploading}
        width={400}
      >
        {avatarUploading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Progress percent={uploadProgress} status="active" />
            <p style={{ marginTop: 16 }}>正在上传，请稍候...</p>
            <Button 
              type="text" 
              onClick={cancelUpload}
              style={{ marginTop: 16 }}
            >
              取消上传
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={previewImage} 
              alt="头像预览" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: 300, 
                borderRadius: 4 
              }}
            />
            {fileDataRef.current && (
              <p style={{ marginTop: 16, color: '#666' }}>
                文件名: {fileDataRef.current.name}
                <br />
                文件大小: {(fileDataRef.current.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        )}
      </Modal>
    </Form.Item>
  );

  // 当前表格数据
  const currentTableData = getFilteredUsers(users, activeTab, searchKeyword, columnFilters);
  const isStudentTab = activeTab === "students";

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fileDataRef.current = null;
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
      <Header style={{ padding: 0, height: 'auto', background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <Navbar currentUser={currentUser} />
      </Header>
      
      <Content style={{ padding: '0 24px', marginTop: 0, flex: 1 }}>
        <div style={{ padding: '16px 0 0', minHeight: 'calc(100vh - 64px)' }}>
          <Card
            title="用户管理"
            bordered={false}
            extra={
              <Space>
                <Search
                  placeholder="搜索姓名/学号/工号/邮箱"
                  allowClear
                  enterButton={<SearchOutlined />}
                  style={{ width: 300 }}
                  onSearch={handleSearch}
                />
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => {
                    setImportModalVisible(true);
                    setImportType(activeTab === "students" ? "student" : "teacher");
                  }}
                >
                  一键导入
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => exportToExcel(
                    currentTableData,
                    isStudentTab,
                    (msg) => message.success(msg),
                    (msg) => message.error(msg)
                  )}
                  loading={exporting}
                >
                  导出Excel
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                  loading={adding}
                >
                  添加用户
                </Button>
              </Space>
            }
          >
            <div
              style={{
                marginBottom: 16,
                padding: "8px 16px",
                background: "#f0f2f5",
                borderRadius: 4,
                display: selectedIds.length > 0 ? "flex" : "none",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < currentTableData.length}
                  checked={currentTableData.length > 0 && selectedIds.length === currentTableData.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(currentTableData.map(user => user.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  style={{ marginRight: 8 }}
                >
                  已选择 {selectedIds.length} 个用户
                </Checkbox>
              </div>

              <Space>
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleBatchToggleStatus(true)}
                  loading={batchActionLoading}
                >
                  批量启用
                </Button>
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleBatchToggleStatus(false)}
                  loading={batchActionLoading}
                >
                  批量禁用
                </Button>
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  onClick={handleBatchResetPassword}
                  loading={batchActionLoading}
                >
                  重置密码
                </Button>
                <Popconfirm
                  title={`确定删除选中的 ${selectedIds.length} 个用户吗？`}
                  onConfirm={handleBatchDelete}
                  okText="确认删除"
                  cancelText="取消"
                  okType="danger"
                >
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    loading={batchActionLoading}
                  >
                    批量删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                setSelectedIds([]);
                setColumnFilters({
                  status: [],
                  major: [],
                  department: []
                });
              }}
              tabBarExtraContent={
                <Tag style={{ marginRight: 0 }}>
                  总计: {total}人
                </Tag>
              }
            >
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    学生管理
                  </span>
                }
                key="students"
              >
                <Table
                  columns={getTableColumns(
                    true,
                    handleEdit,  // 确保编辑函数正确传递
                    handleResetPassword,
                    handleToggleStatus,
                    handleDelete,
                    columnFilters,
                    handleColumnFilter,
                    users,
                    searchKeyword
                  )}
                  dataSource={currentTableData}
                  rowKey="id"
                  rowSelection={rowSelection}
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: (page, ps) => {
                      setCurrentPage(page);
                      setPageSize(ps);
                    },
                    onShowSizeChange: (page, ps) => {
                      setCurrentPage(page);
                      setPageSize(ps);
                    }
                  }}
                  scroll={{ x: 1200 }}
                  bordered
                  size="middle"
                  title={() => (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>学生列表</span>
                      <Button 
                        type="link" 
                        icon={<FilterOutlined />}
                        onClick={() => setColumnFilters({ status: [], major: [], department: [] })}
                      >
                        清除所有筛选
                      </Button>
                    </div>
                  )}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    教师管理
                  </span>
                }
                key="teachers"
              >
                <Table
                  columns={getTableColumns(
                    false,
                    handleEdit,  // 确保编辑函数正确传递
                    handleResetPassword,
                    handleToggleStatus,
                    handleDelete,
                    columnFilters,
                    handleColumnFilter,
                    users,
                    searchKeyword
                  )}
                  dataSource={currentTableData}
                  rowKey="id"
                  rowSelection={rowSelection}
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: (page, ps) => {
                      setCurrentPage(page);
                      setPageSize(ps);
                    },
                    onShowSizeChange: (page, ps) => {
                      setCurrentPage(page);
                      setPageSize(ps);
                    }
                  }}
                  scroll={{ x: 1200 }}
                  bordered
                  size="middle"
                  title={() => (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>教师列表</span>
                      <Button 
                        type="link" 
                        icon={<FilterOutlined />}
                        onClick={() => setColumnFilters({ status: [], major: [], department: [] })}
                      >
                        清除所有筛选
                      </Button>
                    </div>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>

          {/* 批量导入模态框 */}
          <Modal
            title={`批量导入${importType === "student" ? "学生" : "教师"}数据`}
            visible={importModalVisible}
            width={800}
            onCancel={() => {
              setImportModalVisible(false);
              setFileList([]);
              setImportData([]);
              setImportResult(null);
            }}
            footer={[
              <Button
                key="download"
                onClick={() => exportTemplateHelper(importType)}
              >
                下载模板
              </Button>,
              <Button
                key="cancel"
                onClick={() => {
                  setImportModalVisible(false);
                  setFileList([]);
                  setImportData([]);
                  setImportResult(null);
                }}
              >
                取消
              </Button>,
              <Button
                key="import"
                type="primary"
                onClick={handleImport}
                disabled={importData.length === 0}
                loading={importing}
              >
                开始导入
              </Button>,
            ]}
          >
            <div style={{ marginBottom: 16 }}>
              <Upload
                accept=".xlsx,.xls"
                beforeUpload={handleFileUpload}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>选择Excel文件</Button>
              </Upload>
              {fileList.length > 0 && (
                <span style={{ marginLeft: 8 }}>{fileList[0].name}</span>
              )}
            </div>

            {importData.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Table
                  columns={[
                    ...importTemplateColumns[importType],
                    {
                      title: "状态",
                      dataIndex: "_valid",
                      render: (valid) => (
                        <Tag color={valid ? "green" : "red"}>
                          {valid ? "有效" : "无效"}
                        </Tag>
                      ),
                    },
                    {
                      title: "错误信息",
                      dataIndex: "_errors",
                      render: (errors) => errors?.join("; ") || "-",
                    },
                  ]}
                  dataSource={importData}
                  rowKey="_id"
                  size="small"
                  pagination={false}
                  scroll={{ y: 240 }}
                />
                <div style={{ marginTop: 8 }}>
                  共解析 {importData.length} 条数据，其中{" "}
                  <Tag color="green">
                    {importData.filter((item) => item._valid).length} 条有效
                  </Tag>
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    {importData.filter((item) => !item._valid).length} 条无效
                  </Tag>
                </div>
              </div>
            )}

            {importResult && (
              <div style={{ marginTop: 16 }}>
                <h4>导入结果</h4>
                <p>总条数: {importResult.total}，成功: {importResult.success}，失败: {importResult.failed}</p>
              </div>
            )}
          </Modal>

          {/* 添加用户模态框 */}
          <Modal
            title={`添加${newUserType === "student" ? "学生" : "教师"}`}
            visible={addModalVisible}
            width={700}
            onOk={handleAddUser}
            onCancel={() => {
              setAddModalVisible(false);
              newUserForm.resetFields();
            }}
            confirmLoading={adding}
            okText="提交"
            cancelText="取消"
          >
            <Form form={newUserForm} layout="vertical">
              <Form.Item>
                <Radio.Group
                  value={newUserType}
                  onChange={(e) => setNewUserType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="student">学生</Radio.Button>
                  <Radio.Button value="teacher">教师</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {newUserType === "student" ? (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="学生姓名"
                        rules={[{ required: true, message: "请输入学生姓名" }]}
                      >
                        <Input placeholder="如：张三" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                    <Form.Item
                        name="studentId"
                        label="学号"
                        rules={[
                          { required: true, message: "请输入学号" },
                          { validator: validateStudentId },
                        ]}
                      >
                        <Input placeholder="如：2023611001" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="major"
                        label="专业"
                        rules={[{ required: true, message: "请输入学生专业" }]}
                      >
                        <Input placeholder="如：计算机科学与技术" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                    <Form.Item
                      name="grade"
                      label="年级"
                      rules={[
                        { required: true, message: "请输入年级" } 
                      ]}
                    >
                      <Input placeholder="如：2022级" />
                    </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: "请输入学生邮箱" },
                          {
                            pattern: /^[a-zA-Z0-9._%+-]+@(stu\.)?edu\.cn$/,
                            message: "邮箱格式应为@edu.cn或@stu.edu.cn",
                          },
                        ]}
                      >
                        <Input placeholder="如：25zhangsan@stu.edu.cn" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="电话"
                        rules={[
                          { required: true, message: "请输入学生电话" },
                          {
                            pattern: /^1[3-9]\d{9}$/,
                            message: "请输入11位有效手机号",
                          },
                        ]}
                      >
                        <Input placeholder="如：13800138000" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="教师姓名"
                        rules={[{ required: true, message: "请输入教师姓名" }]}
                      >
                        <Input placeholder="如：李教授" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="teacherId"
                        label="工号"
                        rules={[
                          { required: true, message: "请输入工号" },
                          { pattern: /^T\d{4}$/, message: "工号格式为T+4位数字" },
                          { validator: validateTeacherId },
                        ]}
                      >
                        <Input placeholder="如：T1001" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="部门"
                        rules={[
                          { required: true, message: "请输入教师所属学院" },
                        ]}
                      >
                        <Input placeholder="如：计算机系" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="title"
                        label="职称"
                        rules={[{ required: true, message: "请输入职称" }]}
                      >
                        <Input placeholder="如：教授" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: "请输入邮箱" },
                          {
                            pattern: /^[a-zA-Z0-9._%+-]+@edu\.cn$/,
                            message: "邮箱格式应为@edu.cn",
                          },
                        ]}
                      >
                        <Input placeholder="如：wang@edu.cn" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="电话"
                        rules={[
                          { required: true, message: "请输入电话" },
                          {
                            pattern: /^1[3-9]\d{9}$/,
                            message: "请输入11位有效手机号",
                          },
                        ]}
                      >
                        <Input placeholder="如：13800138000" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
            </Form>
          </Modal>

          {/* 重置密码模态框 */}
          <Modal
            title="确认重置密码"
            visible={resetPwdModalVisible}
            onOk={confirmResetPassword}
            onCancel={() => setResetPwdModalVisible(false)}
            okText="确认重置"
            cancelText="取消"
          >
            <p>
              确定要重置用户 <strong>{selectedUser?.realName}</strong> (
              {selectedUser?.role === "student" ? "学号" : "工号"}:{" "}
              {selectedUser?.studentId || selectedUser?.teacherId}) 的密码吗？
            </p>
            <p>重置后密码将变为123456789，请提醒用户及时修改。</p>
          </Modal>

          {/* 编辑用户模态框 */}
          <Modal
            title={`编辑用户 - ${selectedUser?.realName}`}
            visible={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setEditModalVisible(false)}>
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={handleEditSubmit}>
                保存
              </Button>,
            ]}
            width={700}
          >
            {selectedUser && (
              <Form form={editForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    {renderAvatarUpload()}
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      label="姓名"
                      name="name"
                      rules={[{ required: true, message: "请输入姓名" }]}
                    >
                      <Input />
                    </Form.Item>

                    {selectedUser.role === "teacher" && (
                      <Form.Item
                        label="工号"
                        name="teacherId"
                        rules={[
                          { required: true, message: "请输入工号" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    )}
                    
                    {selectedUser.role === "student" && (
                      <Form.Item
                        label="学号"
                      >
                        <Input value={selectedUser.studentId} disabled />
                      </Form.Item>
                    )}
                  </Col>
                </Row>

                {selectedUser.role === "student" ? (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="major"
                          label="专业"
                          rules={[{ required: true, message: "请输入专业" }]}
                        >
                          <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="grade"
                        label="年级"
                        rules={[{ required: true, message: "请输入年级" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="学院"
                        rules={[{ required: true, message: "请输入学院" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="title"
                        label="职称"
                        rules={[{ required: true, message: "请输入职称" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { type: "email", message: "请输入有效的邮箱地址" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: "请输入手机号" },
                      { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>


              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: "请选择状态" }]}
              >
                <Radio.Group>
                  <Radio value="active">正常</Radio>
                  <Radio value="inactive">禁用</Radio>
                </Radio.Group>
              </Form.Item>

              {selectedUser.role === "student" && (
                <Form.Item
                  label="成果数"
                  name="achievementCount"
                  initialValue={selectedUser.achievementCount}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              )}
            </Form>
          )}
        </Modal>

        {/* 批量操作提示框 */}
        <Modal
          title="批量操作进行中"
          visible={batchActionLoading}
          footer={null}
          closable={false}
        >
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>正在处理批量操作，请稍候...</p>
          </div>
        </Modal>
      </div>
    </Content>
    
    <Footer style={{ textAlign: "center", padding: "16px 0" }}>
      学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
    </Footer>
  </Layout>
  );
};

export default UserManage;
