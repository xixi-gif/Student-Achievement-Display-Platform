// src/pages/RequirementPublishPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Tag, Space, Radio } from 'antd';
import { PlusOutlined, PaperClipOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const RequirementPublishPage = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const requirementTypes = [
    { value: 'project', label: '项目合作' },
    { value: 'tutor', label: '学业辅导' },
    { value: 'research', label: '科研协助' },
    { value: 'competition', label: '竞赛组队' },
    { value: 'other', label: '其他需求' }
  ];

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // 模拟提交成功
      const mockRequirement = {
        id: `req-${Date.now()}`,
        ...values,
        status: 'pending',
        publishTime: new Date().toISOString(),
        publisher: {
          id: 'user-123',
          name: '张三',
          role: 'student'
        },
        applicants: [],
        messages: []
      };
      
      console.log('发布的需求:', mockRequirement);
      message.success('需求发布成功！');
      navigate('/requirements');
    } catch (error) {
      message.error('发布失败: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="发布新需求" bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'project',
          budgetType: 'free',
          urgency: 'normal'
        }}
      >
        <Form.Item
          name="title"
          label="需求标题"
          rules={[
            { required: true, message: '请输入需求标题' },
            { max: 50, message: '标题不能超过50个字符' }
          ]}
        >
          <Input placeholder="例如：寻找Python数据分析项目合作伙伴" />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="需求类型"
          rules={[{ required: true }]}
        >
          <Select placeholder="请选择需求类型">
            {requirementTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="description"
          label="详细描述"
          rules={[
            { required: true, message: '请详细描述您的需求' },
            { min: 20, message: '描述至少需要20个字符' }
          ]}
        >
          <TextArea rows={6} placeholder="请详细描述您的需求..." />
        </Form.Item>
        
        <Form.Item
          name="contact"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
        >
          <Input placeholder="请输入邮箱、电话或微信等联系方式" />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitting}
            style={{ width: '100%' }}
          >
            发布需求
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RequirementPublishPage;