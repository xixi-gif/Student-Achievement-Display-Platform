import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';

// 定义需要登录才能访问的路由路径
const protectedPaths = [
  '/student/profile',
  '/author',
  '/achievements',
  '/achievement/detail',
  '/student/my-achievements',
  '/student/achievement/create',
  '/student/achievements/edit',
  '/chat',
  '/teacher/profile',
  '/teacher/achievements/recommend',
  '/teacher/achievements/review',
  '/admin/profile',
  '/admin/manage-users',
  '/admin/system-settings',
  '/admin/data-statistics',
  '/publish-requirement',
  '/messages',
];

const AuthRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const currentPath = window.location.pathname;

  // 检查当前路径是否需要登录权限
  const needAuth = protectedPaths.some(path => currentPath.startsWith(path));

  if (needAuth && !isAuthenticated) {
    // 保存当前地址，登录后跳转回来
    localStorage.setItem('redirectFrom', currentPath);
    message.info('请先注册登录后查看详情');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthRoute;