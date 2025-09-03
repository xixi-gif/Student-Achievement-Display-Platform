import axios from 'axios';
import { data } from 'react-router-dom';

const service = axios.create({
  baseURL: 'http://localhost:8090', 
  timeout: 5000,
  withCredentials: true ,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
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
    console.log('响应数据:', res); 

    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res;
    }

    if (typeof res !== 'object' || res === null) {
      return res;
    }

    if (res.code === 0) {
      return res;
    }

    console.error('业务错误:', res.message);
    return { ...res, _isError: true }; 
  },
  error => {
    console.error('网络/服务器错误:', error);
    const errorInfo = {
      code: error.response?.status || 500,
      message: error.message || '网络请求失败',
      _isError: true 
    };
    return { ...errorInfo };
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
  logout: () => service.post('/user/logout'),
  //发布请求
  addRequirement:(data)=> service.post('/requirements',data),
  //获取请求列表
  getRequirement:(params)=> service.get('/requirements',{params}),
  //需求详情
  getRequirementByid:(id)=>service.get(`/requirements/${id}`),
  //会话
  getConversationRecords:()=>service.get('/conversations'),
  sendMessage:(data)=>service.post('/conversations',data),
  deleteConversation:(conversationId)=>service.delete(`/conversations/${conversationId}`),
  muteConversation:(conversationId)=>service.put(`/conversations/${conversationId}/mute`),
  pinConversation:(conversationId)=>service.put(`/conversations/${conversationId}/pin`),
  unmuteConversation:(conversationId)=>service.put(`/conversations/${conversationId}/unmute`),
  unpinConversation:(conversationId)=>service.put(`/conversations/${conversationId}/unpin`),
  //消息
  getConversationMessages:(conversationId)=>service.get(`/messages/conversation/${conversationId}`),
  markAsRead:(conversationId)=>service.put(`/messages/conversation/${conversationId}/read`),
  getUnreadCount:(conversationId)=>service.get(`/messages/conversation/${conversationId}/unread-count`),
  searchMessages:(data)=>service.get('/messages/search',data),
  getTotalUnreadCount:(data)=>service.get('/messages/total-unread-count',data),
  deleteMesaage:(messageId)=>service.delete(`/messages/${messageId}`),
  recallMessage:(messageId)=>service.put(`/messages/${messageId}/recall`),

  //需求申请
  addApplication: (id, data) => service.post(`/application/${id}/apply`, data),
  getApplicationList: (data) =>service.post('/application/list',data),
  getMyApplicationList: (data) => service.get('/application/my',data),
  agreeApplication:(data) => service.post('/application/status',data),
  cancelApplication:(data) => service.post('/application/cancel',data),

  //需求
  getMyRequirements:(data)=>service.get('/requirements/my',data),
  deleteRequirements:(id) => service.delete(`/requirements/${id}`),
  updateRequirement:(data)=>service.put('/requirements/status',data),

};

export const announcementApi = {
  getList: (params) => service.get('/announcements', { params }),
  getDetail: (id) => service.get(`/announcements/${id}`),
  createAnnouncement: (data) => service.post('/announcements', data),
  // 批量删除（支持单条）
  deleteAnnouncement: (ids) => {
  // 确保参数是数组格式，即使单条删除也包装成数组
  const idList = Array.isArray(ids) ? ids : [ids];
  return service.post('/announcements/batch-delete', { ids: idList });
}
};


export const authorApi = {
  // 获取用户公开信息
  getUserPublicInfo: (userId) => service.get(`/user/public/info/?userId=${userId}`),
};

// 在api.js中添加评论相关的接口
export const commentApi = {
  // 添加评论
  addComment: (data) => service.post('/comment/add', data),
  // 获取评论列表
  getCommentList: (params) => service.get('/comment/list', { params })
};

export const achievementApi = {
  getList: (params) => service.get('/student/achievements',{params}),
  getDetail: (id) => service.get(`/student/achievements/${id}`),
  getMyAchievements: () => service.get('/achievement/my/achievements'),
  createAchievement: (data) => service.post('/achievement/add', data,{
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}),
  updateAchievement: (data) => service.post(`/achievement/update`,data,{
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}),
  deleteAchievement: (id) => service.post('/achievement/delete',{ id }),
  // 搜索学生或指导教师
  searchStudents: (params) => service.get('/student/search', { params }),
  searchTeachers: (params) => service.post('/teacher/search', null, { params }),
  // 点赞接口
  likeAchievement: (data) => service.post('/achievement/like/add', data),
  cancelLikeAchievement: (data) => service.post('/achievement/like/cancel', data),

  // 获取待审核成果列表
  getPendingList: (params) => service.get(`/teacher/review`, { params }),
  // 审核通过
  approve: (id) => service.post(`/teacher/review/approve`,null,{ params: { id } }),
  // 审核驳回
  reject: (id, reason) => service.post(`/teacher/review/reject`, {id, reason }),
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
  updateProfile: (data) => service.post('/teacher/profile', data),
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
  updateUser: (data) => service.post(`/admin/update/`, data),
 
  deleteUser: (params) => service.post('/admin/delete', params),

  resetUserPassword: (id, password) => service.put(`/admin/password`, { password } ,{ params: { id } }),
  toggleUserStatus: (id, status) => service.post(`/admin/users/${id}/status`, { status }),
  
  // 数据统计接口
  getStatistics: () => service.get('/admin/stats/summary'),
  getStatsTrend: (params) => service.get('/stats/achievement-trends',{params}),
  getAchievementStats: () => service.get('/stats/achievement-types'),
  getUserStats: () => service.get('/stats/user-activity'),

  //分类设置接口
  getCategoryList: () => service.get('/admin/categories'),
  createCategory: (categoryName) => {
    const params = new URLSearchParams();
    params.append('name', categoryName); 
    return service.post(`/admin/categories/add?${params}`); 
  },

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
  // createTag: (data) => service.post('/tags/add', data),
  createTag: (tagName) => {
    const params = new URLSearchParams();
    params.append('name', tagName); 
    return service.post(`/tags/add?${params}`); 
  },
  deleteTag: (id) => service.delete(`/tags/${id}`),
  
  // 系统设置接口
  getSystemSettings: () => service.get('/admin/settings'),
  updateSystemSettings: (data) => service.put('/admin/settings', data),
  
  // 成果管理接口
  getAllAchievements: (data) => service.post('/admin/achievement/list', data),
  addAchievement: (data) => service.post('/admin/achievement/add', data),
  deleteAchievement: (ids) => service.post('/admin/achievement/batch-delete',ids),
  updateAchievementStatus: (params) => {
  const queryParams = new URLSearchParams(); // 将数组参数转换为查询字符串格式
  params.achievementIds.forEach(id => queryParams.append('achievementIds', id));
  queryParams.append('status', params.status);
  
  return service.post(`/admin/achievement/batch-update-status?${queryParams.toString()}`);
},
  

  // 轮播图
  addCarousel: (formData) => {
    return service.post('/carousel/upload', formData, {
      headers: { 'Content-Type': undefined }
    });
  },

  updateCarousel: (formData) => {
    return service.put(`/carousel/update`, formData, {
      headers: { 'Content-Type': undefined }
    });
  },
  
  deleteCarousel:(id) => service.delete(`/carousel/${id}`),
  getCarousel:(params) => service.get('/carousel',{params}),
  //轮播图顺序
  adjustSequence: (id, direction) => service.put(
    `/carousel/${id}/sequence`,
    null, 
    { params: { direction } } 
  ),
  
  
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
  adminApi,
  commentApi
};