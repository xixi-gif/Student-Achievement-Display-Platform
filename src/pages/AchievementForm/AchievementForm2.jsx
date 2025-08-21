import React, { useState, useEffect } from 'react';
import { 
  Layout, Form, Input, Select, DatePicker, Upload, message, 
  Button, Space, Divider, Badge, Spin, Card, Typography, Row, Col, Tag 
} from 'antd';
import { 
  UploadOutlined, VideoCameraOutlined, PlusOutlined, 
  DollarOutlined, CalendarOutlined, CloseOutlined, 
  FileTextOutlined, ArrowLeftOutlined 
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar';
import { achievementApi, adminApi } from '../../service/api';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const AchievementForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode] = useState(id !== 'add');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [levels] = useState([
    { value: '校级', label: '校级' },
    { value: '市级', label: '市级' },
    { value: '省级', label: '省级' },
    { value: '国家级', label: '国家级' },
    { value: '国际级', label: '国际级' }
  ]);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取分类数据
        const categoriesRes = await adminApi.getCategoryList();
        if (categoriesRes.code === 0) {
          setCategories(categoriesRes.data.map(item => ({
            value: item.name,
            label: item.name
          })));
        }

        // 获取标签数据
        setTagsLoading(true);
        const tagsRes = await adminApi.getTagList();
        if (tagsRes.code === 0) {
          setTags(tagsRes.data.map(tag => ({
            value: tag.id || tag.tagId,
            label: tag.name || tag.tagName,
          })));
        }

        if (isEditMode) {
          // 获取成果详情数据
          const detailRes = await achievementApi.getDetail(id);
          if (detailRes.code === 0) {
            const data = detailRes.data;
            setParticipants(data.participants || []);
            setImageList(data.images || []);
            setVideoFile(data.videos && data.videos.length > 0 ? data.videos[0] : null);
            
            form.setFieldsValue({
              title: data.title,
              category: data.category,
              level: data.level,
              date: data.date ? moment(data.date) : null,
              description: data.description,
              instructor: data.instructor?.realName || '',
              keywords: data.keywords || [], // 修改为直接使用数组
              price: data.price
            });
          }
        } else {
          // 新建成果模式设置默认值
          const username = localStorage.getItem('username') || '用户';
          setParticipants([username]);
          form.setFieldsValue({
            category: categories[0]?.value,
            level: levels[0].value,
            date: moment(),
            keywords: [] // 默认空数组
          });
        }
      } catch (error) {
        console.error('数据加载失败:', error);
        message.error('数据加载失败');
      } finally {
        setTagsLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, isEditMode]);

  // 图片预览处理
  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // 添加参与人员
  const handleAddParticipant = () => {
    if (!newParticipant.trim()) {
      message.warning('请输入参与人员姓名');
      return;
    }
    if (participants.includes(newParticipant.trim())) {
      message.warning('该人员已在列表中');
      return;
    }
    setParticipants([...participants, newParticipant.trim()]);
    setNewParticipant('');
  };

  // 移除参与人员
  const handleRemoveParticipant = name => {
    setParticipants(participants.filter(item => item !== name));
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      
      const formData = new FormData();
      if (values.title) formData.append('title', values.title);
      if (values.category) formData.append('category', values.category);
      if (values.level) formData.append('level', values.level);
      if (values.date) formData.append('date', values.date.format('YYYY-MM-DD'));
      if (values.description) formData.append('description', values.description);
      if (values.instructor) formData.append('instructor', values.instructor);
      
      // 处理关键词（已经是数组形式）
      if (values.keywords && values.keywords.length > 0) {
        formData.append('keywords', JSON.stringify(values.keywords));
      }
      
      if (values.price) formData.append('price', values.price);
      
      // 参与者
      if (participants.length > 0) {
        formData.append('participants', JSON.stringify(participants));
      }
      
      // 图片文件（多文件）
      imageList.forEach((img, index) => {
        if (img.originFileObj) {
          formData.append(`images`, img.originFileObj);
        } else if (img.url) {
          formData.append(`oldImages[${index}].fileUrl`, img.url);
          formData.append(`oldImages[${index}].fileName`, img.name);
        }
      });
      
      // 视频文件（单个）
      if (videoFile) {
        if (videoFile.originFileObj) {
          formData.append('videos', videoFile.originFileObj);
        } else if (videoFile.url) {
          formData.append('oldVideos[0].fileUrl', videoFile.url);
          formData.append('oldVideos[0].fileName', videoFile.name);
        }
      }
      
      // 附件文件（多文件）
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append(`files`, file.originFileObj);
        } else if (file.url) {
          formData.append(`oldFiles[${index}].fileUrl`, file.url);
          formData.append(`oldFiles[${index}].fileName`, file.name);
        }
      });

      if (isEditMode) {
        formData.append('id', id);
        const res = await achievementApi.updateAchievement(formData);
        if (res.code === 0) {
          message.success('成果更新成功');
          navigate('/achievements');
        }
      } else {
        const res = await achievementApi.createAchievement(formData);
        if (res.code === 0) {
          message.success('成果添加成功');
          navigate('/achievements');
        }
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error(`提交失败: ${error.message || '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    navigate('/achievements');
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <Layout.Content style={{ padding: 24, minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24 }}>
        <Row justify="center">
          <Col xs={24} md={20} lg={18}>
            <Card bordered={false}>
              <Space style={{ marginBottom: 24 }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={handleCancel}
                >
                  返回
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  {isEditMode ? '编辑成果' : '添加成果'}
                </Title>
              </Space>

              <Form
                form={form}
                layout="vertical"
                scrollToFirstError
              >
                {/* 基本信息部分 */}
                <Divider orientation="left" plain>基本信息</Divider>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="title"
                      label="成果标题"
                      rules={[
                        { required: false, message: '请输入成果标题' },
                        { max: 100, message: '标题不能超过100个字符' }
                      ]}
                    >
                      <Input 
                        placeholder="请输入成果标题" 
                        prefix={<FileTextOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="category"
                      label="成果分类"
                      rules={[{ required: false, message: '请选择成果分类' }]}
                    >
                      <Select placeholder="请选择分类" loading={categories.length === 0}>
                        {categories.map(cat => (
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
                      rules={[{ required: false, message: '请选择成果级别' }]}
                    >
                      <Select placeholder="请选择级别">
                        {levels.map(level => (
                          <Option key={level.value} value={level.value}>
                            {level.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="date"
                      label="完成日期"
                      rules={[{ required: false, message: '请选择完成日期' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        placeholder="选择日期"
                        suffixIcon={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 详细信息部分 */}
                <Divider orientation="left" plain>详细信息</Divider>
                <Form.Item
                  name="description"
                  label="成果描述"
                  rules={[
                    { required: false, message: '请输入成果描述' },
                    { min: 30, message: '描述至少30个字符' }
                  ]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder="详细描述成果内容、技术实现、创新点等..."
                    showCount
                  />
                </Form.Item>
                
                <Form.Item label="参与人员">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space wrap>
                      {participants.map((name, index) => (
                        <Badge 
                          key={index}
                          count={
                            <CloseOutlined 
                              style={{ color: '#f5222d', cursor: 'pointer' }}
                              onClick={() => handleRemoveParticipant(name)}
                            />
                          }
                        >
                          <Tag color="blue" style={{ padding: '4px 8px' }}>
                            {name}
                          </Tag>
                        </Badge>
                      ))}
                    </Space>
                    
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        value={newParticipant}
                        onChange={e => setNewParticipant(e.target.value)}
                        onPressEnter={handleAddParticipant}
                        placeholder="输入参与人员姓名"
                      />
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleAddParticipant}
                      >
                        添加
                      </Button>
                    </Space.Compact>
                  </Space>
                </Form.Item>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="instructor"
                      label="指导教师"
                    >
                      <Input placeholder="请输入指导教师姓名（选填）" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="keywords"
                      label="关键词"
                      rules={[
                        { required: false, message: '请选择至少一个关键词' }
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
                  </Col>
                </Row>

                {/* 价格信息 */}
                <Divider orientation="left" plain>价格信息</Divider>
                <Form.Item
                  name="price"
                  label="价格"
                  rules={[
                    { required: false, message: '请输入价格' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效价格格式' }
                  ]}
                >
                  <Input 
                    prefix={<DollarOutlined />}
                    suffix="元"
                    placeholder="例如：99.99"
                  />
                </Form.Item>

                {/* 附件上传 */}
                <Divider orientation="left" plain>成果附件</Divider>
                <Form.Item
                  label="成果图片"
                  extra="支持JPG/PNG格式，单张图片不超过10MB，最多8张"
                >
                  <Upload
                    listType="picture-card"
                    fileList={imageList}
                    onChange={({ fileList }) => setImageList(fileList)}
                    onPreview={handlePreview}
                    beforeUpload={() => false}
                    maxCount={8}
                  >
                    {imageList.length >= 8 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传图片</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>

                <Form.Item
                  label="成果视频"
                  extra="支持MP4格式，单个文件不超过100MB，只能上传一个"
                >
                  <Upload
                    fileList={videoFile ? [videoFile] : []}
                    onChange={({ fileList }) => setVideoFile(fileList[0] || null)}
                    beforeUpload={() => false}
                    maxCount={1}
                  >
                    <Button icon={<VideoCameraOutlined />}>上传视频</Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  label="其他附件"
                  extra="支持PDF/DOC/ZIP等格式，单个文件不超过50MB"
                >
                  <Upload
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                  >
                    <Button icon={<UploadOutlined />}>上传附件</Button>
                  </Upload>
                </Form.Item>

                {/* 表单操作按钮 */}
                <Form.Item style={{ marginTop: 32 }}>
                  <Space size="large" style={{ float: 'right' }}>
                    <Button onClick={handleCancel} disabled={submitting}>
                      取消
                    </Button>
                    <Button 
                      type="primary" 
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={submitting}
                    >
                      {isEditMode ? '保存修改' : '提交发布'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
};

// 辅助函数：获取图片base64
const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export default AchievementForm;