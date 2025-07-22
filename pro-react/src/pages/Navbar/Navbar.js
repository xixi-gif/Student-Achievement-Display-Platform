import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, message, Input, Badge, Drawer } from 'antd';
import { 
  HomeOutlined, TrophyOutlined, UserOutlined, 
  SettingOutlined, LogoutOutlined, BookOutlined,
  UsergroupAddOutlined, EyeOutlined, SearchOutlined,
  BellOutlined, InfoOutlined, MenuOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const { Header } = Layout;
const { Search } = Input;

const getNavMenu = (role) => {
  const baseMenu = [
    { key: '/dashboard', icon: <HomeOutlined />, label: '首页' },
    { key: '/achievements', icon: <TrophyOutlined />, label: '成果展示' },
    { key: '/announcements', icon: <BellOutlined />, label: '公告' },
    { key: '/about', icon: <InfoOutlined />, label: '关于我们' }
  ];

  switch(role) {
    case 'student':
      return [...baseMenu, { key: '/my-achievements', icon: <UserOutlined />, label: '我的成果' }];
    case 'teacher':
      return [...baseMenu, { key: '/manage-students', icon: <BookOutlined />, label: '学生管理' }];
    case 'admin':
      return [...baseMenu, 
        { key: '/system-settings', icon: <SettingOutlined />, label: '系统设置' },
        { key: '/user-management', icon: <UsergroupAddOutlined />, label: '用户管理' }
      ];
    case 'visitor':
    default:
      return baseMenu;
  }
};

const roleIcons = {
  student: <UserOutlined />,
  teacher: <BookOutlined />,
  admin: <UsergroupAddOutlined />,
  visitor: <EyeOutlined />
};

const roleNames = {
  student: '学生',
  teacher: '老师',
  admin: '管理员',
  visitor: '访客'
};

const Navbar = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { role, username } = currentUser || { role: 'visitor', username: '访客' };
  const menuItemsCount = getNavMenu(role).length;

  const calculateMinWidth = () => {
    return 240 + (menuItemsCount * 120) + 280 + 160;
  };

  const handleSearch = (value) => {
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    message.success('退出登录成功');
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      {role !== 'visitor' && (
        <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
          账号设置
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const mobileMenuItems = getNavMenu(role).map(item => ({
    ...item,
    onClick: () => {
      setDrawerVisible(false);
      navigate(item.key);
    }
  }));

  return (
    <Header style={{ 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px',
      minWidth: calculateMinWidth(),
      width: '100%',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: '100%',
        width: '100%',
        maxWidth: 1800,
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexShrink: 0
        }}>
          <img src={logo} alt="Logo" style={{ height: 36, marginRight: 16 }} />
          <h1 style={{ fontSize: 20, margin: 0, color: '#1890ff' }}>
            学生成果展示平台
          </h1>
        </div>

        <div style={{ flex: 1 }}></div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          <Menu 
            mode="horizontal" 
            items={getNavMenu(role).map(item => ({
              ...item,
              onClick: () => navigate(item.key)
            }))}
            style={{ 
              borderBottom: 0, 
              margin: 0,
              justifyContent: 'flex-start'
            }}
            itemStyle={{ 
              marginRight: 24,
              padding: '0 8px'
            }}
          />

          <Search
            placeholder="搜索成果、用户..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ 
              width: 280,
              marginLeft: 24,
              flexShrink: 0
            }}
            onSearch={handleSearch}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              marginLeft: 24,
              padding: '0 12px'
            }}>
              <Avatar icon={roleIcons[role]} size="large" style={{ marginRight: 10 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>{username}</span>
                <span style={{ 
                  fontSize: 12, 
                  color: '#666',
                  background: '#f0f2f5',
                  padding: '2px 8px',
                  borderRadius: 12
                }}>
                  {roleNames[role]}
                </span>
              </div>
            </div>
          </Dropdown>

          <MenuOutlined 
            style={{ 
              fontSize: 24, 
              cursor: 'pointer', 
              marginLeft: 16,
              display: { md: 'none', xs: 'block' }
            }} 
            onClick={() => setDrawerVisible(true)} 
          />
        </div>
      </div>

      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ padding: 0 }}
        width={260}
      >
        <Menu
          mode="inline"
          items={mobileMenuItems}
        />
        
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Search
            placeholder="搜索成果、用户..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
          />
        </div>
      </Drawer>
    </Header>
  );
};

export default Navbar;