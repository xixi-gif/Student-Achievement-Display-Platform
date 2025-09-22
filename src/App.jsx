import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/Loginpage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/Homepage/Homepage2';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import MyAchievements from './pages/MyAchievements/MyAchievements2';
import AnnouncementList from './pages/AnnouncementList/AnnouncementList2';
import AnnouncementDetail from './pages/AnnouncementDetail/AnnoucementDetail2';
import AchievementsPage from './pages/AchievementsPage/AchievementsPage2';
// import AchievementCreationPage from './pages/AchievementCreationPage/AchievementCreationPage2';创建成果与编辑成果页面合并
import AchievementDetailPage from './pages/AchievementDetailPage/AchievementDetailPage2';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import AchievementReviewPage from './pages/AchievementReviewPage/AchievementReviewPage2';
import AchievementForm from './pages/AchievementForm/AchievementForm2';
import AchievementRecommendPage from './pages/AchievementRecommendPage/AchievementRecommendPage2';
import SystemSettingsPage from './pages/SystemSettingPage/SystemSettingPage';
import DataStatisticsPage from './pages/DataStaticsPage/DataStaticsPage2';
import AdminAchievementManagementPage from './pages/AchievementManagePage/AchievementManagePage2';
import AdminProfilePage from './pages/AdminProfilePage/AdminProfilePage';
import TeacherProfilePage from './pages/TeacherProfilePage/TeacherProfilePage2';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './App.css';
import AuthorDetailPage from './pages/AuthorDetailPage/AuthorDetailPage2';
import AnnouncementPublish from './pages/AnnouncementPublish/AnnouncementPublish';
import AccountSettingsPage from './pages/SettingPage/SettingPage'
import AboutUs from './pages/AboutUsPage/AboutUsPage';

// 需求相关页面
import RequirementPublishPage from './pages/RequirementPublishPage/RequirementPublishPage';
import RequirementListPage from './pages/RequirementListPage/RequirementList2';
import RequirementDetailPage from './pages/RequirementDetailPage/RequirementDetailPage';
import MessageCenterPage from './pages/RequireMessagePage/RequireMessagePage';
import RequirementManagePage from './pages/RequirementManagePage/RequirementManagePage';
import ChatPage from './pages/ChatPage/ChatPage';

//评论相关页面
import CommentList from './pages/CommentList/commonList';
import AdminReviewComment from './pages/AdminReviewComment/adminReviewComment'


// 路由保护
import AuthRoute from './pages/AuthRoute/AuthRoute';
import UserManage from './pages/UserManagePage/UserManagePage';
import MyRequirementsPage from './pages/MyRequirements/MyRequirements2';
import MyApplicationsPage from './pages/MyApplicationsPage/MyApplicationPage';

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
            <Route path="/announcement/detail/:id" element={<AnnouncementDetail/>} />
            <Route path="/requirements" element={<RequirementListPage />} />
            <Route path="/requirements/:id" element={<RequirementDetailPage />} />
            <Route path="/setting" element={<AccountSettingsPage />} />
            <Route path='my-applications' element={<MyApplicationsPage /> } />
            <Route path ='/about' element={<AboutUs /> } />

            {/* 需要权限验证的路由 */}
            <Route element={<AuthRoute/>}>
              {/* 学生相关路由 */}
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/my-achievements" element={<MyAchievements />} />
              <Route path="/student/achievement/create" element={<AchievementForm />} />
              <Route path="/student/achievements/edit/:id" element={<AchievementForm />} />
              
              {/* 公共功能路由 */}
              <Route path="/author/:userId" element={<AuthorDetailPage/>} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/achievement/detail/:id" element={<AchievementDetailPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/publish-requirement" element={<RequirementPublishPage />} />
              <Route path="/messages" element={<MessageCenterPage />} />
              <Route path="/my-requirements" element={<MyRequirementsPage />} /> 
              <Route path="/my/comments" element={<CommentList />}/>

              {/* 教师相关路由 */}
              <Route path="/teacher/achievements/review" element={<AchievementReviewPage />} />
              <Route path="/teacher/achievements/recommend" element={<AchievementRecommendPage />} />
              <Route path="/teacher/profile" element={<TeacherProfilePage/>} />

              {/* 管理员相关路由 */}
              <Route path='/admin/profile' element={<AdminProfilePage/>} />
              <Route path='/admin/manage-users' element={<UserManage/>} />
              <Route path="/admin/system-settings" element={<SystemSettingsPage />} />
              <Route path="/admin/data-statistics" element={<DataStatisticsPage />} />
              <Route path="/admin/achievements-manage" element={<AdminAchievementManagementPage />} />
              <Route path="/admin/announcement-publish" element={<AnnouncementPublish />} />
              <Route path="/admin/comments-manage" element={<AdminReviewComment />} />
              <Route path="/admin/requirement-manage" element={<RequirementManagePage />} /> 
            </Route>
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
    