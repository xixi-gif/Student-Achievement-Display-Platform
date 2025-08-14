import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, message, Table, Upload, Card, Select,
   Tag, Space, Popconfirm, Image, Row, Col, Layout} from 'antd';
import { UploadOutlined,  PlusOutlined, DeleteOutlined, EditOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';

const { TabPane } = Tabs;
const { Option } = Select;
const { Footer } = Layout;

// 分类数据
const mockCategories = [
  { id: 1, name: '科研项目' },
  { id: 2, name: '学术论文' },
  { id: 3, name: '竞赛作品' },
  { id: 4, name: '设计作品' },
  { id: 5, name: '创业项目' },
  { id: 6, name: '社会实践' },
  { id: 7, name: '志愿服务' },
  { id: 8, name: '文艺创作' },
  { id: 9, name: '体育竞技' },
  { id: 10, name: '其他成果' }
];

// 标签数据
const mockTags = [
  { id: 1, name: '人工智能' },
  { id: 2, name: '大数据' },
  { id: 3, name: '机器学习' },
  { id: 4, name: '深度学习' },
  { id: 5, name: '区块链' },
  { id: 6, name: '物联网' },
  { id: 7, name: '前端开发' },
  { id: 8, name: '后端开发' },
  { id: 9, name: '移动应用' },
  { id: 10, name: 'UI设计' }
];

// 轮播图数据
const mockCarouselItems = [
  {
    id: 1,
    title: '2023年度优秀成果展',
    description: '展示本年度学生优秀科研成果',
    imageUrl: 'https://example.com/banner1.jpg',
    link: '/achievements',
    order: 1
  },
];

const SystemSettingsPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryForm] = Form.useForm();
  const [tagForm] = Form.useForm();
  const [carouselForm] = Form.useForm();

  // 模拟数据加载
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const role = localStorage.getItem('user_role') || 'visitor';
      const username = localStorage.getItem('username') || '访客';
      setCurrentUser({ role, username, avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` });
      setCategories(mockCategories);
      setTags(mockTags);
      setCarouselItems(mockCarouselItems);
      setLoading(false);
    }, 500);
  }, []);

  // 添加分类
  const handleAddCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      const newCategory = {
        id: Date.now(),
        name: values.name
      };
      setCategories([...categories, newCategory]);
      message.success('分类添加成功');
      categoryForm.resetFields();
    } catch (error) {
      message.error('添加失败');
    }
  };

  // 编辑分类
  const handleEditCategory = (record) => {
    categoryForm.setFieldsValue(record);
  };

  // 删除分类
  const handleDeleteCategory = async (id) => {
    setCategories(categories.filter(item => item.id !== id));
    message.success('分类删除成功');
  };

  // 添加标签
  const handleAddTag = async () => {
    try {
      const values = await tagForm.validateFields();
      const newTag = {
        id: Date.now(),
        name: values.name
      };
      setTags([...tags, newTag]);
      message.success('标签添加成功');
      tagForm.resetFields();
    } catch (error) {
      message.error('添加失败');
    }
  };

  // 删除标签
  const handleDeleteTag = async (id) => {
    setTags(tags.filter(item => item.id !== id));
    message.success('标签删除成功');
  };

  // 添加轮播图项
  const handleAddCarouselItem = async () => {
    try {
      const values = await carouselForm.validateFields();
      const newItem = {
        id: Date.now(),
        ...values,
        order: carouselItems.length + 1
      };
      setCarouselItems([...carouselItems, newItem]);
      message.success('轮播图项添加成功');
      carouselForm.resetFields();
    } catch (error) {
      message.error('添加失败');
    }
  };

  // 调整轮播图顺序
  const moveCarouselItem = (id, direction) => {
    const index = carouselItems.findIndex(item => item.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === carouselItems.length - 1)
    ) {
      return;
    }
    
    const newItems = [...carouselItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    setCarouselItems(newItems);
    message.success('顺序调整成功');
  };

  // 删除轮播图项
  const handleDeleteCarouselItem = async (id) => {
    setCarouselItems(carouselItems.filter(item => item.id !== id));
    message.success('轮播图项删除成功');
  };

  // 上传图片前的处理
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    return isImage;
  };

  return (
    <Layout>
      <Navbar currentUser={currentUser} />
    <Card 
      title="系统设置" 
      bordered={false}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarStyle={{ marginBottom: 24 }}
      >
        {/* 分类管理 */}
        <TabPane tab="成果分类" key="categories">
          <div style={{ marginBottom: 24 }}>
            <Form form={categoryForm} layout="inline">
              <Form.Item
                name="name"
                rules={[{ required: true, message: '请输入分类名称' }]}
              >
                <Input 
                  placeholder="请输入分类名称" 
                  style={{ width: 300 }}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCategory}
                >
                  添加分类
                </Button>
              </Form.Item>
            </Form>
          </div>
          
          <Table
            rowKey="id"
            columns={[
              {
                title: '分类ID',
                dataIndex: 'id',
                width: 100,
              },
              {
                title: '分类名称',
                dataIndex: 'name',
                render: (text) => <Tag color="blue">{text}</Tag>,
              },
              {
                title: '操作',
                width: 150,
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditCategory(record)}
                    />
                    <Popconfirm
                      title="确定删除此分类？"
                      onConfirm={() => handleDeleteCategory(record.id)}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={categories}
            pagination={false}
            loading={loading}
            size="small"
          />
        </TabPane>

        {/* 标签管理 */}
        <TabPane tab="成果标签" key="tags">
          <div style={{ marginBottom: 24 }}>
            <Form form={tagForm} layout="inline">
              <Form.Item
                name="name"
                rules={[{ required: true, message: '请输入标签名称' }]}
              >
                <Input 
                  placeholder="请输入标签名称" 
                  style={{ width: 300 }}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddTag}
                >
                  添加标签
                </Button>
              </Form.Item>
            </Form>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Tag color="cyan">共 {tags.length} 个标签</Tag>
          </div>
          
          <div>
            {tags.map(tag => (
              <Tag
                key={tag.id}
                closable
                onClose={() => handleDeleteTag(tag.id)}
                style={{ marginBottom: 8, padding: '4px 8px' }}
              >
                {tag.name}
              </Tag>
            ))}
          </div>
        </TabPane>

        {/* 首页轮播管理 */}
        <TabPane tab="首页轮播" key="carousel">
          <div style={{ marginBottom: 24 }}>
            <Form form={carouselForm} layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="标题"
                    rules={[{ required: true, message: '请输入标题' }]}
                  >
                    <Input placeholder="请输入标题" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="link"
                    label="链接"
                    rules={[{ 
                      required: true, 
                      message: '请输入链接',
                      type: 'url',
                      warningOnly: true
                    }]}
                  >
                    <Input placeholder="请输入链接地址" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="描述"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <Input.TextArea 
                  placeholder="请输入描述" 
                  rows={3} 
                />
              </Form.Item>
              
              <Form.Item
                name="imageUrl"
                label="轮播图片"
                rules={[{ required: true, message: '请上传图片' }]}
              >
                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={({ file, onSuccess }) => {
                    // 模拟上传
                    setTimeout(() => {
                      const url = URL.createObjectURL(file);
                      carouselForm.setFieldsValue({ imageUrl: url });
                      onSuccess(url, file);
                    }, 500);
                  }}
                >
                  {carouselForm.getFieldValue('imageUrl') ? (
                    <Image
                      src={carouselForm.getFieldValue('imageUrl')}
                      alt="轮播图"
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCarouselItem}
                >
                  添加轮播图项
                </Button>
              </Form.Item>
            </Form>
          </div>
          
          <Table
            rowKey="id"
            columns={[
              {
                title: '排序',
                width: 80,
                render: (_, record) => (
                  <Space>
                    <Button 
                      size="small" 
                      icon={<ArrowUpOutlined />}
                      onClick={() => moveCarouselItem(record.id, 'up')}
                    />
                    <Button 
                      size="small" 
                      icon={<ArrowDownOutlined />}
                      onClick={() => moveCarouselItem(record.id, 'down')}
                    />
                  </Space>
                ),
              },
              {
                title: '预览',
                width: 150,
                render: (_, record) => (
                  <Image
                    src={record.imageUrl}
                    width={120}
                    height={60}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                ),
              },
              {
                title: '标题',
                dataIndex: 'title',
                render: (text) => <strong>{text}</strong>,
              },
              {
                title: '描述',
                dataIndex: 'description',
                ellipsis: true,
              },
              {
                title: '链接',
                dataIndex: 'link',
                render: (link) => (
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                ),
              },
              {
                title: '操作',
                width: 80,
                render: (_, record) => (
                  <Popconfirm
                    title="确定删除此项？"
                    onConfirm={() => handleDeleteCarouselItem(record.id)}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                ),
              },
            ]}
            dataSource={carouselItems}
            pagination={false}
            loading={loading}
          />
        </TabPane>

      </Tabs>
    </Card>
    <Footer style={{ textAlign: 'center' }}>
            学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
          </Footer>
    </Layout>
  );
};

export default SystemSettingsPage;