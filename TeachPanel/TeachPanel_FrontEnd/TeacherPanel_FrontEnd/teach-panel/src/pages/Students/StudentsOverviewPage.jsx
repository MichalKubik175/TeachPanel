import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Table, Typography, Spin, Empty, Card, Space, Button, Alert } from 'antd';
import { UserOutlined, TrophyOutlined, SettingOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import StudentManagementPage from './StudentManagementPage.jsx';
import BrandsManagementPage from '../Brands/BrandsManagementPage.jsx';
import GroupsManagementPage from '../Groups/GroupsManagementPage.jsx';
import { useStudentsAndGroups } from '../../hooks/useStudentsAndGroups.js';

const { Content } = Layout;
const { Title, Text } = Typography;

const StudentsOverviewPage = () => {
    const userData = useSelector((state) => state.auth);
    const [activePanel, setActivePanel] = useState(null); // null | 'students' | 'groups' | 'brands'
    
    const { 
        students, 
        groups, 
        loading, 
        error, 
        setError 
    } = useStudentsAndGroups();

    // Group students by their group
    const groupedStudents = groups.map(group => ({
        id: group.id,
        name: group.name,
        students: students.filter(student => student.groupId === group.id)
    }));

    const columns = [
        {
            title: 'Ім\'я студента',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => (
                <Space>
                    <UserOutlined style={{ color: 'var(--color-primary)' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Загальний бал',
            dataIndex: 'totalScore',
            key: 'totalScore',
            render: (score) => (
                <Space>
                    <TrophyOutlined style={{ color: 'var(--color-warning)' }} />
                    <Text strong style={{ color: score >= 90 ? 'var(--color-success)' : score >= 80 ? 'var(--color-primary)' : 'var(--color-error)' }}>
                        {score}/100
                    </Text>
                </Space>
            ),
            sorter: (a, b) => a.totalScore - b.totalScore,
            defaultSortOrder: 'descend',
        },
    ];

    const renderGroupTable = (group) => (
        <Card
            key={group.id}
            title={
                <Space>
                    <Text strong style={{ fontSize: '18px' }}>
                        {group.name}
                    </Text>
                    <Text type="secondary">
                        ({group.students.length} студентів)
                    </Text>
                </Space>
            }
            style={{ marginBottom: '24px' }}
            size="small"
        >
            <Table
                columns={columns}
                dataSource={group.students}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{
                    emptyText: <Empty description="У цій групі немає студентів" />
                }}
            />
        </Card>
    );

    return (
        <Content style={{ padding: '24px' }}>
            <Spin spinning={userData.status === 'loading' || loading} delay={500}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2}>Огляд студентів</Title>
                        <Text type="secondary">
                            Перегляд всіх студентів, організованих за групами
                        </Text>
                    </div>
                    <Space>
                        <Button
                            icon={<BookOutlined />}
                            onClick={() => setActivePanel('brands')}
                            size="large"
                        >
                            Керування брендами
                        </Button>
                        <Button
                            icon={<TeamOutlined />}
                            onClick={() => setActivePanel('groups')}
                            size="large"
                        >
                            Керування групами
                        </Button>
                        <Button
                            type="primary"
                            icon={<SettingOutlined />}
                            onClick={() => setActivePanel('students')}
                            size="large"
                        >
                            Керування студентами
                        </Button>
                    </Space>
                </div>

                {error && (
                    <Alert
                        message="Помилка"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: '16px' }}
                    />
                )}

                {activePanel === 'students' ? (
                    <StudentManagementPage 
                        onBack={() => setActivePanel(null)}
                    />
                ) : activePanel === 'brands' ? (
                    <BrandsManagementPage 
                        onBack={() => setActivePanel(null)}
                    />
                ) : activePanel === 'groups' ? (
                    <GroupsManagementPage 
                        onBack={() => setActivePanel(null)}
                    />
                ) : (
                    <>
                        {groupedStudents.length === 0 && !loading ? (
                            <Empty 
                                description="Групи не знайдено" 
                                style={{ marginTop: '48px' }}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                                <Button 
                                    type="primary" 
                                    icon={<TeamOutlined />}
                                    onClick={() => setActivePanel('groups')}
                                >
                                    Створити групу
                                </Button>
                            </Empty>
                        ) : (
                            <div>
                                {groupedStudents.map(renderGroupTable)}
                            </div>
                        )}
                    </>
                )}
            </Spin>
        </Content>
    );
};

export default StudentsOverviewPage; 