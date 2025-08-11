import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import ChangePassword from "../../features/auth/ChangePassword.jsx";

const { Sider, Content } = Layout;
const { Title } = Typography;

const SettingsPage = () => {
    const [selectedKey, setSelectedKey] = useState('password');
    document.title = "Settings - SecretHub";

    const renderContent = () => {
        if (selectedKey === 'password') {
            return <ChangePassword />;
        }
        return <>Select settings menu option first</>;
    };

    const items = [
        {
            key: 'password',
            icon: <LockOutlined />,
            label: 'Password',
        },
    ];

    return (
        <>
            <Sider
                style={{
                    background: '#fff',
                    position: 'fixed',
                    left: 0,
                    top: 64,
                    bottom: 0,
                    zIndex: 999,
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    paddingTop: '16px'
                }}
                width={200}>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    style={{ height: '100%', borderRight: 0 }}
                    onClick={({ key }) => setSelectedKey(key)}
                    items={items}
                />
            </Sider>
            <Layout
                style={{
                    marginLeft: 200,
                    minHeight: 'calc(100vh - 64px)',
                    overflow: 'auto',
                }}
            >
                <Content style={{ padding: '0px 0px 0px 25px' }}>{renderContent()}</Content>
            </Layout>
        </>
    );
};

export default SettingsPage;
