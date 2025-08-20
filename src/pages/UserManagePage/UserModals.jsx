import React from "react";
import { Modal, Form, Input, Radio, Button, Upload, Table, Tag, Spin, Avatar, Row, Col, Space, message } from "antd";
import { UploadOutlined, PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { importTemplateColumns, handleFileUploadHelper, exportTemplateHelper } from "./UserManageHelpers";
import { getAvatarUrl } from "./UserManageHelpers";

const { Item } = Form;

const UserModals = ({
  // 显示状态
  addModalVisible,
  editModalVisible,
  resetPwdModalVisible,
  importModalVisible,
  batchActionLoading,
  // 数据
  selectedUser,
  newUserType,
  importType,
  fileList,
  importData,
  importResult,
  avatarUploading,
  adding,
  importing,
  // 关闭回调
  onAddCancel,
  onEditCancel,
  onResetPwdCancel,
  onImportCancel,
  // 操作回调
  onAddUser,
  onEditSubmit,
  onResetPwdConfirm,
  onImportTypeChange,
  onNewUserTypeChange,
  onFileListChange,
  onImportDataChange,
  onAvatarChange,
  onImport,
  // 验证函数
  validateStudentId,
  validateTeacherId
}) => {
  // 表单实例
  const [newUserForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 导入文件处理
  const handleFileUpload = (file) => {
    const result = handleFileUploadHelper(file, importType, importData, (data) => {
      onImportDataChange(data);
    });
    if (result instanceof Promise) {
      result.then(() => {
        onFileListChange([file]);
      }).catch((err) => {
        message.error(err.message || "文件解析失败");
      });
    }
    return false; // 阻止默认上传
  };

  // 添加用户表单提交
  const handleAddSubmit = async () => {
    try {
      const values = await newUserForm.validateFields();
      await onAddUser(values);
      newUserForm.resetFields();
    } catch (error) {
      if (error.name !== "ValidateError") {
        message.error("表单验证失败");
      }
    }
  };

  // 编辑表单初始化（当selectedUser变化时）
  React.useEffect(() => {
    if (selectedUser && editModalVisible) {
      editForm.setFieldsValue({
        name: selectedUser.name,
        [selectedUser.role === "student" ? "studentId" : "teacherId"]: selectedUser[selectedUser.role === "student" ? "studentId" : "teacherId"],
        [selectedUser.role === "student" ? "className" : "title"]: selectedUser[selectedUser.role === "student" ? "className" : "title"],
        [selectedUser.role === "student" ? "major" : "department"]: selectedUser[selectedUser.role === "student" ? "major" : "department"],
        email: selectedUser.email,
        phone: selectedUser.phone,
        status: selectedUser.status
      });
    }
  }, [selectedUser, editModalVisible, editForm]);

  return (
    <>
      {/* 1. 添加用户模态框 */}
      <Modal
        title={`添加${newUserType === "student" ? "学生" : "教师"}`}
        visible={addModalVisible}
        onCancel={onAddCancel}
        onOk={handleAddSubmit}
        confirmLoading={adding}
        okText="提交"
        cancelText="取消"
        width={700}
      >
        <Form form={newUserForm} layout="vertical">
          <Item>
            <Radio.Group
              value={newUserType}
              onChange={(e) => onNewUserTypeChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="student">学生</Radio.Button>
              <Radio.Button value="teacher">教师</Radio.Button>
            </Radio.Group>
          </Item>

          {newUserType === "student" ? (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="name"
                    label="学生姓名"
                    rules={[{ required: true, message: "请输入学生姓名" }]}
                  >
                    <Input placeholder="如：张三" />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="studentId"
                    label="学号"
                    rules={[
                      { required: true, message: "请输入学号" },
                      { validator: validateStudentId },
                    ]}
                  >
                    <Input placeholder="如：2023611001" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="major"
                    label="专业"
                    rules={[{ required: true, message: "请输入学生专业" }]}
                  >
                    <Input placeholder="如：计算机科学与技术" />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="className"
                    label="班级"
                    rules={[{ required: true, message: "请输入班级" }]}
                  >
                    <Input placeholder="如：计算机2101班" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: "请输入学生邮箱" },
                      { pattern: /^[a-zA-Z0-9._%+-]+@(stu\.)?edu\.cn$/, message: "邮箱格式应为@edu.cn或@stu.edu.cn" },
                    ]}
                  >
                    <Input placeholder="如：25zhangsan@stu.edu.cn" />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="phone"
                    label="电话"
                    rules={[
                      { required: true, message: "请输入学生电话" },
                      { pattern: /^1[3-9]\d{9}$/, message: "请输入11位有效手机号" },
                    ]}
                  >
                    <Input placeholder="如：13800138000" />
                  </Item>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="name"
                    label="教师姓名"
                    rules={[{ required: true, message: "请输入教师姓名" }]}
                  >
                    <Input placeholder="如：李教授" />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="teacherId"
                    label="工号"
                    rules={[
                      { required: true, message: "请输入工号" },
                      { pattern: /^T\d{4}$/, message: "工号格式为T+4位数字" },
                      { validator: validateTeacherId },
                    ]}
                  >
                    <Input placeholder="如：T1001" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="department"
                    label="部门"
                    rules={[{ required: true, message: "请输入教师所属学院" }]}
                  >
                    <Input placeholder="如：计算机系" />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="title"
                    label="职称"
                    rules={[{ required: true, message: "请输入职称" }]}
                  >
                    <Input placeholder="如：教授" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { pattern: /^[a-zA-Z0-9._%+-]+@edu\.cn$/, message: "邮箱格式应为@edu.cn" },
                    ]}
                  >
                    <Input placeholder="如：wang@edu.cn" />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="phone"
                    label="电话"
                    rules={[
                      { required: true, message: "请输入电话" },
                      { pattern: /^1[3-9]\d{9}$/, message: "请输入11位有效手机号" },
                    ]}
                  >
                    <Input placeholder="如：13800138000" />
                  </Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Modal>

      {/* 2. 编辑用户模态框 */}
      <Modal
        title={`编辑用户 - ${selectedUser?.name || ""}`}
        visible={editModalVisible}
        onCancel={onEditCancel}
        footer={[
          <Button key="cancel" onClick={onEditCancel}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => editForm.validateFields().then(values => onEditSubmit(values))}>
            保存
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        {selectedUser && (
          <Form form={editForm} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Item label="头像">
                  <Avatar
                    src={getAvatarUrl(selectedUser.avatar, selectedUser.name)}
                    size={100}
                    style={{ display: "block", margin: "0 auto" }}
                    onError={(e) => {
                      e.target.src = getAvatarUrl(null, selectedUser.name);
                      e.target.onerror = null;
                    }}
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={onAvatarChange}
                    style={{ display: "block", textAlign: "center", marginTop: 8 }}
                  >
                    <Button 
                      type="link" 
                      icon={<UploadOutlined />}
                      loading={avatarUploading}
                    >
                      更换头像
                    </Button>
                  </Upload>
                </Item>
              </Col>
              <Col span={16}>
                <Item
                  label="姓名"
                  name="name"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input />
                </Item>
                <Item
                  label={selectedUser.role === "student" ? "学号" : "工号"}
                  name={selectedUser.role === "student" ? "studentId" : "teacherId"}
                  rules={[{ required: true }]}
                >
                  <Input disabled={selectedUser.role === "student"} />
                </Item>
              </Col>
            </Row>

            {selectedUser.role === "student" ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="major"
                    label="专业"
                    rules={[{ required: true, message: "请输入专业" }]}
                  >
                    <Input />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="className"
                    label="班级"
                    rules={[{ required: true, message: "请输入班级" }]}
                  >
                    <Input />
                  </Item>
                </Col>
              </Row>
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Item
                    name="department"
                    label="学院"
                    rules={[{ required: true, message: "请输入学院" }]}
                  >
                    <Input />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item
                    name="title"
                    label="职称"
                    rules={[{ required: true, message: "请输入职称" }]}
                  >
                    <Input />
                  </Item>
                </Col>
              </Row>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: "请输入邮箱" },
                    { type: "email", message: "请输入有效的邮箱地址" },
                  ]}
                >
                  <Input />
                </Item>
              </Col>
              <Col span={12}>
                <Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: "请输入手机号" },
                    { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
                  ]}
                >
                  <Input />
                </Item>
              </Col>
            </Row>

            <Item
              label="状态"
              name="status"
              rules={[{ required: true, message: "请选择状态" }]}
            >
              <Radio.Group>
                <Radio value="active">正常</Radio>
                <Radio value="inactive">禁用</Radio>
              </Radio.Group>
            </Item>
          </Form>
        )}
      </Modal>

      {/* 3. 重置密码模态框 */}
      <Modal
        title="确认重置密码"
        visible={resetPwdModalVisible}
        onOk={onResetPwdConfirm}
        onCancel={onResetPwdCancel}
        okText="确认重置"
        cancelText="取消"
      >
        {selectedUser && (
          <>
            <p>确定要重置用户 <strong>{selectedUser.name}</strong> (
              {selectedUser.role === "student" ? "学号" : "工号"}: {selectedUser.studentId || selectedUser.teacherId}) 的密码吗？
            </p>
            <p>重置后密码将变为123456789，请提醒用户及时修改。</p>
          </>
        )}
      </Modal>

      {/* 4. 批量导入模态框 */}
      <Modal
        title={`批量导入${importType === "student" ? "学生" : "教师"}数据`}
        visible={importModalVisible}
        width={800}
        onCancel={onImportCancel}
        footer={[
          <Button key="download" onClick={() => exportTemplateHelper(importType)}>
            下载模板
          </Button>,
          <Button key="cancel" onClick={onImportCancel}>
            取消
          </Button>,
          <Button
            key="import"
            type="primary"
            onClick={onImport}
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
            onChange={({ fileList }) => onFileListChange(fileList)}
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

      {/* 5. 批量操作加载模态框 */}
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
    </>
  );
};

export default UserModals;