import {Outlet, useNavigate, useLocation} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {signOut} from '../app/authApi.js';
import React, {useState} from 'react';
import StudentsOverviewPage from './Students/StudentsOverviewPage.jsx';
import QuestionnairesManagementPage from './Questionnaires/QuestionnairesManagementPage.jsx';
import SessionCreatePage from './Sessions/SessionCreatePage.jsx';
import TableLayoutCreatePage from './TableLayouts/TableLayoutCreatePage.jsx';
import SessionsOverviewPage from './Sessions/SessionsOverviewPage.jsx';
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
} from '@ant-design/icons';
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
    
    // Check if current path should be rendered without workspace
    const isWorkspacelessLocation = workspacelessLocations.includes(location.pathname);
    
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenuOption, setSelectedMenuOption] = useState('students');

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
        { key: 'students', icon: <UserAddOutlined />,   label: 'Студенти' },
        { key: 'questionnaires', icon: <FileTextOutlined />, label: 'Опитування' },
        { key: 'sessions', icon: <PlayCircleOutlined />, label: 'Сесії' },
        { key: 'tableLayoutCreate', icon: <ProjectOutlined />, label: 'Розкладки столів' },
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
                <div style={{ padding: '24px' }}>

                    {selectedKey === 'students' && (
                        <StudentsOverviewPage />
                    )}
                    {selectedKey === 'questionnaires' && (
                        <QuestionnairesManagementPage />
                    )}
                    {selectedKey === 'sessions' && (
                        <SessionsOverviewPage />
                    )}
                    {selectedKey === 'tableLayoutCreate' && (
                        <TableLayoutCreatePage />
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

                        {/* User dropdown */}
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

                {/* User dropdown */}
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
