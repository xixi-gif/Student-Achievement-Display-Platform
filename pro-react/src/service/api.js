import axios from 'axios';


const service = axios.create({
  baseURL: 'http://localhost:8080/api', // 后端 API 地址
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


export const authApi = {
  login: (data) => service.post('/auth/login', data),
  register: (data) => service.post('/auth/register', data),
  forgotPassword: (data) => service.post('/auth/forgot-password', data),
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
};


export const studentApi = {
  getProfile: () => service.get('/student/profile'),
  updateProfile: (data) => service.put('/student/profile', data),
};

export default {
  authApi,
  announcementApi,
  authorApi,
  achievementApi,
  studentApi
};