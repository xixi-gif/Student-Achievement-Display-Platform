import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import MyAchievements from './pages/MyAchievements/MyAchievements';
import AnnouncementList from './pages/AnnouncementList/AnnouncementList';
import AnnouncementDetail from './pages/AnnouncementDetail/AnnoucementDetail';
import AchievementsPage from './pages/AchievementsPage/AchievementsPage';
import AchievementCreationPage from './pages/AchievementCreationPage/AchievementCreationPage';
import AchievementDetailPage from './pages/AchievementDetailPage/AchievementDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import AchievementReviewPage from './pages/AchievementReviewPage/AchievementReviewPage';
import AchievementForm from './pages/AchievementForm/AchievementForm';
import AchievementRecommendPage from './pages/AchievementRecommendPage/AchievementRecommendPage';
import UserManagementPage from './pages/UserManagePage/UserManagePage';
import SystemSettingsPage from './pages/SystemSettingPage/SystemSettingPage';
import DataStatisticsPage from './pages/DataStaticsPage/DataStaticsPage';
import AdminAchievementManagementPage from './pages/AchievementManagePage/AchievementManagePage';
import AdminProfilePage from './pages/AdminProfilePage/AdminProfilePage';
import TeacherProfilePage from './pages/TeacherProfilePage/TeacherProfilePage';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './App.css';
import AuthorDetailPage from './pages/AuthorDetailPage/AuthorDetailPage';
import AnnouncementPublish from './pages/AnnouncementPublish/AnnouncementPublish';

// 需求相关页面
import RequirementPublishPage from './pages/RequirementPublishPage/RequirementPublishPage';
import RequirementListPage from './pages/RequirementListPage/RequirementListPage';
import RequirementDetailPage from './pages/RequirementDetailPage/RequirementDetailPage';
import MessageCenterPage from './pages/RequireMessagePage/RequireMessagePage';
import ChatPage from './pages/ChatPage/ChatPage';

// 路由保护
import AuthRoute from './pages/AuthRoute/AuthRoute';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="app-container">
          <Routes>
            {/* 公开路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/announcements" element={<AnnouncementList/>} />
            <Route path="/announcements/detail" element={<AnnouncementDetail/>} />
            <Route path="/requirements" element={<RequirementListPage />} />
            <Route path="/requirements/:id" element={<RequirementDetailPage />} />

            {/* 需要权限验证的路由 */}
            <Route element={<AuthRoute/>}>
              {/* 学生相关路由 */}
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/my-achievements" element={<MyAchievements />} />
              <Route path="/student/achievement/create" element={<AchievementCreationPage />} />
              <Route path="/student/achievements/edit" element={<AchievementForm />} />
              
              {/* 公共功能路由 */}
              <Route path="/author" element={<AuthorDetailPage/>} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/achievement/detail" element={<AchievementDetailPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/publish-requirement" element={<RequirementPublishPage />} />
              <Route path="/messages" element={<MessageCenterPage />} />

              {/* 教师相关路由 */}
              <Route path="/teacher/achievements/review" element={<AchievementReviewPage />} />
              <Route path="/teacher/achievements/recommend" element={<AchievementRecommendPage />} />
              <Route path="/teacher/profile" element={<TeacherProfilePage/>} />

              {/* 管理员相关路由 */}
              <Route path='/admin/profile' element={<AdminProfilePage/>} />
              <Route path='/admin/manage-users' element={<UserManagementPage/>} />
              <Route path="/admin/system-settings" element={<SystemSettingsPage />} />
              <Route path="/admin/data-statistics" element={<DataStatisticsPage />} />
              <Route path="/admin/achievements-manage" element={<AdminAchievementManagementPage />} />
              <Route path="/admin/announcement-publish" element={<AnnouncementPublish />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
    