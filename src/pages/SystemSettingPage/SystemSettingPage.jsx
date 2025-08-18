import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, message, Table, Upload, Card, Tag, Space, Modal, Image, Row, Col, Layout } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowUpOutlined, ArrowDownOutlined, SaveOutlined } from '@ant-design/icons';
import Navbar from '../Navbar/Navbar';
import { adminApi } from '../../service/api';

const { TabPane } = Tabs;
const { Footer, Content } = Layout;

const mockCarouselItems = [
  {
    id: 1,
    title: '2023年度优秀成果展',
    description: '展示本年度学生优秀科研成果',
    imageUrl: 'https://example.com/banner1.jpg',
    link: '/achievements',
    order: 1
  }
];

const SystemSettingsPage = () => {

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]); 
  const [tags, setTags] = useState([]); 
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [tagLoading, setTagLoading] = useState(false); 
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null); 


  const [categoryForm] = Form.useForm();
  const [tagForm] = Form.useForm();
  const [carouselForm] = Form.useForm();


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setTagLoading(true);
      try {
        const role = localStorage.getItem('user_role') || 'visitor';
        const username = localStorage.getItem('username') || '访客';
        setCurrentUser({ 
          role, 
          username, 
          avatar: `https://picsum.photos/id/${1030 + Math.floor(Math.random() * 10)}/200/200` 
        });

        const [categoryRes, tagRes] = await Promise.all([
          adminApi.getCategoryList(), 
          adminApi.getTagList()      
        ]);

        if (categoryRes.code === 0) {
          const formattedCategories = (categoryRes.data || []).map(item => {
            let name = item.name || item.categoryName || '';
            try {
              const parsed = JSON.parse(name);
              if (parsed.name) name = parsed.name;
            } catch (e) {}
            if (name.startsWith('name=')) name = name.replace('name=', '');
            try { name = decodeURIComponent(name); } catch (e) {}
            
            return {
              id: item.id || item.categoryId,
              name
            };
          });
          setCategories(formattedCategories);
        } else {
          message.error('获取分类失败：' + (categoryRes.message || '接口返回错误'));
        }

        if (tagRes.code === 0) {
          const validTags = (tagRes.data || []).filter(item => !item.isDeleted)
            .map(item => ({ 
              id: item.id || item.tagId,
              name: item.name || item.tagName || ''
            }));
          setTags(validTags);
        } else {
          message.error('获取标签失败：' + (tagRes.message || '接口返回错误'));
        }

        setCarouselItems(mockCarouselItems);
      } catch (error) {
        message.error('初始化数据失败：' + (error.message || '未知错误'));
      } finally {
        setLoading(false);
        setTagLoading(false);
      }
    };

    fetchAllData();
  }, []);


  const handleAddCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      const categoryName = values.name.trim();
      
      if (!categoryName) {
        message.warning('分类名称不能为空');
        return;
      }

      setLoading(true);
      const formData = new URLSearchParams();
      formData.append('name', categoryName);
      const response = await adminApi.createCategory(formData); 
      
      if (response.code === 0) {
        message.success('分类添加成功');
        categoryForm.resetFields();
  
        const res = await adminApi.getCategoryList();
        if (res.code === 0) {
          setCategories(res.data.map(item => ({
            id: item.id || item.categoryId,
            name: item.name || item.categoryName || ''
          })));
        }
      } else {
        message.error('添加失败：' + (response.message || '服务器处理错误'));
      }
    } catch (error) {
      if (error.name !== 'ValidateError') {
        message.error('添加失败：' + (error.message || '操作异常'));
      }
    } finally {
      setLoading(false);
    }
  };



  const handleEditCategory = (record) => {
    setCurrentEditId(record.id);
    categoryForm.setFieldsValue({ name: record.name });
  };



  const handleUpdateCategory = async () => {
    if (!currentEditId) {
      message.warning('未选择编辑的分类');
      return;
    }

    try {
      const values = await categoryForm.validateFields();
      const categoryName = values.name.trim();
      
      if (!categoryName) {
        message.warning('分类名称不能为空');
        return;
      }

      setLoading(true);
      const formData = new URLSearchParams();
      formData.append('name', categoryName);
      const response = await adminApi.updateCategory?.(currentEditId, formData); 
      
      if (response?.code === 0) {
        message.success('分类更新成功');
        categoryForm.resetFields();
        setCurrentEditId(null);
        const res = await adminApi.getCategoryList();
        if (res.code === 0) {
          setCategories(res.data.map(item => ({
            id: item.id || item.categoryId,
            name: item.name || item.categoryName || ''
          })));
        }
      } else {
        message.error('更新失败：' + (response?.message || '服务器处理错误或接口不存在'));
      }
    } catch (error) {
      if (error.name !== 'ValidateError') {
        message.error('更新失败：' + (error.message || '操作异常'));
      }
    } finally {
      setLoading(false);
    }
  };


  
  const handleDeleteCategory = (id) => {
    setDeleteId(id);
    setDeleteModalVisible(true);
  };



  const handleAddTag = async () => {
    try {
      const values = await tagForm.validateFields();
      const tagName = values.name?.trim();
      
      if (!tagName) {
        message.warning('请输入有效的标签名称');
        return;
      }

      setTagLoading(true);
      const formData = new URLSearchParams();
      formData.append('name', tagName);
      const response = await adminApi.createTag(formData); 

      if (response.code === 0) {
        message.success('标签添加成功');
        tagForm.resetFields();
        const res = await adminApi.getTagList();
        if (res.code === 0) {
          setTags(res.data.filter(item => !item.isDeleted).map(item => ({
            id: item.id || item.tagId,
            name: item.name || item.tagName || ''
          })));
        }
      } else {
        message.error('添加失败：' + (response.message || '服务器处理错误'));
      }
    } catch (error) {
      if (error.name !== 'ValidateError') {
        console.error('添加标签异常：', error);
        message.error('添加标签出错：' + (error.message || '操作异常'));
      }
    } finally {
      setTagLoading(false);
    }
  };



  const handleTagDeleteClick = (id, e) => {
    e.preventDefault();
    setDeleteId(id);
    setDeleteModalVisible(true);
  };



  const confirmDelete = async () => {
    if (!deleteId) {
      message.warning('未获取到ID，请重试');
      setDeleteModalVisible(false);
      return;
    }

    try {
      if (activeTab === 'categories') {
        setLoading(true);
        const response = await adminApi.deleteCategory(deleteId);
        if (response.code === 0) {
          message.success('分类删除成功');
          const res = await adminApi.getCategoryList();
          if (res.code === 0) {
            setCategories(res.data.map(item => ({
              id: item.id || item.categoryId,
              name: item.name || item.categoryName || ''
            })));
          }
          if (currentEditId === deleteId) {
            categoryForm.resetFields();
            setCurrentEditId(null);
          }
        } else {
          message.error('删除失败：' + (response.message || '服务器处理错误'));
        }
      } else {
        setTagLoading(true);
        const response = await adminApi.deleteTag(deleteId);
        if (response.code === 0) {
          message.success('标签删除成功');
          const res = await adminApi.getTagList();
          if (res.code === 0) {
            setTags(res.data.filter(item => !item.isDeleted).map(item => ({
              id: item.id || item.tagId,
              name: item.name || item.tagName || ''
            })));
          }
        } else {
          message.error('删除失败：' + (response.message || '服务器处理错误'));
        }
      }
    } catch (error) {
      console.error('删除异常：', error);
      message.error('删除失败：' + (error.message || '网络异常'));
    } finally {
      setDeleteModalVisible(false);
      setDeleteId(null);
      setLoading(false);
      setTagLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDeleteId(null);
  };


//轮播（需要修改）
  const handleAddCarouselItem = async () => {
    try {
      const values = await carouselForm.validateFields();
      const newItem = { id: Date.now(), ...values, order: carouselItems.length + 1 };
      setCarouselItems([...carouselItems, newItem]);
      message.success('轮播图项添加成功');
      carouselForm.resetFields();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const moveCarouselItem = (id, direction) => {
    const index = carouselItems.findIndex(item => item.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === carouselItems.length - 1)) return;
    const newItems = [...carouselItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setCarouselItems(newItems);
    message.success('顺序调整成功');
  };

  const handleDeleteCarouselItem = (id) => {
    setCarouselItems(carouselItems.filter(item => item.id !== id));
    message.success('轮播图项删除成功');
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) message.error('只能上传图片文件!');
    return isImage;
  };


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: '24px 5%', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card title="系统设置" bordered={false}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 24 }}>
              {/* 成果分类标签页（对应categories接口） */}
              <TabPane tab="成果分类" key="categories">
                <div style={{ marginBottom: 24 }}>
                  <Form form={categoryForm} layout="inline">
                    <Form.Item 
                      name="name" 
                      rules={[
                        { required: true, message: '请输入分类名称' },
                        { max: 20, message: '分类名称长度不能超过20个字符' }
                      ]}
                    >
                      <Input placeholder="请输入分类名称" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item>
                      {currentEditId ? (
                        <Space>
                          <Button 
                            type="primary" 
                            icon={<SaveOutlined />} 
                            onClick={handleUpdateCategory}
                            loading={loading}
                          >
                            保存修改
                          </Button>
                          <Button 
                            onClick={() => {
                              categoryForm.resetFields();
                              setCurrentEditId(null);
                            }}
                          >
                            取消
                          </Button>
                        </Space>
                      ) : (
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />} 
                          onClick={handleAddCategory}
                          loading={loading}
                        >
                          添加分类
                        </Button>
                      )}
                    </Form.Item>
                  </Form>
                </div>

                <Table
                  rowKey="id"
                  columns={[
                    { title: '序号', width: 80, render: (_, __, index) => index + 1 },
                    { title: '分类名称', dataIndex: 'name', render: (text) => <Tag color="blue">{text}</Tag> },
                    {
                      title: '操作',
                      width: 200,
                      render: (_, record) => (
                        <Space>
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteCategory(record.id)}
                            loading={loading}
                          />
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

              {/* 成果标签标签页（对应tags接口） */}
              <TabPane tab="成果标签" key="tags">
                <div style={{ marginBottom: 24 }}>
                  <Form form={tagForm} layout="inline">
                    <Form.Item name="name" rules={[{ required: true, message: '请输入标签名称' }]}>
                      <Input placeholder="请输入标签名称" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddTag}
                        loading={tagLoading}
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
                  {tags.length > 0 ? (
                    tags.map(tag => (
                      <Tag
                        key={tag.id}
                        closable
                        onClose={(e) => handleTagDeleteClick(tag.id, e)}
                        style={{ marginBottom: 8, padding: '4px 8px', fontSize: 14 }}
                      >
                        {tag.name}
                      </Tag>
                    ))
                  ) : (
                    <div style={{ 
                      color: '#999', 
                      padding: '24px', 
                      textAlign: 'center',
                      border: '1px dashed #e8e8e8',
                      borderRadius: 4
                    }}>
                      {tagLoading ? '加载中...' : '暂无标签，请点击上方按钮添加'}
                    </div>
                  )}
                </div>
              </TabPane>

              {/* 首页轮播标签页（保持不变） */}
              <TabPane tab="首页轮播" key="carousel">
                <div style={{ marginBottom: 24 }}>
                  <Form form={carouselForm} layout="vertical">
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                          <Input placeholder="请输入标题" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="link" label="链接" rules={[{ 
                          required: true, 
                          message: '请输入链接',
                          type: 'url',
                          warningOnly: true
                        }]}>
                          <Input placeholder="请输入链接地址" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
                      <Input.TextArea placeholder="请输入描述" rows={3} />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="轮播图片" rules={[{ required: true, message: '请上传图片' }]}>
                      <Upload
                        name="image"
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        customRequest={({ file, onSuccess }) => {
                          setTimeout(() => {
                            const url = URL.createObjectURL(file);
                            carouselForm.setFieldsValue({ imageUrl: url });
                            onSuccess(url, file);
                          }, 500);
                        }}
                      >
                        {carouselForm.getFieldValue('imageUrl') ? (
                          <Image src={carouselForm.getFieldValue('imageUrl')} alt="轮播图" style={{ width: '100%' }} />
                        ) : (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>上传图片</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCarouselItem}>
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
                          <Button size="small" icon={<ArrowUpOutlined />} onClick={() => moveCarouselItem(record.id, 'up')} />
                          <Button size="small" icon={<ArrowDownOutlined />} onClick={() => moveCarouselItem(record.id, 'down')} />
                        </Space>
                      ),
                    },
                    {
                      title: '预览',
                      width: 150,
                      render: (_, record) => (
                        <Image src={record.imageUrl} width={120} height={60} style={{ objectFit: 'cover' }} preview={false} alt="轮播图预览" />
                      ),
                    },
                    { title: '标题', dataIndex: 'title', render: (text) => <strong>{text}</strong> },
                    { title: '描述', dataIndex: 'description', ellipsis: true },
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
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleDeleteCarouselItem(record.id)}
                        />
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
        </div>
      </Content>

      {/* 统一删除弹窗（保持不变） */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        confirmLoading={activeTab === 'categories' ? loading : tagLoading}
        maskClosable={false}
        destroyOnClose={true}
      >
        <p>确定要删除此{activeTab === 'categories' ? '分类' : '标签'}吗？删除后不可恢复。</p>
      </Modal>

      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default SystemSettingsPage;