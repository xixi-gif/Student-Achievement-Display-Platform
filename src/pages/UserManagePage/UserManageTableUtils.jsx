import { Badge, Tag, Space, Button, Avatar, Popconfirm, Table, Input } from "antd";
import { EditOutlined, DeleteOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { getAvatarUrl } from "./UserManageHelpers";
import { useState, useEffect } from "react";

/**
 * @param {Object} users 
 * @param {string} activeTab 
 * @param {string} searchKeyword 
 * @returns {Array} 
 */
export const getFilteredUsers = (users, activeTab, searchKeyword) => {
  const { students, teachers } = users || { students: [], teachers: [] };
  const keyword = searchKeyword.toLowerCase();
  const isStudentTab = activeTab === "students";
  const currentData = isStudentTab ? students : teachers;

  if (!currentData || currentData.length === 0) return [];

  const filterFn = (user) => {
    // 基础搜索条件：姓名、学号/工号、邮箱（通用）
    const baseMatch = user.name.toLowerCase().includes(keyword) ||
      (user.studentId && user.studentId.includes(keyword)) ||
      (user.teacherId && user.teacherId.includes(keyword)) ||
      (user.email && user.email.toLowerCase().includes(keyword));

    if (isStudentTab) {
      return baseMatch ||
        (user.className && user.className.toLowerCase().includes(keyword)) ||
        (user.major && user.major.toLowerCase().includes(keyword));
    } else {
      return baseMatch ||
        (user.title && user.title.toLowerCase().includes(keyword)) ||
        (user.department && user.department.toLowerCase().includes(keyword));
    }
  };

  return currentData.filter(filterFn);
};

/**
 * 用户表格组件 - 包含搜索和排序功能
 */
export const UserTable = ({ 
  users, 
  activeTab, 
  isStudent 
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  
  useEffect(() => {
    const data = getFilteredUsers(users, activeTab, searchKeyword);
    setFilteredData(data);
  }, [users, activeTab, searchKeyword]);


  const handleSearch = (value) => {
    setSearchKeyword(value);
  };


  const handleEdit = (record) => {
    console.log("编辑用户:", record);
  };

  const handleResetPassword = (record) => {
    console.log("重置密码:", record);
  };

  const handleDelete = (id) => {
    console.log("删除用户ID:", id);
  };

  const columns = getTableColumns(
    isStudent,
    handleEdit,
    handleResetPassword,
    handleDelete
  );

  return (
    <div>
      <Input
        placeholder={isStudent 
          ? "搜索姓名、学号、邮箱" 
          : "搜索姓名、工号、邮箱"}
        value={searchKeyword}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: 450 }}
        allowClear
      />
      
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

/**
 * 获取表格列配置（包含排序功能）
 */
export const getTableColumns = (
  isStudent,
  handleEdit,
  handleResetPassword,
  handleDelete
) => {
  const baseColumns = [
    {
      title: "头像",
      dataIndex: "avatar",
      width: 80,
      render: (avatar, record) => (
        <Avatar
          src={getAvatarUrl(avatar, record.name)}
          alt={record.name}
          icon={<UserOutlined />}
          onError={(e) => {
            e.target.src = getAvatarUrl(null, record.name);
            e.target.onerror = null;
          }}
        />
      ),
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: isStudent ? "学号" : "工号",
      dataIndex: isStudent ? "studentId" : "teacherId",
      key: isStudent ? "studentId" : "teacherId",
      sorter: (a, b) => (a[isStudent ? "studentId" : "teacherId"] || "").localeCompare(b[isStudent ? "studentId" : "teacherId"] || ""),
    },
    {
      title: isStudent ? "年级" : "职称",
      dataIndex: isStudent ? "className" : "title",
      key: isStudent ? "className" : "title",
      sorter: (a, b) => (a[isStudent ? "className" : "title"] || "").localeCompare(b[isStudent ? "className" : "title"] || ""),
    },
    {
      title: isStudent ? "专业" : "学院",
      dataIndex: isStudent ? "major" : "department",
      key: isStudent ? "major" : "department",
      sorter: (a, b) => (a[isStudent ? "major" : "department"] || "").localeCompare(b[isStudent ? "major" : "department"] || ""),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => {
        const statusOrder = { "active": 0, "inactive": 1 };
        return (statusOrder[a.status] || 2) - (statusOrder[b.status] || 2);
      },
      render: (status) => (
        <Badge 
          status={status === "active" ? "success" : "error"} 
          text={status === "active" ? "正常" : "已禁用"} 
        />
      ),
    },
    {
      title: "上次登录",
      dataIndex: "lastLogin",
      key: "lastLogin",
      sorter: (a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0),
      render: (time) => time ? new Date(time).toLocaleString() : "未登录",
    },
    {
      title: "操作",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>

          <Popconfirm
            title="确定删除此用户？"
            onClick={() => handleDelete(record)} 
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];


  if (isStudent) {
    baseColumns.splice(6, 0, {
      title: "成果数",
      dataIndex: "achievementCount",
      key: "achievementCount",
      sorter: (a, b) => (b.achievementCount || 0) - (a.achievementCount || 0),
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    });
  }

  return baseColumns;
};

/**
 * 导出数据到Excel
 */
export const exportToExcel = (data, isStudent, onSuccess, onError) => {
  const fileName = `${isStudent ? "学生" : "教师"}名单_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
  
  const exportColumns = isStudent 
    ? [
        { header: '姓名', key: 'name' },
        { header: '学号', key: 'studentId' },
        { header: '年级', key: 'className' },
        { header: '专业', key: 'major' },
        { header: '邮箱', key: 'email' },
        { header: '状态', key: 'status', formatter: v => v === 'active' ? '正常' : '已禁用' },
        { header: '成果数', key: 'achievementCount', formatter: v => v || 0 },
        { header: '上次登录', key: 'lastLogin', formatter: v => v ? new Date(v).toLocaleString() : "未登录" }
      ]
    : [
        { header: '姓名', key: 'name' },
        { header: '工号', key: 'teacherId' },
        { header: '学院', key: 'department' },
        { header: '职称', key: 'title' },
        { header: '邮箱', key: 'email' },
        { header: '状态', key: 'status', formatter: v => v === 'active' ? '正常' : '已禁用' },
        { header: '上次登录', key: 'lastLogin', formatter: v => v ? new Date(v).toLocaleString() : "未登录" }
      ];

  const formattedData = data.map(item => {
    const formatted = {};
    exportColumns.forEach(col => {
      formatted[col.header] = col.formatter ? col.formatter(item[col.key]) : (item[col.key] || '');
    });
    return formatted;
  });

  try {
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isStudent ? "学生名单" : "教师名单");
    XLSX.writeFile(wb, fileName);
    onSuccess(`成功导出 ${formattedData.length} 条数据到Excel`);
  } catch (error) {
    console.error("导出Excel失败:", error);
    onError("导出失败: " + error.message);
  }
};
    