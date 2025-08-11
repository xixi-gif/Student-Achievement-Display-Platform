import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

// 检查登录状态并处理跳转
export const checkAuthAndNavigate = (navigate, targetPath) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (!isAuthenticated) {
    message.info('请先注册登录后查看');
    navigate('/login');
    return false;
  }
  
  navigate(targetPath);
  return true;
};

// 用于组件中的自定义Hook
export const useAuthNavigate = () => {
  const navigate = useNavigate();
  return (targetPath) => checkAuthAndNavigate(navigate, targetPath);
};