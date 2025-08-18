import {Outlet, useNavigate, useLocation} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {signOut} from '../app/authApi.js';
import React, {useState} from 'react';
import StudentsOverviewPage from './Students/StudentsOverviewPage.jsx';
import QuestionnairesManagementPage from './Questionnaires/QuestionnairesManagementPage.jsx';
import SessionCreatePage from './Sessions/SessionCreatePage.jsx';
import TableLayoutsOverviewPage from './TableLayouts/TableLayoutsOverviewPage.jsx';
import SessionsOverviewPage from './Sessions/SessionsOverviewPage.jsx';
import HomePage from './Home/HomePage.jsx';
import VisitingPage from './Visits/VisitingPage.jsx';
import {Layout as AntLayout, Typography, Dropdown, Button, Avatar, Space, Skeleton, Modal, Menu, Spin} from 'antd';
import {
    KeyOutlined,
    PlusOutlined,
    DownOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined, 
    ExclamationCircleOutlined,
    LockOutlined,
    TeamOutlined,
    UserSwitchOutlined,
    TagOutlined,
    ProjectOutlined,
    HistoryOutlined,
    UserAddOutlined,
    FileTextOutlined,
    PlayCircleOutlined,
    TrophyOutlined,
    BarChartOutlined,
    CheckSquareOutlined,
    MoonOutlined,
    SunOutlined,
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { clearTokens } from "../features/auth/tokenExpiry.js";
import { logout as logoutAction } from "../features/auth/authSlice.js";

const {Header, Sider, Content} = AntLayout;
const {Text} = Typography;

export default function AppLayout() {

    const workspacelessLocations = [
        '/settings'
    ];

    const { confirm } = Modal;

    const userData = useSelector(state => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isDarkMode, toggleTheme } = useTheme();
    
    // Check if current path should be rendered without workspace
    const isWorkspacelessLocation = workspacelessLocations.includes(location.pathname);
    
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenuOption, setSelectedMenuOption] = useState('dashboard');

    const logout = async () => {
        try {
            await signOut();
            clearTokens();
            dispatch(logoutAction());
            navigate('/sign-in');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    // User menu items
    const userItems = [
        {label: 'Налаштування', key: 'settings', icon: <SettingOutlined/>},
        {label: 'Вийти', key: 'logout', icon: <LogoutOutlined/>, onClick: showLogoutConfirm},
    ];

    const onUserClick = ({key}) => {
        if (key === 'settings') {
            navigate('/settings');
        } else if (key === 'logout') {
            console.log('Logout');
        }
    };

    const UserAvatarNameSkeleton = () => (
        <Space align="center">
            {/* circle avatar placeholder */}
            <Skeleton.Avatar active size="large" shape="circle" />

            {/* single‐line placeholder for the name */}
            <Skeleton.Input active size="small" style={{ width: 100 }} />
        </Space>
    );

    function showLogoutConfirm() {
        confirm({
            title: 'Підтвердити вихід',
            icon: <ExclamationCircleOutlined/>,
            content: 'Ви впевнені, що хочете вийти?',
            okText: 'Так, вийти',
            cancelText: 'Скасувати',
            onOk() {
                logout().then(() => window.location.reload());
            },
        });
    }

    // Side menu items for workspace
    const sideMenuItems = [
        { key: 'dashboard', icon: <BarChartOutlined />, label: 'Дашборд' },
        { key: 'students', icon: <UserAddOutlined />,   label: 'Студенти' },
        { key: 'visiting', icon: <CheckSquareOutlined />, label: 'Відвідування' },
        { key: 'questionnaires', icon: <FileTextOutlined />, label: 'Опитування' },
        { key: 'sessions', icon: <PlayCircleOutlined />, label: 'Уроки' },
        { key: 'tableLayoutCreate', icon: <ProjectOutlined />, label: 'Розкладки столів' },
        { key: 'totalResults', icon: <TrophyOutlined />, label: 'Загальні результати' },
    ];

    // Determine which menu item is selected based on current route or state
    const getSelectedMenuKey = () => {
        return selectedMenuOption;
    };

    const handleMenuClick = ({key}) => {
        setSelectedMenuOption(key);
    };
    
    if (userData.status === 'unauthenticated') {
        return (
            <div className={'content'}>
                <Outlet/>
            </div>
        )
    }

    const renderWorkspaceContent = () => {

        const selectedKey = getSelectedMenuKey();

        return (
            <Spin spinning={false} delay={500}>
                <div style={{ padding: selectedKey === 'dashboard' ? '0' : '24px' }}>

                    {selectedKey === 'dashboard' && (
                        <HomePage />
                    )}
                    {selectedKey === 'students' && (
                        <StudentsOverviewPage />
                    )}
                    {selectedKey === 'visiting' && (
                        <VisitingPage />
                    )}
                    {selectedKey === 'questionnaires' && (
                        <QuestionnairesManagementPage />
                    )}
                    {selectedKey === 'sessions' && (
                        <SessionsOverviewPage />
                    )}
                    {selectedKey === 'tableLayoutCreate' && (
                        <TableLayoutsOverviewPage />
                    )}
                                           {selectedKey === 'totalResults' && (
                           <div style={{ textAlign: 'center', padding: '50px' }}>
                               <TrophyOutlined style={{ fontSize: '64px', color: '#faad14', marginBottom: '24px' }} />
                               <h2>Загальні результати студентів</h2>
                               <p style={{ marginBottom: '24px' }}>
                                   Оберіть потрібний режим перегляду результатів студентів. Обидві сторінки будуть автоматично оновлюватися при зміні балів студентів.
                               </p>
                               <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                   <Button 
                                       type="primary" 
                                       size="large" 
                                       icon={<TrophyOutlined />}
                                       onClick={() => window.open('/total-results', '_blank')}
                                       style={{ minWidth: '200px' }}
                                   >
                                       Відкрити загальні результати
                                   </Button>
                                   <Button 
                                       type="primary" 
                                       size="large" 
                                       icon={<TrophyOutlined />}
                                       onClick={() => window.open('/public-showcase', '_blank')}
                                       style={{ 
                                           minWidth: '250px',
                                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                           border: 'none' 
                                       }}
                                   >
                                       🏆 Відкрити публічну вітрину для аудиторії
                                   </Button>
                               </div>
                               <div style={{ marginTop: '32px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                   <div style={{ textAlign: 'left', maxWidth: '300px' }}>
                                       <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>📊 Загальні результати</h4>
                                       <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                                           <li>Детальна аналітика та фільтри</li>
                                           <li>Таблична та ієрархічна структура</li>
                                           <li>Інструменти управління даними</li>
                                       </ul>
                                   </div>
                                   <div style={{ textAlign: 'left', maxWidth: '300px' }}>
                                       <h4 style={{ color: '#764ba2', marginBottom: '12px' }}>🏆 Публічна вітрина</h4>
                                       <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                                           <li>Оптимізовано для презентацій</li>
                                           <li>Великий текст для аудиторії</li>
                                           <li>Анімації при зміні результатів</li>
                                       </ul>
                                   </div>
                               </div>
                           </div>
                       )}
                </div>
            </Spin>
        );
    };

    if (isWorkspacelessLocation) {
        // Layout without workspace sidebar and with simplified header
        return (
            <>
                <AntLayout style={{ minHeight: '100vh' }}>
                    {/* Fixed Header */}
                    <Header
                        style={{
                            background: '#fff',
                            padding: '0 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 64,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        {/* Logo + Workspace section */}
                        <Space size="large" align="center">
                            <div
                                onClick={() => navigate('/')}
                                style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                            >
                                <KeyOutlined style={{fontSize: 24, color: '#1890ff'}}/>
                                <Text strong style={{fontSize: 20, margin: '0 8px'}}>
                                    Панель викладача
                                </Text>
                            </div>
                        </Space>

                        {/* Theme toggle and User dropdown */}
                        <Space>
                            <Button
                                type="text"
                                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                                onClick={toggleTheme}
                                className="theme-toggle-btn"
                                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            />
                            <Dropdown
                                menu={{items: userItems, onClick: onUserClick}}
                                trigger={['click']}
                            >
                                <Button type="text">
                                    {userData.status !== 'authenticated' && (
                                        <UserAvatarNameSkeleton/>
                                    )}
                                    {userData.status === 'authenticated' && (
                                        <>
                                            <Avatar icon={<UserOutlined/>} style={{marginRight: 8}}/> {userData.user.fullName}
                                        </>
                                    )} <DownOutlined/>
                                </Button>
                            </Dropdown>
                        </Space>
                    </Header>

                    <Outlet />
                </AntLayout>
            </>
        );
    }

    return (
        <AntLayout style={{ minHeight: '100vh' }}>
            {/* Fixed Header */}
            <Header
                style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 64,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                {/* Logo + Workspace section */}
                <Space size="large" align="center">
                    <div
                        onClick={() => navigate('/')}
                        style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                    >
                        <KeyOutlined style={{fontSize: 24, color: '#1890ff'}}/>
                                                        <Text strong style={{fontSize: 20, margin: '0 8px'}}>
                                    Панель викладача
                                </Text>
                    </div>
                </Space>

                {/* Theme toggle and User dropdown */}
                <Space>
                    <Button
                        type="text"
                        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    />
                    <Dropdown
                        menu={{items: userItems, onClick: onUserClick}}
                        trigger={['click']}
                    >
                        <Button type="text">
                            {userData.status !== 'authenticated' && (
                                <UserAvatarNameSkeleton/>
                            )}
                            {userData.status === 'authenticated' && (
                                <>
                                    <Avatar icon={<UserOutlined/>} style={{marginRight: 8}}/> {userData.user.fullName}
                                </>
                            )} <DownOutlined/>
                        </Button>
                    </Dropdown>
                </Space>
            </Header>

            {/* Main Layout with Sidebar and Content */}
            <AntLayout style={{ marginTop: 64 }}>
                {/* Fixed Sidebar - only show when workspace is selected */}
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={value => setCollapsed(value)}
                    collapsedWidth={64}
                    style={{
                        background: '#fff',
                        position: 'fixed',
                        left: 0,
                        top: 64,
                        bottom: 0,
                        zIndex: 999,
                        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    }}
                    width={200}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedMenuKey()]}
                        items={sideMenuItems}
                        onClick={handleMenuClick}
                        style={{
                            height: '100%',
                            borderRight: 0,
                            marginTop: 16,
                        }}
                    />
                </Sider>

                {/* Content Area */}
                <Content 
                    style={{ 
                        marginLeft: collapsed ? 64 : 200,
                        minHeight: 'calc(100vh - 64px)',
                        overflow: 'auto',
                    }}
                >
                    {renderWorkspaceContent()}
                </Content>
            </AntLayout>
        </AntLayout>
    );
}
