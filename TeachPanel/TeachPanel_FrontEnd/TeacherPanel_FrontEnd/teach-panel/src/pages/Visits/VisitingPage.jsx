import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Layout,
    Card,
    Table,
    Button,
    Space,
    Typography,
    DatePicker,
    Select,
    Checkbox,
    message,
    Modal,
    Input,
    Tag,
    Statistic,
    Row,
    Col,
    Empty,
    Spin,
    Tooltip,
    Divider
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    UsergroupAddOutlined
} from '@ant-design/icons';
import { visitsApi } from '../../services/visitsApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const VisitingPage = () => {
    const userData = useSelector((state) => state.auth);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedGroupId, setSelectedGroupId] = useState(null); // null means show all groups
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingVisit, setEditingVisit] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [notes, setNotes] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [groupSummaries, setGroupSummaries] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [bulkAction, setBulkAction] = useState(null); // 'present' | 'absent'

    const {
        students,
        groups,
        loading: dataLoading,
        error,
        setError
    } = useBrandsGroupsStudents();

    // Get students for display (filtered by group if selected)
    const displayStudents = selectedGroupId 
        ? students.filter(student => student.groupId === selectedGroupId)
        : students;

    // Get groups for display (filtered if specific group selected)
    const displayGroups = selectedGroupId
        ? groups.filter(group => group.id === selectedGroupId)
        : groups;

    // Load visits for selected date
    const loadVisits = async () => {
        if (!selectedDate) {
            setVisits([]);
            setGroupSummaries([]);
            return;
        }

        setLoading(true);
        try {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            
            if (selectedGroupId) {
                // Get specific group summary
                const summary = await visitsApi.getGroupSummary(selectedGroupId, dateStr);
                setGroupSummaries([summary]);
                setVisits(summary.studentVisits || []);
            } else {
                // Get all group summaries for the date
                const summaries = await visitsApi.getGroupSummaries(dateStr, dateStr);
                setGroupSummaries(summaries || []);
                
                // Combine all visits from all groups
                const allVisits = summaries.reduce((acc, summary) => {
                    return acc.concat(summary.studentVisits || []);
                }, []);
                setVisits(allVisits);
            }
        } catch (error) {
            console.error('Error loading visits:', error);
            messageApi.error('Помилка завантаження відвідувань');
            setVisits([]);
            setGroupSummaries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVisits();
    }, [selectedDate, selectedGroupId]);

    // Load initial data when component mounts
    useEffect(() => {
        if (selectedDate) {
            loadVisits();
        }
    }, []);

    // Handle individual visit toggle
    const handleVisitToggle = async (studentId, isPresent) => {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        
        try {
            // Check if visit already exists
            const existingVisit = visits.find(v => v.studentId === studentId);
            
            if (existingVisit) {
                // Update existing visit
                await visitsApi.update(existingVisit.id, {
                    isPresent: isPresent,
                    notes: existingVisit.notes
                });
            } else {
                // Create new visit
                await visitsApi.create({
                    studentId: studentId,
                    visitDate: dateStr,
                    isPresent: isPresent,
                    notes: ''
                });
            }
            
            messageApi.success(`Відвідування ${isPresent ? 'відмічено' : 'знято'}`);
            await loadVisits(); // Reload data
        } catch (error) {
            console.error('Error updating visit:', error);
            messageApi.error('Помилка оновлення відвідування');
        }
    };

    // Handle bulk visit action for specific group
    const handleGroupBulkAction = async (groupId, isPresent) => {
        if (!selectedDate) {
            messageApi.warning('Оберіть дату');
            return;
        }

        const dateStr = selectedDate.format('YYYY-MM-DD');
        
        try {
            await visitsApi.bulkCreateOrUpdate({
                visitDate: dateStr,
                isPresent: isPresent,
                groupId: groupId,
                notes: ''
            });
            
            const groupName = groups.find(g => g.id === groupId)?.name || 'група';
            messageApi.success(`Всі студенти групи "${groupName}" відмічені як ${isPresent ? 'присутні' : 'відсутні'}`);
            await loadVisits();
        } catch (error) {
            console.error('Error bulk updating group visits:', error);
            messageApi.error('Помилка масового оновлення відвідувань групи');
        }
    };

    // Handle bulk action for selected students only
    const handleSelectedBulkAction = async (isPresent) => {
        if (selectedStudents.length === 0) {
            messageApi.warning('Оберіть студентів');
            return;
        }

        const dateStr = selectedDate.format('YYYY-MM-DD');
        
        try {
            await visitsApi.bulkCreateOrUpdate({
                visitDate: dateStr,
                isPresent: isPresent,
                studentIds: selectedStudents,
                notes: ''
            });
            
            messageApi.success(`Обрані студенти відмічені як ${isPresent ? 'присутні' : 'відсутні'}`);
            setSelectedStudents([]);
            await loadVisits();
        } catch (error) {
            console.error('Error bulk updating selected visits:', error);
            messageApi.error('Помилка оновлення відвідувань обраних студентів');
        }
    };

    // Get visit status for student
    const getVisitStatus = (studentId) => {
        const visit = visits.find(v => v.studentId === studentId);
        if (visit) {
            return visit.isPresent;
        }
        // Default status is "not visited" (false) instead of null
        return false;
    };

    // Handle edit visit notes
    const handleEditVisit = (studentId) => {
        const visit = visits.find(v => v.studentId === studentId);
        const student = displayStudents.find(s => s.id === studentId);
        
        setEditingVisit({ studentId, student, visit });
        setNotes(visit?.notes || '');
        setIsModalVisible(true);
    };

    // Save visit notes
    const handleSaveNotes = async () => {
        if (!editingVisit) return;

        const dateStr = selectedDate.format('YYYY-MM-DD');
        
        try {
            if (editingVisit.visit) {
                // Update existing visit
                await visitsApi.update(editingVisit.visit.id, {
                    isPresent: editingVisit.visit.isPresent,
                    notes: notes
                });
            } else {
                // Create new visit with notes
                await visitsApi.create({
                    studentId: editingVisit.studentId,
                    visitDate: dateStr,
                    isPresent: false,
                    notes: notes
                });
            }
            
            messageApi.success('Примітки збережено');
            setIsModalVisible(false);
            setEditingVisit(null);
            setNotes('');
            await loadVisits();
        } catch (error) {
            console.error('Error saving notes:', error);
            messageApi.error('Помилка збереження приміток');
        }
    };

    // Table columns
    const columns = [
        {
            title: '',
            key: 'select',
            width: 50,
            render: (_, record) => (
                <Checkbox
                    checked={selectedStudents.includes(record.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, record.id]);
                        } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== record.id));
                        }
                    }}
                />
            ),
        },
        {
            title: 'Студент',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => {
                const group = groups.find(g => g.id === record.groupId);
                return (
                    <Space direction="vertical" size={0}>
                        <Space>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <Text strong>{text}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <TeamOutlined style={{ marginRight: 4 }} />
                            {group?.name || 'Невідома група'}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: 'Статус відвідування',
            key: 'visitStatus',
            render: (_, record) => {
                const visit = visits.find(v => v.studentId === record.id);
                if (!visit) {
                    return <Tag color="default">Не відвідав</Tag>;
                }
                return visit.isPresent ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Присутній</Tag>
                ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>Відсутній</Tag>
                );
            },
        },
        {
            title: 'Дії',
            key: 'actions',
            render: (_, record) => {
                const status = getVisitStatus(record.id);
                return (
                    <Space>
                        <Tooltip title="Відмітити присутнім">
                            <Button
                                type={status === true ? "primary" : "default"}
                                icon={<CheckOutlined />}
                                size="small"
                                onClick={() => handleVisitToggle(record.id, true)}
                            />
                        </Tooltip>
                        <Tooltip title="Відмітити відсутнім">
                            <Button
                                type={status === false ? "primary" : "default"}
                                danger={status === false}
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() => handleVisitToggle(record.id, false)}
                            />
                        </Tooltip>
                        <Tooltip title="Редагувати примітки">
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEditVisit(record.id)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    // Handle select all/none
    const handleSelectAll = () => {
        if (selectedStudents.length === displayStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(displayStudents.map(s => s.id));
        }
    };

    // Get overall statistics
    const getOverallStats = () => {
        if (!displayStudents.length) return { total: 0, present: 0, absent: 0, percentage: 0 };
        
        const total = displayStudents.length;
        const present = displayStudents.filter(student => {
            const visit = visits.find(v => v.studentId === student.id);
            return visit && visit.isPresent;
        }).length;
        const absent = displayStudents.filter(student => {
            const visit = visits.find(v => v.studentId === student.id);
            return visit && !visit.isPresent;
        }).length;
        const notVisited = total - present - absent;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { total, present, absent, notVisited, percentage };
    };

    const overallStats = getOverallStats();

    return (
        <Content style={{ padding: '24px' }}>
            {contextHolder}
            <Spin spinning={dataLoading || loading} delay={500}>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2}>Відвідування студентів</Title>
                    <Text type="secondary">
                        Відмічайте присутність студентів на заняттях
                    </Text>
                </div>

                {/* Controls */}
                <Card style={{ marginBottom: '24px' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>Дата заняття:</Text>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    format="DD.MM.YYYY"
                                    placeholder="Оберіть дату"
                                    style={{ width: '100%' }}
                                    suffixIcon={<CalendarOutlined />}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>Фільтр по групі:</Text>
                                <Select
                                    value={selectedGroupId}
                                    onChange={setSelectedGroupId}
                                    placeholder="Всі групи"
                                    style={{ width: '100%' }}
                                    suffixIcon={<TeamOutlined />}
                                    allowClear
                                >
                                    {groups.map(group => (
                                        <Option key={group.id} value={group.id}>
                                            {group.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Space>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Statistic
                                        title="Всього студентів"
                                        value={overallStats.total}
                                        prefix={<UserOutlined />}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Присутніх"
                                        value={overallStats.present}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Відсутніх"
                                        value={overallStats.absent}
                                        prefix={<CloseCircleOutlined />}
                                        valueStyle={{ color: '#cf1322' }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Відсоток"
                                        value={overallStats.percentage}
                                        suffix="%"
                                        valueStyle={{ 
                                            color: overallStats.percentage >= 80 ? '#3f8600' : 
                                                   overallStats.percentage >= 60 ? '#faad14' : '#cf1322' 
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                {/* Bulk Actions */}
                {displayStudents.length > 0 && (
                    <Card style={{ marginBottom: '24px' }}>
                        {selectedStudents.length > 0 && (
                            <Row gutter={[16, 16]} align="middle">
                                <Col>
                                    <Text strong>Дії з обраними ({selectedStudents.length}):</Text>
                                </Col>
                                <Col>
                                    <Space>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<CheckOutlined />}
                                            onClick={() => handleSelectedBulkAction(true)}
                                        >
                                            Відмітити присутніми
                                        </Button>
                                        <Button
                                            danger
                                            size="small"
                                            icon={<CloseOutlined />}
                                            onClick={() => handleSelectedBulkAction(false)}
                                        >
                                            Відмітити відсутніми
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => setSelectedStudents([])}
                                        >
                                            Очистити вибір
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        )}
                    </Card>
                )}

                {/* Groups and Students Display */}
                {displayStudents.length > 0 ? (
                    selectedGroupId ? (
                        // Single group view
                        <Card>
                            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Title level={4} style={{ margin: 0 }}>
                                    {groups.find(g => g.id === selectedGroupId)?.name || 'Група'}
                                </Title>
                                <Space>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<UsergroupAddOutlined />}
                                        onClick={() => handleGroupBulkAction(selectedGroupId, true)}
                                    >
                                        Всі присутні
                                    </Button>
                                    <Button
                                        danger
                                        size="small"
                                        icon={<UsergroupAddOutlined />}
                                        onClick={() => handleGroupBulkAction(selectedGroupId, false)}
                                    >
                                        Всі відсутні
                                    </Button>
                                    <Button onClick={handleSelectAll}>
                                        {selectedStudents.length === displayStudents.length ? 'Зняти всі' : 'Обрати всіх'}
                                    </Button>
                                </Space>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={displayStudents}
                                rowKey="id"
                                pagination={false}
                                size="middle"
                                locale={{
                                    emptyText: <Empty description="Немає студентів у групі" />
                                }}
                            />
                        </Card>
                    ) : (
                        // All groups view
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {displayGroups.map(group => {
                                const groupStudents = students.filter(s => s.groupId === group.id);
                                if (groupStudents.length === 0) return null;
                                
                                const groupSummary = groupSummaries.find(gs => gs.groupId === group.id);
                                const presentCount = groupStudents.filter(student => {
                                    const visit = visits.find(v => v.studentId === student.id);
                                    return visit && visit.isPresent;
                                }).length;
                                const absentCount = groupStudents.filter(student => {
                                    const visit = visits.find(v => v.studentId === student.id);
                                    return visit && !visit.isPresent;
                                }).length;
                                const attendancePercentage = groupStudents.length > 0 ? Math.round((presentCount / groupStudents.length) * 100) : 0;
                                
                                return (
                                    <Card key={group.id}>
                                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Space>
                                                <Title level={4} style={{ margin: 0 }}>
                                                    {group.name}
                                                </Title>
                                                <Text type="secondary">
                                                    ({groupStudents.length} студентів)
                                                </Text>
                                                <Tag color={attendancePercentage >= 80 ? 'success' : attendancePercentage >= 60 ? 'warning' : 'error'}>
                                                    {attendancePercentage}% присутність
                                                </Tag>
                                            </Space>
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<UsergroupAddOutlined />}
                                                    onClick={() => handleGroupBulkAction(group.id, true)}
                                                >
                                                    Всі присутні
                                                </Button>
                                                <Button
                                                    danger
                                                    size="small"
                                                    icon={<UsergroupAddOutlined />}
                                                    onClick={() => handleGroupBulkAction(group.id, false)}
                                                >
                                                    Всі відсутні
                                                </Button>
                                            </Space>
                                        </div>
                                        <Table
                                            columns={columns.filter(col => col.key !== 'select')} // Remove checkbox column for group view
                                            dataSource={groupStudents}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                            showHeader={false}
                                            locale={{
                                                emptyText: <Empty description="Немає студентів у групі" />
                                            }}
                                        />
                                    </Card>
                                );
                            })}
                        </Space>
                    )
                ) : (
                    <Card>
                        <Empty 
                            description="Немає студентів для відображення"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                )}

                {/* Edit Notes Modal */}
                <Modal
                    title={`Примітки для ${editingVisit?.student?.fullName}`}
                    open={isModalVisible}
                    onOk={handleSaveNotes}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingVisit(null);
                        setNotes('');
                    }}
                    okText="Зберегти"
                    cancelText="Скасувати"
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>Додайте примітки до відвідування:</Text>
                        <TextArea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Введіть примітки..."
                            rows={4}
                            maxLength={500}
                            showCount
                        />
                    </Space>
                </Modal>
            </Spin>
        </Content>
    );
};

export default VisitingPage;
