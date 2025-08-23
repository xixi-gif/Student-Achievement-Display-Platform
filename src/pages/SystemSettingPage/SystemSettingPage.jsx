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
  // 新增轮播图相关状态
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentEditCarousel, setCurrentEditCarousel] = useState(null);
  // 新增：存储临时图片信息
  const [tempImage, setTempImage] = useState(null);


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

        // 加载轮播图数据
        try {
          const carouselRes = await adminApi.getCarouselList();
          setCarouselItems(carouselRes.code === 0 ? carouselRes.data : mockCarouselItems);
        } catch (error) {
          console.log('获取轮播图数据失败，使用模拟数据', error);
          setCarouselItems(mockCarouselItems);
        }
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

    const response = await adminApi.createCategory(categoryName); 
    
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

      const response = await adminApi.createTag(tagName); 

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
      } else if (activeTab === 'tags') {
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
        } else if (activeTab === 'carousel') {
          // 轮播图删除逻辑
          setCarouselLoading(true);
          const response = await adminApi.deleteCarousel(deleteId);
          if (response.code === 0) {
            message.success('轮播图删除成功');
            const res = await adminApi.getCarouselList();
            if (res.code === 0) {
              setCarouselItems(res.data || []);
            }
            if (currentEditCarousel?.id === deleteId) {
              carouselForm.resetFields();
              setCurrentEditCarousel(null);
              setTempImage(null);
            }
          } else {
            message.error('删除失败：' + (response.message || '服务器处理错误'));
          }
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
      setCarouselLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDeleteId(null);
  };


  // 轮播图功能完善 - 调整为本地缓存图片
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;
    
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    
    // 本地读取图片并显示预览，不立即上传到服务器
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      setTempImage({
        file,
        base64Url: e.target.result,
        fileType: file.type
      });
      // 设置表单字段用于验证，但不包含实际的base64数据
      carouselForm.setFieldsValue({ imageUrl: 'local-preview' });
    };
    
    return false; // 阻止自动上传
  };

  // 移除临时图片
  const removeTempImage = () => {
    setTempImage(null);
    carouselForm.setFieldsValue({ imageUrl: '' });
  };

const handleAddOrEditCarousel = async () => {
    try {
      // 1. 验证表单
      const values = await carouselForm.validateFields();
      
      // 2. 处理图片数据 - 放入imageUrl字段
      let imageUrl = values.imageUrl;
      if (tempImage) {
        // 提取base64数据部分（去除data:image/xxx;base64,前缀）
        imageUrl = tempImage.base64Url;
      } else if (currentEditCarousel) {
        // 编辑状态且未上传新图片，保留原图片URL
        imageUrl = currentEditCarousel.imageUrl;
      }

      // 3. 组装完整 payload - 只包含后端需要的字段
      const payload = {
        description: values.description || '',
        link: values.link,
        title: values.title,
        imageUrl: imageUrl  // 使用后端期望的字段名
      };

      setCarouselLoading(true);
      
      if (currentEditCarousel) {
        // 编辑模式
        const res = await adminApi.updateCarousel(currentEditCarousel.id, payload);
        if (res.code === 0) {
          message.success('轮播图更新成功');
          // 更新本地列表
          const updatedItems = carouselItems.map(item => 
            item.id === currentEditCarousel.id ? { 
              ...item, 
              ...payload
            } : item
          );
          setCarouselItems(updatedItems);
          resetCarouselForm();
        } else {
          message.error('更新失败：' + (res.message || '服务器错误'));
        }
      } else {
        // 添加模式
        const res = await adminApi.addCarousel(payload);
        if (res.code === 0) {
          message.success('轮播图添加成功');
          // 添加到本地列表
          setCarouselItems([...carouselItems, { 
            ...payload, 
            id: res.data.id
          }]);
          resetCarouselForm();
        } else {
          message.error('添加失败：' + (res.message || '服务器错误'));
        }
      }
    } catch (error) {
      if (error.name !== 'ValidateError') {
        message.error('操作失败：' + (error.message || '网络异常'));
      }
    } finally {
      setCarouselLoading(false);
    }
  };

  const resetCarouselForm = () => {
    carouselForm.resetFields();
    setCurrentEditCarousel(null);
    setTempImage(null);
  };

  const handleEditCarousel = (record) => {
    setCurrentEditCarousel(record);
    carouselForm.setFieldsValue({
      title: record.title,
      description: record.description,
      imageUrl: record.imageUrl ? 'local-preview' : '',
      link: record.link
    });
    setTempImage(null);
  };

  const moveCarouselItem = async (id, direction) => {
    const index = carouselItems.findIndex(item => item.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === carouselItems.length - 1)) return;
    
    const newItems = [...carouselItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const swappedId = newItems[newIndex].id;

    try {
      setCarouselLoading(true);
      // 调整排序接口
      const res = await adminApi.updateCarouselOrder({
        id,
        targetId: swappedId,
        direction
      });

      if (res.code === 0) {
        // 交换前端数据
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
        setCarouselItems(newItems);
        message.success('顺序调整成功');
      } else {
        message.error('排序失败：' + (res.message || '服务器错误'));
      }
    } catch (error) {
      message.error('排序操作失败：' + error.message);
    } finally {
      setCarouselLoading(false);
    }
  };

  const handleDeleteCarouselItem = (id) => {
    setDeleteId(id);
    setDeleteModalVisible(true);
  };


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar currentUser={currentUser} />
      <Content style={{ padding: '24px 5%', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card title="系统设置" bordered={false}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 24 }}>
              {/* 成果分类标签页 */}
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

              {/* 成果标签标签页 */}
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

              {/* 首页轮播标签页（修改后） */}
              <TabPane tab="首页轮播" key="carousel">
                <div style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 4 }}>
                  <h3 style={{ marginBottom: 16 }}>
                    {currentEditCarousel ? '编辑轮播图' : '添加轮播图'}
                  </h3>
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
                    <Form.Item 
                      name="imageUrl" 
                      label="轮播图片" 
                      rules={[{ required: true, message: '请上传图片' }]}
                      extra="支持JPG/PNG格式，建议尺寸1200x400px，大小不超过2MB"
                    >
                      <Upload
                        name="image"
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        disabled={uploading}
                      >
                        {tempImage ? (
                          <div style={{ position: 'relative' }}>
                            <Image 
                              src={tempImage.base64Url} 
                              alt="轮播图预览" 
                              style={{ width: '100%', borderRadius: 4 }} 
                            />
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTempImage();
                              }}
                            />
                          </div>
                        ) : currentEditCarousel && currentEditCarousel.imageUrl ? (
                          // 编辑状态显示已有图片
                          <div style={{ position: 'relative' }}>
                            <Image 
                              src={currentEditCarousel.imageUrl} 
                              alt="轮播图预览" 
                              style={{ width: '100%', borderRadius: 4 }} 
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              padding: '4px 8px',
                              fontSize: 12,
                              textAlign: 'center'
                            }}>
                              点击上传新图片替换
                            </div>
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTempImage();
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{ padding: 24, textAlign: 'center' }}>
                            <UploadOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                            <div style={{ marginTop: 8 }}>点击上传图片</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={currentEditCarousel ? <SaveOutlined /> : <PlusOutlined />} 
                          onClick={handleAddOrEditCarousel}
                          loading={carouselLoading}
                        >
                          {currentEditCarousel ? '保存修改' : '添加轮播图'}
                        </Button>
                        {currentEditCarousel && (
                          <Button onClick={resetCarouselForm}>取消编辑</Button>
                        )}
                      </Space>
                    </Form.Item>
                  </Form>
                </div>

                <Table
                  rowKey="id"
                  columns={[
                    {
                      title: '排序',
                      width: 120,
                      render: (_, record) => (
                        <Space>
                          <Button 
                            size="small" 
                            icon={<ArrowUpOutlined />} 
                            onClick={() => moveCarouselItem(record.id, 'up')}
                            disabled={carouselLoading || carouselItems.indexOf(record) === 0}
                          />
                          <Button 
                            size="small" 
                            icon={<ArrowDownOutlined />} 
                            onClick={() => moveCarouselItem(record.id, 'down')}
                            disabled={carouselLoading || carouselItems.indexOf(record) === carouselItems.length - 1}
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
                          alt="轮播图预览" 
                        />
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
                      width: 160,
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditCarousel(record)}
                            disabled={carouselLoading}
                          >
                            编辑
                          </Button>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDeleteCarouselItem(record.id)}
                            disabled={carouselLoading}
                          />
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={carouselItems}
                  pagination={false}
                  loading={carouselLoading}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </Content>

      {/* 统一删除弹窗 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        confirmLoading={activeTab === 'categories' ? loading : activeTab === 'tags' ? tagLoading : carouselLoading}
        maskClosable={false}
        destroyOnClose={true}
      >
        <p>确定要删除此{
          activeTab === 'categories' ? '分类' : 
          activeTab === 'tags' ? '标签' : '轮播图项'
        }吗？删除后不可恢复。</p>
      </Modal>

      <Footer style={{ textAlign: 'center' }}>
        学生成果展示平台 ©{new Date().getFullYear()} 汕头大学数学与计算机学院计算机系
      </Footer>
    </Layout>
  );
};

export default SystemSettingsPage;
