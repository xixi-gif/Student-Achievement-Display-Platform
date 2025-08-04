import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/Loginpage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/Homepage/Homepage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
// import ProfilePage from './pages/NewProfilePage/NewProfilePage'; 三个角色（学生、老师、管理员）共用的个人中心页面
import MyAchievements from './pages/MyAchievements/MyAchievements';
import AnnouncementList from './pages/AnnouncementList/AnnouncementList';
import AnnouncementDetail from './pages/AnnouncementDetail/AnnoucementDetail';
import AchievementsPage from './pages/AchievementsPage/AchievementsPage';
import AchievementCreationPage from './pages/AchievementCreationPage/AchievementCreationPage';
import AchievementDetailPage from './pages/AchievementDetailPage/AchievementDetailPage';
import ForgotPasswordPage from './pages/Forgotpasswordpage/ForgotPasswordPage';
import AchievementReviewPage from './pages/AchievementReviewPage/AchievementReviewPage';
import AchievementForm from './pages/AchievementForm/AchievementForm';
import AchievementRecommendPage from './pages/AchievementRecommendPage/AchievementRecommendPage';
// import StudentManage from'./pages/StudentManagePage/StudentManagePage';  老师管学生的页面
import UserManagementPage from './pages/UserManagePage/UserManagePage';
import SystemSettingsPage from './pages/SystemSettingPage/SystemSettingPage';
import DataStatisticsPage from './pages/DataStaticsPage/DataStaticsPage';
import AdminProfilePage from './pages/AdminProfilePage/AdminProfilePage';
import TeacherProfilePage from './pages/TeacherProfilePage/TeacherProfilePage';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './App.css';
import AuthorDetailPage from './pages/AuthorDetailPage/AuthorDetailPage';

//发布需求、需求列表、需求详情、为需求沟通
import RequirementPublishPage from './pages/RequirementPublishPage/RequirementPublishPage';
import RequirementListPage from './pages/RequirementListPage/RequirementListPage';
import RequirementDetailPage from './pages/RequirementDetailPage/RequirementDetailPage';
import MessageCenterPage from './pages/RequireMessagePage/RequireMessagePage';




function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
            <Route path="/annoucementlist" element={<AnnouncementList/>} />
            <Route path="/annoucementdetail" element={<AnnouncementDetail/>} />
            <Route path="/author" element={<AuthorDetailPage/>} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/student/my-achievements" element={<MyAchievements />} />
            <Route path="/achievement/detail" element={<AchievementDetailPage />} />
            <Route path="/student/achievement/create" element={<AchievementCreationPage />} />
            <Route path="/student/achievements/edit" element={<AchievementForm />} />

            {/* 教师的个人中心、审核成果、推荐成果页面 */}
            <Route path="/teacher/achievements/review" element={<AchievementReviewPage />} />
            <Route path="/teacher/achievements/recommend" element={<AchievementRecommendPage />} />
            <Route path="/teacher/profile" element={<TeacherProfilePage/>} />
            {/* <Route path="/teacher/manage-students" element={<StudentManage/>} /> */}

            {/* 管理员的个人中心、用户管理、系统设置、数据统计页面 */}
            <Route path='/admin/profile' element={<AdminProfilePage/>} />
            <Route path='/admin/manage-users' element={<UserManagementPage/>} />
            <Route path="/admin/system-settings" element={<SystemSettingsPage />} />
            <Route path="/admin/data-statistics" element={<DataStatisticsPage />} />

            {/* 需求发布、需求列表、需求详情、需求沟通中心 */}
            <Route path="/publish-requirement" element={<RequirementPublishPage />} />
            <Route path="/requirements" element={<RequirementListPage />} />
            <Route path="/requirements/:id" element={<RequirementDetailPage />} />
            <Route path="/messages" element={<MessageCenterPage />} />

          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;    