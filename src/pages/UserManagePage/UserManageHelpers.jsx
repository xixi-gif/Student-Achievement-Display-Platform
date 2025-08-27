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

  teacher: [
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
  const columns = importTemplateColumns[type];
  const requiredFields = columns
    .filter(col => col.required)
    .map(col => col.dataIndex); 

  const idField = type === "student" ? "学号" : "工号";

  return data.map((item, index) => {
    const errors = [];
    requiredFields.forEach(field => {
      if (!item[field] || (typeof item[field] === 'string' && item[field].trim() === '')) {
        errors.push(`缺少必填字段: ${field}`);
      }
    });

    if (item[idField]) {
      const existingUser = users[`${type}s`]?.find(u => 

        u[type === "student" ? "studentId" : "teacherId"] === item[idField]
      );
      if (existingUser) errors.push(`${type === "student" ? "学号" : "工号"}已存在`);
    }


    if (item.电话) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(item.电话.trim())) {
        errors.push("手机号格式不正确（需为11位有效手机号）");
      }
    }

    if (item.邮箱) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(item.邮箱.trim())) {
        errors.push("邮箱格式不正确");
      }
    }

    return { ...item, _id: `import-${index}`, _errors: errors.length > 0 ? errors : null, _valid: errors.length === 0 };
  });
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