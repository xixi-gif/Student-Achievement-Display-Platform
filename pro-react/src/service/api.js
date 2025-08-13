import axios from 'axios';


const service = axios.create({
  baseURL: 'http://localhost:8090', // 后端 API 地址
  timeout: 5000
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
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      console.error('业务错误:', res.message);
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data;
  },
  error => {
    console.error('响应拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 用户接口（复用）
export const authApi = {
  login: (data) => service.post('/auth/login', data),
  register: (data) => service.post('/auth/register', data),
  forgotPassword: (data) => service.post('/auth/forgot-password', data),

  // 上传头像
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post(`/user/upload/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  // 修改个人信息
  updateInfo: (data) => service.post('/user/update/my', data),
  // 修改密码
  changePassword: (oldPassword, newPassword) => service.post('/user/change/password', { oldPassword, newPassword }),
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
  createAchievement: (data) => service.post('/student/achievements', data),
  updateAchievement: (id, data) => service.put(`/student/achievements/${id}`, data),

  // 获取待审核成果列表
  getPendingList: (params) => service.get(`/teacher/review`, { params }),
  // 审核通过
  approve: (id) => service.post(`/teacher/review/approve`,{id}),
  // 审核驳回
  reject: (id, reason) => service.post(`/teacher/review/reject`, { id,reason }),
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
  updateProfile: (data) => service.put('/student/profile', data),
};

export const teacherApi = {
  getProfile: () => service.get('/teacher/profile'),
  updateProfile: (data) => service.put('/teacher/update/profile', data),
  listReviewAchievements: () => service.get('/teacher/review'),
  listRecommendations: () => service.get('/teacher/recommend')
};

// 管理员相关接口
export const adminApi = {
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
  getCategoryList: () => service.get('/admin/categories'),
  createCategory: (data) => service.post('/admin/categories/add', data),
  deleteCategory: (id) => service.delete(`/admin/categories/delete`),

  //标签设置接口
  getTagList: () => service.get('/admin/tags'),
  createTag: (data) => service.post('/admin/tags', data),
  updateTag: (id, data) => service.put(`/admin/tags/${id}`, data),
  deleteTag: (id) => service.delete(`/admin/tags/${id}`),
  
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