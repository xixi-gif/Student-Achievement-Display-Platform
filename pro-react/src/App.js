import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Loginpage/Loginpage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/Homepage/Homepage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AnnouncementList from './pages/AnnouncementList/AnnouncementList';
import AnnouncementDetail from './pages/AnnouncementDetail/AnnoucementDetail';
import AchievementsPage from './pages/AchievementsPage/AchievementsPage';
import AchievementCreationPage from './pages/AchievementCreationPage/AchievementCreationPage';
import AchievementDetailPage from './pages/AchievementDetailPage/AchievementDetailPage';
import ForgotPasswordPage from './pages/Forgotpasswordpage/ForgotPasswordPage';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './App.css';

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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/annoucementlist" element={<AnnouncementList/>} />
            <Route path="/annoucementdetail" element={<AnnouncementDetail/>} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/achievement/detail" element={<AchievementDetailPage />} />
            <Route path="/achievement/create" element={<AchievementCreationPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;    