import { Badge, Tag, Space, Button, Avatar, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { getAvatarUrl } from "./UserManageHelpers";

/**
 * 过滤用户数据（根据搜索关键词、筛选条件等）
 * @param {Object} users - 用户数据（students/teachers）
 * @param {string} activeTab - 当前激活的标签页（students/teachers）
 * @param {string} searchKeyword - 搜索关键词
 * @param {Object} columnFilters - 列筛选条件
 * @returns {Array} 过滤后的用户列表
 */
export const getFilteredUsers = (users, activeTab, searchKeyword, columnFilters) => {
  const { students, teachers } = users;
  const keyword = searchKeyword.toLowerCase();
  const isStudentTab = activeTab === "students";
  const currentData = isStudentTab ? students : teachers;

  const filterFn = (user) => {
    // 关键词匹配（姓名/学号/工号/邮箱）
    const keywordMatch = keyword 
      ? user.name.toLowerCase().includes(keyword) ||
        (user.studentId && user.studentId.includes(keyword)) ||
        (user.teacherId && user.teacherId.includes(keyword)) ||
        (user.email && user.email.toLowerCase().includes(keyword))
      : true;

    // 状态筛选匹配
    const statusMatch = columnFilters.status.length > 0
      ? columnFilters.status.includes(user.status)
      : true;

    // 专业/学院筛选匹配
    const categoryMatch = isStudentTab 
      ? (columnFilters.major.length > 0 ? columnFilters.major.includes(user.major) : true)
      : (columnFilters.department.length > 0 ? columnFilters.department.includes(user.department) : true);

    return keywordMatch && statusMatch && categoryMatch;
  };

  return currentData.filter(filterFn);
};

/**
 * 获取表格列配置（根据学生/教师类型动态生成）
 * @param {boolean} isStudent - 是否为学生表格
 * @param {Function} handleEdit - 编辑回调
 * @param {Function} handleResetPassword - 重置密码回调
 * @param {Function} handleToggleStatus - 状态切换回调
 * @param {Function} handleDelete - 删除回调
 * @param {Object} columnFilters - 列筛选条件
 * @param {Function} handleColumnFilter - 列筛选回调
 * @param {Object} users - 用户数据（用于生成筛选选项）
 * @param {string} searchKeyword - 搜索关键词（用于生成筛选选项）
 * @returns {Array} 表格列配置
 */
export const getTableColumns = (
  isStudent,
  handleEdit,
  handleResetPassword,
  handleToggleStatus,
  handleDelete,
  columnFilters,
  handleColumnFilter,
  users,  // 新增：用户数据
  searchKeyword  // 新增：搜索关键词
) => {
  // 修复：获取当前标签页的用户数据用于生成筛选选项
  const currentTab = isStudent ? "students" : "teachers";
  const filteredUsers = getFilteredUsers(users, currentTab, searchKeyword, columnFilters);

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
      // 修复：使用正确过滤后的用户数据生成筛选选项
      filters: [
        ...Array.from(new Set(filteredUsers.map(user => user.name)))
          .slice(0, 10)
          .map(name => ({ text: name, value: name }))
      ],
      onFilter: (value, record) => record.name === value,
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
      filters: [
        ...Array.from(new Set(filteredUsers.map(user => user[isStudent ? "className" : "title"])))
          .map(item => ({ text: item, value: item }))
      ],
      onFilter: (value, record) => record[isStudent ? "className" : "title"] === value,
    },
    {
      title: isStudent ? "专业" : "学院",
      dataIndex: isStudent ? "major" : "department",
      key: isStudent ? "major" : "department",
      filters: [
        ...Array.from(new Set(filteredUsers.map(user => user[isStudent ? "major" : "department"])))
          .map(item => ({ text: item, value: item }))
      ],
      onFilter: (value, record) => record[isStudent ? "major" : "department"] === value,
      filteredValue: columnFilters[isStudent ? "major" : "department"],
      onFilterChange: (values) => handleColumnFilter(isStudent ? "major" : "department", values),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "正常", value: "active" },
        { text: "已禁用", value: "inactive" }
      ],
      filteredValue: columnFilters.status,
      onFilterChange: (values) => handleColumnFilter("status", values),
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
      sorter: (a, b) => new Date(b.lastLogin) - new Date(a.lastLogin),
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
          <Button
            danger={record.status === "active"}
            type="link"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === "active" ? "禁用" : "启用"}
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => handleDelete(record.id)}
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

  // 学生表格添加"成果数"列
  if (isStudent) {
    baseColumns.splice(6, 0, {
      title: "成果数",
      dataIndex: "achievementCount",
      key: "achievementCount",
      sorter: (a, b) => b.achievementCount - a.achievementCount,
      render: (count) => <Tag color="blue">{count}</Tag>,
    });
  }

  return baseColumns;
};

/**
 * 导出数据到Excel
 * @param {Array} data - 要导出的数据
 * @param {boolean} isStudent - 是否为学生数据
 * @param {Function} onSuccess - 成功回调
 * @param {Function} onError - 失败回调
 */
export const exportToExcel = (data, isStudent, onSuccess, onError) => {
  const fileName = `${isStudent ? "学生" : "教师"}名单_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
  
  // 定义导出列配置
  const exportColumns = isStudent 
    ? [
        { header: '姓名', key: 'name' },
        { header: '学号', key: 'studentId' },
        { header: '年级', key: 'className' },
        { header: '专业', key: 'major' },
        { header: '邮箱', key: 'email' },
        { header: '状态', key: 'status', formatter: v => v === 'active' ? '正常' : '已禁用' },
        { header: '成果数', key: 'achievementCount' },
        { header: '上次登录', key: 'lastLogin' }
      ]
    : [
        { header: '姓名', key: 'name' },
        { header: '工号', key: 'teacherId' },
        { header: '学院', key: 'department' },
        { header: '职称', key: 'title' },
        { header: '邮箱', key: 'email' },
        { header: '状态', key: 'status', formatter: v => v === 'active' ? '正常' : '已禁用' },
        { header: '上次登录', key: 'lastLogin' }
      ];

  // 格式化导出数据
  const formattedData = data.map(item => {
    const formatted = {};
    exportColumns.forEach(col => {
      formatted[col.header] = col.formatter ? col.formatter(item[col.key]) : item[col.key] || '';
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
