import * as XLSX from "xlsx";
import { message } from "antd";

export const importTemplateColumns = {
    student: [
    { title: '姓名', dataIndex: '姓名', required: true },
    { title: '学号', dataIndex: '学号', required: true },
    { title: '年级', dataIndex: '年级', required: true },
    { title: '专业', dataIndex: '专业', required: true },
    { title: '邮箱', dataIndex: '邮箱', required: true },
    { title: '电话', dataIndex: '电话', required: false },
    { title: '登录密码', dataIndex: '登录密码', required: true }
  ],
  // student: [
  //   { title: '姓名', dataIndex: 'name', required: true },
  //   { title: '学号', dataIndex: 'studentId', required: true },
  //   { title: '年级', dataIndex: 'className', required: true },
  //   { title: '专业', dataIndex: 'major', required: true },
  //   { title: '邮箱', dataIndex: 'email', required: true },
  //   { title: '电话', dataIndex: 'phone', required: false },
  //   { title: '登录密码', dataIndex: 'password', required: true }
  // ],
  teacher: [
    { title: '姓名', dataIndex: '姓名', required: true },
    { title: '工号', dataIndex: '工号', required: true },
    { title: '学院', dataIndex: '学院', required: true },
    { title: '职称', dataIndex: '职称', required: true },
    { title: '邮箱', dataIndex: '邮箱', required: true },
    { title: '电话', dataIndex: '电话', required: false },
    { title: '登录密码', dataIndex: '登录密码', required: true },
    { title: '姓名', dataIndex: '姓名', required: true },
    { title: '工号', dataIndex: '工号', required: true },
    { title: '学院', dataIndex: '学院', required: true },
    { title: '职称', dataIndex: '职称', required: true },
    { title: '邮箱', dataIndex: '邮箱', required: true },
    { title: '电话', dataIndex: '电话', required: false },
    { title: '登录密码', dataIndex: '登录密码', required: true },
  ]
};

export const getAvatarUrl = (dbUrl, userName = "未知用户") => {
  if (dbUrl && typeof dbUrl === 'string' && dbUrl.trim() && !['null', 'undefined'].includes(dbUrl.trim().toLowerCase())) {
    return dbUrl.trim();
  }
  const nameHash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomId = (nameHash % 50) + 10;
  return `https://picsum.photos/id/${randomId}/200/200`;
};

export const validateImportData = (data, type, users) => {
  const requiredFields = importTemplateColumns[type]
    .filter(col => col.required)
    .map(col => col.dataIndex);

  return data.map((item, index) => {
    const errors = [];
    requiredFields.forEach(field => {
      if (!item[field]) errors.push(`缺少必填字段: ${field}`);
    });

    const idField = type === "student" ? "studentId" : "teacherId";
    if (item[idField]) {
      const existingUser = users[`${type}s`].find(u => u[idField] === item[idField]);
      if (existingUser) errors.push(`${idField === "studentId" ? "学号" : "工号"}已存在`);
    }

    return { ...item, _id: `import-${index}`, _errors: errors.length > 0 ? errors : null, _valid: errors.length === 0 };
  });
};

export const handleFileUploadHelper = (file, importType, users, setImportData) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      const validatedData = validateImportData(jsonData, importType, users);
      setImportData(validatedData);
      message.success(`成功解析 ${jsonData.length} 条数据`);
    } catch (error) {
      console.error("Excel解析错误:", error);
      message.error("文件解析失败: " + error.message);
    }
  };
  reader.onerror = () => message.error("文件读取失败");
  reader.readAsArrayBuffer(file);
  return false;
};

export const exportTemplateHelper = (type) => {
  const ws = XLSX.utils.json_to_sheet([]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "模板");
  XLSX.utils.sheet_add_aoa(
    ws,
    [importTemplateColumns[type].map((col) => col.title)],
    { origin: "A1" }
  );
  XLSX.writeFile(
    wb,
    `${type === "student" ? "学生" : "教师"}导入模板.xlsx`
  );
};