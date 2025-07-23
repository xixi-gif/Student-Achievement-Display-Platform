import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Select, DatePicker, Upload, message, Button, Space, Divider, Badge, Spin } from 'antd';
import { UploadOutlined, VideoCameraOutlined, CheckCircleOutlined, PlusOutlined, DollarOutlined, CalendarOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import Navbar from '../Navbar/Navbar';

const { TextArea } = Input;
const { Option } = Select;

const categories = [
  { value: 'thesis', label: '毕业论文' },
  { value: 'project', label: '一级项目' },
  { value: 'competition', label: '竞赛作品' },
  { value: 'patent', label: '技术专利' },
  { value: 'paper', label: '期刊论文' },
  { value: 'coursework', label: '课程作业' }
];

const levels = [
  { value: 'school', label: '校级' },
  { value: 'city', label: '市级' },
  { value: 'province', label: '省级' },
  { value: 'national', label: '国家级' },
  { value: 'international', label: '国际级' }
];

const AchievementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [achievementData, setAchievementData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [videoFiles, setVideoFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  
  useEffect(() => {
    if (id === 'add') {
      // 添加模式
      setIsEditMode(false);
      const username = localStorage.getItem('username') || '学生用户';
      setParticipants([username]);
      form.setFieldsValue({
        category: categories[0].value,
        level: levels[0].value,
        date: moment()
      });
      setLoading(false);
    } else {
      // 编辑模式 - 模拟从API获取数据
      setIsEditMode(true);
      setTimeout(() => {
        // 这里应该从API获取数据，这里使用模拟数据
        const mockData = {
          id: id,
          title: "校园智能导航APP设计与实现",
          category: "project",
          level: "school",
          status: "pending",
          date: moment("2025-03-15"),
          score: null,
          participants: ["张三", "李四", "王五"],
          instructor: "陈老师",
          keywords: "校园导航, React Native, 路径规划",
          price: "99.99",
          description: "基于React Native开发的校园导航应用，支持POI搜索、路径规划和校园活动推荐功能，解决了校园内建筑物复杂、导航困难的问题。应用采用了离线地图技术，在没有网络的情况下也能正常使用。",
          attachments: [
            { name: "项目报告.pdf", url: "#" },
            { name: "源代码.zip", url: "#" }
          ],
          images: [
            "https://picsum.photos/seed/app1/400/300",
            "https://picsum.photos/seed/app2/400/300"
          ],
          videos: [
            { name: "演示视频.mp4", url: "#" }
          ],
          createdAt: moment("2025-03-10")
        };
        
        setAchievementData(mockData);
        setParticipants([...mockData.participants]);
        setVideoFiles(mockData.videos || []);
        form.setFieldsValue({
          title: mockData.title,
          category: mockData.category,
          level: mockData.level,
          date: mockData.date,
          description: mockData.description,
          instructor: mockData.instructor,
          keywords: mockData.keywords,
          price: mockData.price
        });
        setLoading(false);
      }, 800);
    }
  }, [id, form]);
  
  const uploadImageProps = {
    name: 'achievementImages',
    action: '/api/upload/achievement/images',
    listType: 'picture-card',
    multiple: true,
    onPreview: (file) => {
      setPreviewImage(file.url || file.preview);
      setPreviewVisible(true);
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };
  
  const uploadVideoProps = {
    name: 'achievementVideos',
    action: '/api/upload/achievement/videos',
    listType: 'text',
    multiple: true,
    accept: 'video/*',
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        setVideoFiles(info.fileList);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    onRemove: (file) => {
      setVideoFiles(videoFiles.filter(item => item.uid !== file.uid));
    },
  };
  
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
  
  const handleRemoveParticipant = (name) => {
    setParticipants(participants.filter(item => item !== name));
  };
  
  const handleSubmit = () => {
    setSubmitting(true);
    
    form.validateFields()
      .then(values => {
        const achievementData = {
          ...values,
          date: values.date.format('YYYY-MM-DD'),
          id: id === 'add' ? Date.now() : id,
          status: id === 'add' ? 'pending' : achievementData.status,
          creator: localStorage.getItem('username') || '未知',
          createTime: id === 'add' ? moment().format('YYYY-MM-DD HH:mm:ss') : achievementData.createTime,
          participants: participants,
          videos: videoFiles.map(file => ({
            name: file.name,
            url: file.response?.url || file.url
          }))
        };
        
        // 模拟API调用
        setTimeout(() => {
          if (id === 'add') {
            message.success('成果添加成功，等待审核');
          } else {
            message.success('成果更新成功');
          }
          navigate('/student/my-achievements');
        }, 1000);
      })
      .catch(info => {
        message.error('表单填写有误，请检查后重试');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  const handleCancel = () => {
    navigate('/student/my-achievements');
  };

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px - 64px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              scrollToFirstError
            >
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>
                  {isEditMode ? '编辑成果' : '添加成果'}
                </h2>
                <div>
                  <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                    返回
                  </Button>
                  <Button type="primary" onClick={handleSubmit} loading={submitting}>
                    {isEditMode ? '保存修改' : '提交发布'}
                  </Button>
                </div>
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>基本信息</h3>
                
                <Form.Item
                  name="title"
                  label="成果标题"
                  rules={[
                    { required: true, message: '请输入成果标题' },
                    { min: 5, message: '标题长度至少5个字符' },
                    { max: 100, message: '标题长度不能超过100个字符' }
                  ]}
                >
                  <Input 
                    placeholder="请输入成果的标题" 
                    prefix={<FileTextOutlined />}
                  />
                </Form.Item>
                
                <Form.Item
                  name="category"
                  label="成果分类"
                  rules={[{ required: true, message: '请选择成果分类' }]}
                >
                  <Select 
                    placeholder="请选择成果所属分类" 
                    showSearch 
                    optionFilterProp="children"
                  >
                    {categories.map(cat => (
                      <Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="level"
                  label="成果级别"
                  rules={[{ required: true, message: '请选择成果级别' }]}
                >
                  <Select placeholder="请选择成果的级别">
                    {levels.map(level => (
                      <Option key={level.value} value={level.value}>
                        {level.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="date"
                  label="完成日期"
                  rules={[{ required: true, message: '请选择成果完成日期' }]}
                >
                  <DatePicker 
                    placeholder="选择成果完成的日期" 
                    style={{ width: '100%' }}
                    prefix={<CalendarOutlined />}
                  />
                </Form.Item>
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>详细信息</h3>
                
                <Form.Item
                  name="description"
                  label="成果描述"
                  rules={[
                    { required: true, message: '请输入成果描述' },
                    { min: 30, message: '描述内容至少30个字符' },
                    { max: 2000, message: '描述内容不能超过2000个字符' }
                  ]}
                >
                  <TextArea 
                    placeholder="请详细描述成果的背景、实现过程、创新点和应用价值等内容..." 
                    rows={8}
                    showCount
                  />
                </Form.Item>
                
                <Form.Item
                  label="参与人员"
                >
                  <div>
                    <Space size="small" wrap style={{ marginBottom: 12 }}>
                      {participants.map((name, index) => (
                        <Badge 
                          key={index}
                          color="#1890ff"
                          text={
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              {name}
                              <CloseOutlined 
                                style={{ 
                                  marginLeft: 5, 
                                  cursor: 'pointer', 
                                  fontSize: 12 
                                }} 
                                onClick={() => handleRemoveParticipant(name)} 
                              />
                            </span>
                          }
                        />
                      ))}
                    </Space>
                    
                    <Space.Compact style={{ width: '100%' }}>
                      <Input 
                        placeholder="请输入参与人员姓名" 
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        onPressEnter={handleAddParticipant}
                      />
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleAddParticipant}
                      >
                        添加
                      </Button>
                    </Space.Compact>
                    
                    <p style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      可添加多位参与人员，也可全部删除（个人项目）
                    </p>
                  </div>
                </Form.Item>
                
                <Form.Item
                  name="instructor"
                  label="指导教师"
                >
                  <Input 
                    placeholder="请输入指导教师姓名（如无指导教师可留空）" 
                  />
                </Form.Item>
                
                <Form.Item
                  name="keywords"
                  label="关键词"
                  rules={[
                    { required: true, message: '请输入关键词' },
                    { min: 2, message: '请至少输入一个关键词' }
                  ]}
                >
                  <Input 
                    placeholder="请输入关键词，多个关键词用逗号分隔" 
                  />
                </Form.Item>
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>价格信息</h3>
                
                <Form.Item
                  name="price"
                  label="价格信息"
                  rules={[
                    { required: true, message: '请输入价格信息' },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject('请输入价格信息');
                        }
                        
                        const fixedPriceRegex = /^\d+(\.\d{1,2})?$/;
                        const rangePriceRegex = /^\d+(\.\d{1,2})?\s*-\s*\d+(\.\d{1,2})?$/;
                        const negotiableRegex = /^面议$/i;
                        
                        if (
                          fixedPriceRegex.test(value) || 
                          rangePriceRegex.test(value) || 
                          negotiableRegex.test(value)
                        ) {
                          return Promise.resolve();
                        }
                        
                        return Promise.reject('请输入有效的价格格式（如：50、50-100 或 面议）');
                      }
                    }
                  ]}
                >
                  <Input 
                    placeholder="请输入价格（支持格式：50、50-100、面议）" 
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>成果附件</h3>
                
                <Form.Item
                  name="images"
                  label="成果图片"
                  rules={[{ required: true, message: '请至少上传一张成果图片' }]}
                >
                  <Upload
                    {...uploadImageProps}
                    listType="picture-card"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  </Upload>
                </Form.Item>
                
                <Form.Item
                  name="videos"
                  label="成果视频"
                >
                  <Upload
                    {...uploadVideoProps}
                    listType="text"
                  >
                    <Button icon={<VideoCameraOutlined />}>
                      上传视频（可选）
                    </Button>
                    <p style={{ color: '#666', marginTop: 8 }}>
                      支持上传MP4、AVI等常见视频格式，单个文件不超过100MB
                    </p>
                  </Upload>
                </Form.Item>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                <Button style={{ marginRight: 16, width: 120 }} onClick={handleCancel}>
                  取消
                </Button>
                <Button type="primary" style={{ width: 120 }} onClick={handleSubmit} loading={submitting}>
                  {isEditMode ? '保存修改' : '提交发布'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default AchievementForm;