import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, message, Card, Layout } from 'antd';
import Navbar from '../Navbar/Navbar';
import { authApi } from '../../service/api';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Content } = Layout;

const RequirementPublishPage = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const requirementTypes = [
    { value: 'project', label: '项目合作' },
    { value: 'tutor', label: '学业辅导' },
    { value: 'research', label: '科研协助' },
    { value: 'competition', label: '竞赛组队' },
    { value: 'other', label: '其他需求' }
  ];

  const urgencyOptions = [
    { value: 'low', label: '低' },
    { value: 'normal', label: '中' },
    { value: 'high', label: '高' }
  ];

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {

      const requestData = {
        budget: values.budget || '',
        contact: values.contact,
        deadline: values.deadline ? moment(values.deadline).format('YYYY-MM-DDTHH:mm:ss') : '',
        description: values.description,
        requireType: values.type,
        title: values.title,  
        urgency: values.urgency
      };
      
      await authApi.addRequirement(requestData);
      message.success('需求发布成功！');
      navigate('/requirements');
    } catch (error) {
      message.error('发布失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Navbar />
      <Content style={{ padding: '24px', background: '#f7f8fa' }}>
        <Card title="发布新需求" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              type: 'project',
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
              name="budget"
              label="预算范围"
              rules={[
                { max: 100, message: '预算描述不能超过100个字符' }
              ]}
            >
              <Input placeholder="例如：500元以内，可协商，无预算等" />
            </Form.Item>
            
            <Form.Item
              name="deadline"
              label="截止日期"
            >
              <DatePicker 
                showTime={{ format: 'HH:mm:ss' }}
                placeholder="选择截止日期和时间（如2025-08-20 10:30:00）" 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Form.Item>
            
            <Form.Item
              name="urgency"
              label="紧急程度"
              rules={[{ required: true }]}
            >
              <Select placeholder="选择紧急程度">
                {urgencyOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
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
      </Content>
    </Layout>
  );
};

export default RequirementPublishPage;
    