import axios from 'axios';
import { data } from 'react-router-dom';

const service = axios.create({
  baseURL: 'http://localhost:8090', 
  timeout: 5000,
  withCredentials: true 
});

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject({ code: 500, message: error.message || '请求异常' });
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 0) { 
      console.error('业务错误:', res.message);
      return Promise.reject({ code: res.code, message: res.message || '服务器返回错误' });
    }
    return res; 
  },
  error => {
    console.error('响应拦截器错误:', error);
    // 网络错误或服务器错误处理
    return Promise.reject({ 
      code: error.response?.status || 500, 
      message: error.message || '网络请求失败' 
    });
  }
);


//公用
export const authApi = {
  login: (data) => service.post('/user/login', data),
  register: (data) => service.post('/user/register', data),
  forgotPassword: (data) => service.post('/auth/forgot-password', data),
  getuserlogin: (data) => service.get('/user/get/login',data),
  //上传头像
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('token');
    console.log('uploadAvatar - 从localStorage获取的Token:', token ? '存在（长度：' + token.length + '）' : '不存在');
    
    const headers = {
      'Content-Type': 'multipart/form-data',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    console.log('uploadAvatar - 请求头:', headers);
    
    return service.post(`/user/upload/avatar`, formData, { headers })
      .then(response => {
        console.log('uploadAvatar - 接口响应成功:', response);
        return response;
      })
      .catch(error => {
        console.log('uploadAvatar - 接口响应失败:', error);
        throw error;
      });
  },
  //忘记密码
  resetpassword: (data) => service.post('/user/reset/password', data),
  // 修改个人信息
  updateInfo: (data) => service.post('/user/update/my', data),
  // 修改密码
  updatePassword: (data) => service.post('/user/update/password', data),
  // 退出登录
  logout: () => service.post('/user/logout')
};

export const announcementApi = {
  getList: () => service.get('/announcements'),
  getDetail: (id) => service.get(`/announcements/${id}`),
};


export const authorApi = {
  getDetail: (id) => service.get(`/authors/${id}`),
};


export const achievementApi = {
  getList: () => service.get('/achievements'),
  getDetail: (id) => service.get(`/achievements/${id}`),
  getMyAchievements: () => service.get('/student/achievements'),
  createAchievement: (data) => service.post('/achievement/add', data,{
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateAchievement: (data) => service.post(`/achievement/update`,null,{ data }),
  deleteAchievement: (id) => service.post('/achievement/delete',null,{ params: { id } }),

  // 获取待审核成果列表
  getPendingList: (params) => service.get(`/teacher/review`, { params }),
  // 审核通过
  approve: (id) => service.post(`/teacher/review/approve`,null,{ params: { id } }),
  // 审核驳回
  reject: (id, reason) => service.post(`/teacher/review/reject`, { reason },{ params: { id } }),
  //获取推荐列表
  getRecommendList: (params) => service.get('/teacher/recommend', { params }),
  // 切换推荐状态
  toggleRecommend: (id) => service.post('/teacher/recommend/toggle', null, { params: { id } }),
  // 设置推荐等级
  setRecommendLevel: (id, level) => service.post('/teacher/recommend/level', null, {params: { id, recommendLevel: level } }),
  // 设置推荐原因
  setRecommendComment: (id, comment) => service.post('/teacher/recommend/comment', null, { 
    params: { id, recommendComment: comment } 
  })
};


export const studentApi = {
  getProfile: () => service.get('/student/profile'),
  updateProfile: (data) => service.put('/student/update', data),
  getAchievements: () => service.get('/student/achievements'),
  deleteAchievement: (id) => service.delete(`/student/achievements/${id}`)
};

export const teacherApi = {
  getProfile: () => service.get('/teacher/profile'),
  updateProfile: (data) => service.put('/teacher/update/profile', data),
  listReviewAchievements: () => service.get('/teacher/review'),
  listRecommendations: () => service.get('/teacher/recommend')
};

// 管理员相关接口
export const adminApi = {
  //个人中心
  getProfile:(data)=> service.get('/admin/profile',{data}),
  // 用户管理接口
  getUserList: (params) => service.get('/admin/user', { params }),
  createUser: (data) => service.post('/admin/add', data),
  updateUser: (id, data) => service.put(`/admin/update`, data),
  deleteUser: (id) => service.delete(`/admin/delete`),
  resetUserPassword: (id, password) => service.post(`/admin/password`, { password }),
  toggleUserStatus: (id, status) => service.post(`/admin/users/${id}/status`, { status }),
  
  // 数据统计接口
  getStatistics: () => service.get('/admin/statistics'),
  getAchievementStats: () => service.get('/admin/statistics/achievements'),
  getUserStats: () => service.get('/admin/statistics/users'),

  //分类设置接口
  getCategoryList: () => service.get('/admin/categories',),
  createCategory: (data) => service.post('/admin/categories/add', data),
  // deleteCategory: (id) => service.delete(`/admin/categories/delete`,id),
  deleteCategory: (id) => service.post(
    '/admin/categories/delete',
    null, 
    {
      params: { id }, 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  ),

  //标签设置接口
  getTagList: () => service.get('/tags/tags'),
  createTag: (data) => service.post('/tags/add', data),
  deleteTag: (id) => service.delete(`/tags/${id}`),
  
  // 系统设置接口
  getSystemSettings: () => service.get('/admin/settings'),
  updateSystemSettings: (data) => service.put('/admin/settings', data),
  
  // 成果管理接口
  getAllAchievements: (params) => service.get('/admin/achievements', { params }),
  deleteAchievement: (id) => service.delete(`/admin/achievements/${id}`),
  updateAchievementStatus: (id, status) => service.post(`/admin/achievements/${id}/status`, { status }),
  
  // 批量操作接口
  batchImportUsers: (data) => {
    const formData = new FormData();
    formData.append('file', data);
    return service.post('/admin/users/batch-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  batchDeleteUsers: (ids) => service.post('/admin/users/batch-delete', { ids }),
};

export default {
  authApi,
  announcementApi,
  authorApi,
  achievementApi,
  studentApi,
  teacherApi,
  adminApi
};