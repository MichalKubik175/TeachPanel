import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    Spin, 
    Row, 
    Col, 
    Card, 
    Statistic, 
    List, 
    Typography, 
    Space, 
    Button, 
    Tag,
    Avatar,
    Empty,
    Divider
} from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    TrophyOutlined,
    PlusOutlined,
    BarChartOutlined,
    SettingOutlined,
    FileTextOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { sessionsApi } from '../../services/sessionsApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import { useQuestionnaires } from '../../hooks/useQuestionnaires';

const { Title, Text } = Typography;

const HomePage = () => {
    const userData = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    
    // Get data from hooks
    const {
        students,
        groups,
        loading: loadingBGS,
    } = useBrandsGroupsStudents();
    
    const {
        questionnaires,
        loading: loadingQ,
    } = useQuestionnaires();

    // Fetch sessions for recent lessons and statistics
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoadingSessions(true);
                const response = await sessionsApi.getAllSessions(1, 20); // Get recent 20 sessions
                setSessions(response.items || []);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoadingSessions(false);
            }
        };

        fetchSessions();
    }, []);

    // Generate recent activities from available data
    useEffect(() => {
        const activities = [];

        // Add recent sessions
        sessions.slice(0, 3).forEach(session => {
            activities.push({
                id: `session-${session.id}`,
                type: 'session_created',
                icon: '📚',
                color: '#1890ff',
                title: `Урок "${session.name}" створено`,
                time: new Date(session.createdAtUtc),
                description: session.questionnaire ? 'Домашня робота' : 'Звичайний урок',
                onClick: () => navigate(`/session/${session.id}`)
            });
        });

        // Add recent students (last 2)
        students.slice(-2).forEach(student => {
            activities.push({
                id: `student-${student.id}`,
                type: 'student_added',
                icon: '👤',
                color: '#52c41a',
                title: `Додано студента "${student.fullName}"`,
                time: new Date(student.createdAtUtc || Date.now()),
                description: `Група: ${groups.find(g => g.id === student.groupId)?.name || 'Не вказано'}`,
                onClick: () => navigate('/?tab=students')
            });
        });

        // Add recent groups (last 2)
        groups.slice(-2).forEach(group => {
            activities.push({
                id: `group-${group.id}`,
                type: 'group_created',
                icon: '👥',
                color: '#722ed1',
                title: `Створено групу "${group.name}"`,
                time: new Date(group.createdAtUtc || Date.now()),
                description: `Студентів: ${students.filter(s => s.groupId === group.id).length}`,
                onClick: () => navigate('/?tab=students')
            });
        });

        // Sort by time (newest first) and take top 6
        activities.sort((a, b) => b.time - a.time);
        setRecentActivities(activities.slice(0, 6));
    }, [sessions, students, groups, navigate]);

    // Calculate statistics
    const totalStudents = students.length;
    const activeGroups = groups.length;
    const todaysLessons = sessions.filter(session => {
        const today = new Date();
        const sessionDate = new Date(session.createdAtUtc);
        return sessionDate.toDateString() === today.toDateString();
    }).length;
    
    // Calculate average efficiency (placeholder - you can enhance this with real data)
    const avgEfficiency = totalStudents > 0 ? Math.round((totalStudents * 0.87)) : 0;

    // Recent lessons with status
    const recentLessons = sessions.slice(0, 5).map(session => ({
        ...session,
        status: 'completed', // You can enhance this based on actual lesson status
        studentsCount: (session.sessionHomeworkStudents?.length || 0) + (session.sessionRegularStudents?.length || 0)
    }));

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'in_progress': return <PlayCircleOutlined style={{ color: '#faad14' }} />;
            case 'scheduled': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
            default: return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Завершено';
            case 'in_progress': return 'В процесі';
            case 'scheduled': return 'Заплановано';
            default: return 'Завершено';
        }
    };

    const isLoading = userData.status === 'loading' || loadingBGS || loadingQ || loadingSessions;

    if (isLoading) {
        return (
            <div style={{ padding: '24px' }}>
                <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: '100px' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            {/* Welcome Header */}
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Вітаємо, {userData?.user?.fullName}! 👋
                </Title>
                <Text type="secondary">
                    Ось огляд вашої діяльності сьогодні
                </Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Всього студентів"
                            value={totalStudents}
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Активних груп"
                            value={activeGroups}
                            prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Уроків сьогодні"
                            value={todaysLessons}
                            prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Середня ефективність"
                            value={avgEfficiency}
                            suffix="%"
                            prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Row */}
            <Row gutter={[16, 16]}>
                {/* Recent Activity Feed */}
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <BarChartOutlined />
                                Останні дії
                            </Space>
                        }
                        extra={<Button type="link" size="small">Переглянути всі</Button>}
                        style={{ height: '400px' }}
                        bodyStyle={{ padding: '12px' }}
                    >
                        {recentActivities.length > 0 ? (
                            <List
                                size="small"
                                dataSource={recentActivities}
                                renderItem={(activity) => (
                                    <List.Item 
                                        style={{ 
                                            cursor: activity.onClick ? 'pointer' : 'default',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        onClick={activity.onClick}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    size="small" 
                                                    style={{ backgroundColor: activity.color }}
                                                >
                                                    {activity.icon}
                                                </Avatar>
                                            }
                                            title={
                                                <Text style={{ fontSize: '13px' }}>
                                                    {activity.title}
                                                </Text>
                                            }
                                            description={
                                                <Space>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {activity.description}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {activity.time.toLocaleTimeString('uk-UA', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty 
                                description="Немає останніх дій"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                style={{ marginTop: '50px' }}
                            />
                        )}
                    </Card>
                </Col>

                {/* Recent Lessons Overview */}
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <BookOutlined />
                                Останні уроки
                            </Space>
                        }
                        extra={<Button type="link" size="small" onClick={() => navigate('/?tab=sessions')}>Переглянути всі</Button>}
                        style={{ height: '400px' }}
                        bodyStyle={{ padding: '12px' }}
                    >
                        {recentLessons.length > 0 ? (
                            <List
                                size="small"
                                dataSource={recentLessons}
                                renderItem={(lesson) => (
                                    <List.Item 
                                        style={{ 
                                            cursor: 'pointer',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        onClick={() => navigate(`/session/${lesson.id}`)}
                                        actions={[
                                            <Tag 
                                                icon={getStatusIcon(lesson.status)} 
                                                color={lesson.status === 'completed' ? 'success' : 'processing'}
                                                key="status"
                                            >
                                                {getStatusText(lesson.status)}
                                            </Tag>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    size="small" 
                                                    style={{ 
                                                        backgroundColor: lesson.questionnaire ? '#1890ff' : '#52c41a' 
                                                    }}
                                                >
                                                    {lesson.questionnaire ? '📝' : '📚'}
                                                </Avatar>
                                            }
                                            title={
                                                <Text style={{ fontSize: '13px' }} strong>
                                                    {lesson.name}
                                                </Text>
                                            }
                                            description={
                                                <Space>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {lesson.studentsCount} студентів
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {new Date(lesson.createdAtUtc).toLocaleDateString('uk-UA')}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty 
                                description="Немає уроків"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                style={{ marginTop: '50px' }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Divider />
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Title level={4}>Швидкі дії</Title>
                <Space size="large" wrap>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="large"
                        onClick={() => navigate('/?tab=sessions')}
                    >
                        Новий урок
                    </Button>
                    <Button 
                        icon={<TeamOutlined />} 
                        size="large"
                        onClick={() => navigate('/?tab=students')}
                    >
                        Нова група
                    </Button>
                    <Button 
                        icon={<FileTextOutlined />} 
                        size="large"
                        onClick={() => navigate('/?tab=questionnaires')}
                    >
                        Нове опитування
                    </Button>
                    <Button 
                        icon={<SettingOutlined />} 
                        size="large"
                        onClick={() => navigate('/settings')}
                    >
                        Налаштування
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default HomePage;
