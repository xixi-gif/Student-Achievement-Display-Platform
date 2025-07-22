import React, { useState, useEffect } from 'react';
import { 
  Layout, Form, Input, Button, Card, Select, 
  Upload, Space, Divider, message, Spin, DatePicker,
  Badge
} from 'antd';
import { 
  UploadOutlined, FileTextOutlined, UserOutlined,
  CheckCircleOutlined, CalendarOutlined, VideoCameraOutlined,
  DollarOutlined, PlusOutlined, CloseOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import moment from 'moment';

const { Content } = Layout;
const { TextArea } = Input; // 从 Input 中获取 TextArea

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

const AchievementCreationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [videoFiles, setVideoFiles] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'student';
      const username = localStorage.getItem('username') || '访客';
      const userInfo = JSON.parse(localStorage.getItem('user_info') || 'null') || {
        role,
        username,
        realName: username
      };
      
      setCurrentUser(userInfo);
      
      if (id) {
        const mockAchievement = {
          title: "校园智能导航APP设计与实现",
          category: "project",
          level: "school",
          description: "基于React Native开发的校园导航应用，支持POI搜索、路径规划和校园活动推荐功能...",
          date: moment("2023-09-28"),
          instructor: "陈老师",
          keywords: "校园导航, React Native, 路径规划",
          price: "99.99"
        };
        form.setFieldsValue(mockAchievement);
        setParticipants(["张明", "李华", "王芳"]);
      } else {
        form.setFieldsValue({
          date: moment()
        });
        setParticipants([userInfo.realName || username]);
      }
      
      setLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [form, id]);

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
    
    form.setFieldsValue({ participants: participants.join(',') });
    
    form.validateFields()
      .then(values => {
        const achievementData = {
          ...values,
          date: values.date.format('YYYY-MM-DD'),
          id: id || Date.now(),
          status: 'pending',
          creator: currentUser.username,
          createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          participants: participants,
          videos: videoFiles.map(file => ({
            name: file.name,
            url: file.response?.url || file.url
          }))
        };
        
        setTimeout(() => {
          message.success(id ? '成果更新成功' : '成果发布成功，等待审核');
          navigate('/profile#achievements');
        }, 1000);
      })
      .catch(info => {
        message.error('表单填写有误，请检查后重试');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar currentUser={currentUser} />
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      
      <Content style={{ 
        background: '#f0f2f5', 
        padding: '30px 5%' 
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Card 
            title={
              <span>
                {id ? (
                  <><FileTextOutlined /> 编辑成果</>
                ) : (
                  <><UploadOutlined /> 发布新成果</>
                )}
              </span>
            }
            bordered={false}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                category: 'project',
                level: 'school'
              }}
            >
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
                      <Select.Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Option>
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
                      <Select.Option key={level.value} value={level.value}>
                        {level.label}
                      </Select.Option>
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
                  label="参与人员（可选）"
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
                
                <Form.Item
                  name="files"
                  label="相关文件"
                >
                  <Upload
                    name="files"
                    action="/api/upload/files"
                    listType="text"
                    multiple
                  >
                    <Button icon={<UploadOutlined>上传文件</UploadOutlined>}>
                      上传相关文件（可选）
                    </Button>
                    <p style={{ color: '#666', marginTop: 8 }}>
                      支持上传PDF、Word、PPT等格式文件，单个文件不超过10MB
                    </p>
                  </Upload>
                </Form.Item>
              </div>
              
              <Divider />
              
              <Form.Item>
                <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                  <Button 
                    type="primary" 
                    icon={id ? <CheckCircleOutlined /> : <UploadOutlined />}
                    onClick={handleSubmit}
                    loading={submitting}
                    size="large"
                  >
                    {id ? '更新成果' : '提交发布'}
                  </Button>
                  
                  <Button 
                    type="default" 
                    onClick={() => navigate(id ? `/achievement/${id}` : '/profile#achievements')}
                    size="large"
                    disabled={submitting}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>
              
              {!id && (
                <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
                  <p>提交后将进入审核流程，审核通过后将在成果展示区公开显示</p>
                  <p>请确保所提交的成果内容真实有效，不得涉及违规信息</p>
                </div>
              )}
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AchievementCreationPage;