import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Table, Typography, Spin, Empty, Card, Space, Button, Alert, Tag, Tooltip, Modal } from 'antd';
import { 
    PlayCircleOutlined, 
    PauseCircleOutlined, 
    StopOutlined, 
    UserOutlined, 
    FileTextOutlined, 
    CalendarOutlined,
    TeamOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Input, Select, Checkbox, Divider, Row, Col, Form as AntForm, message } from 'antd';
import { sessionsApi } from '../../services/sessionsApi';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import { useQuestionnaires } from '../../hooks/useQuestionnaires';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const SessionSchema = Yup.object().shape({
  name: Yup.string().required('Введіть назву сесії'),
  questionnaireId: Yup.string(),
  groupIds: Yup.array().of(Yup.string()),
  studentIds: Yup.array().of(Yup.string()),
  tableLayoutId: Yup.string().required('Оберіть розклад столів'),
});

const SessionsOverviewPage = () => {
    const userData = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} з ${total} сесій`,
    });

    // Session creation form data
    const {
        brands,
        groups,
        brandGroups,
        students,
        loading: loadingBGS,
        error: errorBGS,
        getGroupsByBrand,
    } = useBrandsGroupsStudents();
    const {
        questionnaires,
        loading: loadingQ,
        error: errorQ,
    } = useQuestionnaires();
    const user = useSelector(state => state.auth.user);
    const [tableLayouts, setTableLayouts] = useState([]);
    const [loadingTableLayouts, setLoadingTableLayouts] = useState(true);
    const [errorTableLayouts, setErrorTableLayouts] = useState(null);

    // Debug: Log when students and groups are loaded
    useEffect(() => {
        console.log('Students loaded:', students);
        console.log('Groups loaded:', groups);
        console.log('Brands loaded:', brands);
    }, [students, groups, brands]);

    useEffect(() => {
        const fetchTableLayouts = async () => {
            setLoadingTableLayouts(true);
            try {
                const data = await tableLayoutsApi.getAllTableLayouts(1, 100);
                setTableLayouts(data.items || []);
                setErrorTableLayouts(null);
            } catch (err) {
                setErrorTableLayouts('Не вдалося завантажити розклад столів');
            } finally {
                setLoadingTableLayouts(false);
            }
        };
        fetchTableLayouts();
    }, []);

    // Map groupId to students
    const groupIdToStudents = useMemo(() => {
        const map = {};
        groups.forEach(group => {
            map[group.id] = students.filter(s => s.group.id === group.id);
        });
        return map;
    }, [groups, students]);

    // Map brandId to groups
    const brandIdToGroups = useMemo(() => {
        const map = {};
        brands.forEach(brand => {
            map[brand.id] = getGroupsByBrand(brand.id);
        });
        return map;
    }, [brands, getGroupsByBrand]);

    // All students for multi-select
    const allStudents = students;

    // Helper: get unique student IDs from selected groups and selected students
    const getSelectedStudentIds = (groupIds, studentIds) => {
        console.log('getSelectedStudentIds called with:', { groupIds, studentIds });
        console.log('groupIdToStudents:', groupIdToStudents);
        
        const groupStudentIds = groupIds
            .flatMap(gid => {
                const studentsInGroup = groupIdToStudents[gid]?.map(s => s.id) || [];
                console.log(`Students in group ${gid}:`, studentsInGroup);
                return studentsInGroup;
            });
        
        console.log('Group student IDs:', groupStudentIds);
        console.log('Individual student IDs:', studentIds);
        
        const allStudentIds = Array.from(new Set([...groupStudentIds, ...studentIds]));
        console.log('Final combined student IDs:', allStudentIds);
        
        return allStudentIds;
    };

    const fetchSessions = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await sessionsApi.getAllSessions(page, pageSize);
            console.log('Sessions API response:', response);
            console.log('Sessions data:', response.items);
            if (response.items && response.items.length > 0) {
                console.log('First session structure:', response.items[0]);
            }
            setSessions(response.items || []);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: response.meta?.totalItemsCount || response.totalCount || 0,
            }));
            setError(null);
        } catch (err) {
            setError('Не вдалося завантажити сесії');
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleTableChange = (paginationInfo) => {
        fetchSessions(paginationInfo.current, paginationInfo.pageSize);
        setPagination(prev => ({
            ...prev,
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize
        }));
    };

    const handleAddSession = () => {
        setIsModalVisible(true);
    };

    const handleEditSession = async (record) => {
        try {
            const sessionData = await sessionsApi.getSessionById(record.id);
            setEditingSession(sessionData);
            setIsEditModalVisible(true);
        } catch (err) {
            message.error('Не вдалося завантажити дані сесії');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingSession(null);
    };

    const handleEditModalCancel = () => {
        setIsEditModalVisible(false);
        setEditingSession(null);
    };

    const handleModalOk = async (values, { resetForm }) => {
        console.log('=== handleModalOk called ===');
        console.log('Values received:', values);
        console.log('User:', user);
        
        setSubmitting(true);
        try {
            console.log('Starting session creation process...');
            
            if (!user) throw new Error('Користувач не авторизований');
            if (!values.tableLayoutId) throw new Error('Оберіть розклад столів');
            
            console.log('Form values:', values);
            console.log('Group IDs:', values.groupIds);
            console.log('Student IDs:', values.studentIds);
            
            // Determine session state
            const state = values.questionnaireId ? 1 : 2; // 1 = Homework, 2 = Regular
            const payload = {
                name: values.name,
                state,
                userId: user.id,
                questionnaireId: values.questionnaireId || null,
                tableLayoutId: values.tableLayoutId,
                commentaryId: null,
            };
            
            console.log('Creating session with payload:', payload);
            
            // Create the session
            const createdSession = await sessionsApi.createSession(payload);
            console.log('Session created successfully:', createdSession);
            
            // Get selected student IDs
            const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds);
            console.log('Selected student IDs:', selectedStudentIds);
            console.log('Selected student IDs length:', selectedStudentIds.length);
            
            // Debug: Check if students are actually selected
            if (values.groupIds && values.groupIds.length > 0) {
                console.log('Groups selected:', values.groupIds);
                console.log('Students from groups:', groupIdToStudents);
            }
            
            if (values.studentIds && values.studentIds.length > 0) {
                console.log('Individual students selected:', values.studentIds);
            }
            
            // Add students to session tables
            if (selectedStudentIds.length > 0) {
                console.log('=== STARTING STUDENT ASSIGNMENTS ===');
                console.log('Adding students to session tables...');
                const studentPromises = [];
                
                selectedStudentIds.forEach((studentId, index) => {
                    const tableNumber = index + 1; // Sequential table numbers starting from 1
                    
                    // Always add to session_regular_students
                    const regularStudentData = {
                        sessionId: createdSession.id,
                        studentId: studentId,
                        tableNumber: tableNumber
                    };
                    console.log('Adding to session_regular_students:', regularStudentData);
                    studentPromises.push(
                        sessionsApi.createSessionRegularStudent(regularStudentData)
                    );
                    
                    // If questionnaire is selected, also add to session_homework_students
                    if (values.questionnaireId) {
                        const homeworkStudentData = {
                            sessionId: createdSession.id,
                            studentId: studentId,
                            tableNumber: tableNumber
                        };
                        console.log('Adding to session_homework_students:', homeworkStudentData);
                        studentPromises.push(
                            sessionsApi.createSessionHomeworkStudent(homeworkStudentData)
                        );
                    }
                });
                
                // Wait for all student assignments to complete
                console.log('Waiting for student assignments to complete...');
                console.log('Number of promises to wait for:', studentPromises.length);
                await Promise.all(studentPromises);
                console.log('=== ALL STUDENT ASSIGNMENTS COMPLETED ===');
            } else {
                console.log('=== NO STUDENTS SELECTED FOR ASSIGNMENT ===');
                console.log('Group IDs:', values.groupIds);
                console.log('Student IDs:', values.studentIds);
                console.log('All students:', allStudents);
            }
            
            console.log('Session creation process completed successfully');
            message.success('Сесію створено успішно!');
            resetForm();
            setIsModalVisible(false);
            fetchSessions(pagination.current, pagination.pageSize); // Refresh the current page
        } catch (err) {
            console.error('=== ERROR IN SESSION CREATION ===');
            console.error('Error details:', err);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            message.error(err.message || 'Не вдалося створити сесію. Спробуйте ще раз.');
        } finally {
            console.log('=== handleModalOk finished ===');
            setSubmitting(false);
        }
    };

    const handleEditModalOk = async (values, { resetForm }) => {
        setSubmitting(true);
        try {
            if (!editingSession) throw new Error('Сесія не знайдена');
            
            // Determine session state
            const state = values.questionnaireId ? 1 : 2; // 1 = Homework, 2 = Regular
            const payload = {
                name: values.name,
                state,
                questionnaireId: values.questionnaireId || null,
                commentaryId: editingSession.commentaryId,
                currentSelectedQuestionId: editingSession.currentSelectedQuestionId,
                currentSelectedSessionStudentId: editingSession.currentSelectedSessionStudentId,
            };
            await sessionsApi.updateSession(editingSession.id, payload);
            message.success('Сесію оновлено успішно!');
            resetForm();
            setIsEditModalVisible(false);
            setEditingSession(null);
            fetchSessions(pagination.current, pagination.pageSize); // Refresh the current page
        } catch (err) {
            message.error(err.message || 'Не вдалося оновити сесію. Спробуйте ще раз.');
        } finally {
            setSubmitting(false);
        }
    };

    const getSessionStateIcon = (state) => {
        switch (state) {
            case 1: // Homework
                return <FileTextOutlined style={{ color: '#1890ff' }} />;
            case 2: // Regular
                return <PlayCircleOutlined style={{ color: '#52c41a' }} />;
            default:
                return <PauseCircleOutlined style={{ color: '#faad14' }} />;
        }
    };

    const getSessionStateText = (state) => {
        switch (state) {
            case 1:
                return 'Домашня робота';
            case 2:
                return 'Звичайна';
            default:
                return 'Невідомо';
        }
    };

    const getSessionStateColor = (state) => {
        switch (state) {
            case 1:
                return 'blue';
            case 2:
                return 'green';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns = [
        {
            title: 'Назва сесії',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Тип',
            dataIndex: 'state',
            key: 'state',
            render: (state) => (
                <Space>
                    {getSessionStateIcon(state)}
                    <Tag color={getSessionStateColor(state)}>
                        {getSessionStateText(state)}
                    </Tag>
                </Space>
            ),
            filters: [
                { text: 'Домашня робота', value: 1 },
                { text: 'Звичайна', value: 2 },
            ],
            onFilter: (value, record) => record.state === value,
        },
        {
            title: 'Опитування',
            dataIndex: 'questionnaire',
            key: 'questionnaire',
            render: (questionnaire) => (
                questionnaire ? (
                    <Space>
                        <FileTextOutlined style={{ color: '#722ed1' }} />
                        <Text>{questionnaire.name}</Text>
                    </Space>
                ) : (
                    <Text type="secondary">Не вказано</Text>
                )
            ),
        },
        {
            title: 'Студенти',
            dataIndex: 'sessionHomeworkStudents',
            key: 'students',
            render: (_, record) => {
                // Check different possible property names for students
                const homeworkStudents = record.sessionHomeworkStudents || [];
                const regularStudents = record.sessionRegularStudents || [];
                const students = record.students || [];
                
                // Use the highest count available
                let studentCount = 0;
                if (homeworkStudents.length > 0) {
                    studentCount = homeworkStudents.length;
                } else if (regularStudents.length > 0) {
                    studentCount = regularStudents.length;
                } else if (students.length > 0) {
                    studentCount = students.length;
                }
                
                console.log('Session students data:', {
                    sessionId: record.id,
                    sessionName: record.name,
                    homeworkStudents: homeworkStudents.length,
                    regularStudents: regularStudents.length,
                    students: students.length,
                    finalCount: studentCount
                });
                
                return (
                    <Space>
                        <TeamOutlined style={{ color: '#13c2c2' }} />
                        <Text>{studentCount} студентів</Text>
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aCount = Math.max(
                    (a.sessionHomeworkStudents?.length || 0),
                    (a.sessionRegularStudents?.length || 0),
                    (a.students?.length || 0)
                );
                const bCount = Math.max(
                    (b.sessionHomeworkStudents?.length || 0),
                    (b.sessionRegularStudents?.length || 0),
                    (b.students?.length || 0)
                );
                return aCount - bCount;
            },
        },
        {
            title: 'Створено',
            dataIndex: 'createdAtLocal',
            key: 'createdAtLocal',
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: '#fa8c16' }} />
                    <Text>{formatDate(date)}</Text>
                </Space>
            ),
            sorter: (a, b) => new Date(a.createdAtLocal) - new Date(b.createdAtLocal),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Дії',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Редагувати">
                        <Button 
                            type="text" 
                            icon={<FileTextOutlined />} 
                            size="small"
                            onClick={() => handleEditSession(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Почати сесію">
                        <Button 
                            type="text" 
                            icon={<PlayCircleOutlined />} 
                            size="small"
                            onClick={() => window.open(`/session/${record.id}`, '_blank')}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const SessionForm = ({ values, errors, touched, setFieldValue }) => {
        // Compute selected students
        const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds);

        return (
            <div>
                {/* Session Name */}
                <AntForm.Item
                    label="Назва сесії"
                    validateStatus={touched.name && errors.name ? 'error' : ''}
                    help={touched.name && errors.name}
                    required
                >
                    <Field name="name">
                        {({ field }) => <Input {...field} placeholder="Введіть назву сесії" autoFocus />}
                    </Field>
                </AntForm.Item>

                {/* Table Layout Dropdown */}
                <AntForm.Item
                    label="Розклад столів"
                    validateStatus={touched.tableLayoutId && errors.tableLayoutId ? 'error' : ''}
                    help={touched.tableLayoutId && errors.tableLayoutId}
                    required
                >
                    <Field name="tableLayoutId">
                        {({ field }) => (
                            <Select
                                {...field}
                                value={field.value}
                                onChange={val => setFieldValue('tableLayoutId', val)}
                                placeholder="Оберіть розклад столів"
                                showSearch
                                optionFilterProp="children"
                            >
                                {tableLayouts.map(layout => (
                                    <Option key={layout.id} value={layout.id}>{layout.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>

                {/* Questionnaire */}
                <AntForm.Item
                    label="Опитування"
                    validateStatus={touched.questionnaireId && errors.questionnaireId ? 'error' : ''}
                    help={touched.questionnaireId && errors.questionnaireId}
                >
                    <Field name="questionnaireId">
                        {({ field }) => (
                            <Select
                                {...field}
                                value={field.value}
                                onChange={val => setFieldValue('questionnaireId', val)}
                                placeholder="Оберіть опитування (необов'язково)"
                                showSearch
                                optionFilterProp="children"
                            >
                                {questionnaires.map(q => (
                                    <Option key={q.id} value={q.id}>{q.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>

                {/* Groups by Brand */}
                <Divider orientation="left">Групи за брендами</Divider>
                {brands.length === 0 ? (
                    <Empty description="Немає брендів" />
                ) : (
                    <Checkbox.Group
                        value={values.groupIds}
                        onChange={checked => setFieldValue('groupIds', checked)}
                        style={{ width: '100%' }}
                    >
                        {brands.map(brand => (
                            <div key={brand.id} style={{ marginBottom: 12 }}>
                                <b>{brand.name}</b>
                                <div style={{ marginLeft: 16, marginTop: 4 }}>
                                    {brandIdToGroups[brand.id]?.length ? (
                                        brandIdToGroups[brand.id].map(group => (
                                            <Checkbox key={group.id} value={group.id} style={{ marginRight: 12 }}>
                                                {group.name}
                                            </Checkbox>
                                        ))
                                    ) : (
                                        <span style={{ marginLeft: 8, color: '#aaa' }}>(немає груп)</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Checkbox.Group>
                )}

                {/* Students Multi-Select */}
                <Divider orientation="left">Додати студентів</Divider>
                <AntForm.Item>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Оберіть студентів для додавання"
                        value={values.studentIds}
                        onChange={val => setFieldValue('studentIds', val)}
                        style={{ width: '100%' }}
                        optionFilterProp="children"
                        showSearch
                    >
                        {allStudents.map(student => (
                            <Option
                                key={student.id}
                                value={student.id}
                                disabled={values.groupIds.some(gid => groupIdToStudents[gid]?.some(s => s.id === student.id))}
                            >
                                {student.fullName} ({student.group?.name || '—'})
                            </Option>
                        ))}
                    </Select>
                </AntForm.Item>

                {/* Selected Students Preview */}
                <Divider orientation="left">Всього студентів у сесії: {selectedStudentIds.length}</Divider>
                <Row gutter={[8, 8]}>
                    {selectedStudentIds.map(sid => {
                        const student = allStudents.find(s => s.id === sid);
                        return student ? (
                            <Col key={sid} span={12}>
                                <span>{student.fullName} <span style={{ color: '#888' }}>({student.group?.name || '—'})</span></span>
                            </Col>
                        ) : null;
                    })}
                </Row>
            </div>
        );
    };

    const EditSessionForm = ({ values, errors, touched, setFieldValue }) => {
        return (
            <div>
                {/* Session Name */}
                <AntForm.Item
                    label="Назва сесії"
                    validateStatus={touched.name && errors.name ? 'error' : ''}
                    help={touched.name && errors.name}
                    required
                >
                    <Field name="name">
                        {({ field }) => <Input {...field} placeholder="Введіть назву сесії" autoFocus />}
                    </Field>
                </AntForm.Item>

                {/* Questionnaire */}
                <AntForm.Item
                    label="Опитування"
                    validateStatus={touched.questionnaireId && errors.questionnaireId ? 'error' : ''}
                    help={touched.questionnaireId && errors.questionnaireId}
                >
                    <Field name="questionnaireId">
                        {({ field }) => (
                            <Select
                                {...field}
                                value={field.value}
                                onChange={val => setFieldValue('questionnaireId', val)}
                                placeholder="Оберіть опитування (необов'язково)"
                                showSearch
                                optionFilterProp="children"
                                allowClear
                            >
                                {questionnaires.map(q => (
                                    <Option key={q.id} value={q.id}>{q.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>

                {/* Session Type Info */}
                <AntForm.Item label="Тип сесії">
                    <Text type="secondary">
                        {values.questionnaireId ? 'Домашня робота' : 'Звичайна'}
                    </Text>
                </AntForm.Item>
            </div>
        );
    };

    if (error) {
        return (
            <Content style={{ padding: '24px' }}>
                <Alert
                    message="Помилка завантаження"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => fetchSessions(pagination.current, pagination.pageSize)}>
                            Спробувати знову
                        </Button>
                    }
                />
            </Content>
        );
    }

    return (
        <Content style={{ padding: '24px' }}>
            <Spin spinning={userData.status === 'loading' || loading} delay={500}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2}>Сесії</Title>
                        <Text type="secondary">
                            Перегляд всіх створених сесій
                        </Text>
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddSession}
                        >
                            Створити сесію
                        </Button>
                    </Space>
                </div>

                <Card>
                    <Table
                        columns={columns}
                        dataSource={sessions}
                        rowKey="id"
                        pagination={pagination}
                        onChange={handleTableChange}
                        loading={loading}
                        locale={{
                            emptyText: <Empty description="Сесії не знайдено" />
                        }}
                        size="middle"
                    />
                </Card>

                <Modal
                    title="Створити сесію"
                    open={isModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    width={700}
                >
                    <Formik
                        initialValues={{
                            name: '',
                            questionnaireId: '',
                            groupIds: [],
                            studentIds: [],
                            tableLayoutId: '',
                        }}
                        validationSchema={SessionSchema}
                        onSubmit={handleModalOk}
                    >
                        {({ values, errors, touched, setFieldValue }) => (
                            <Form autoComplete="off">
                                <SessionForm
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    setFieldValue={setFieldValue}
                                />
                                <Divider />
                                <div style={{ textAlign: 'right' }}>
                                    <Space>
                                        <Button onClick={handleModalCancel}>
                                            Скасувати
                                        </Button>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={submitting}
                                            disabled={loadingBGS || loadingQ || loadingTableLayouts}
                                        >
                                            Створити сесію
                                        </Button>
                                    </Space>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                <Modal
                    title="Редагувати сесію"
                    open={isEditModalVisible}
                    onCancel={handleEditModalCancel}
                    footer={null}
                    width={500}
                >
                    <Formik
                        initialValues={{
                            name: editingSession?.name || '',
                            questionnaireId: editingSession?.questionnaireId || '',
                        }}
                        validationSchema={Yup.object().shape({
                            name: Yup.string().required('Введіть назву сесії'),
                            questionnaireId: Yup.string(),
                        })}
                        onSubmit={handleEditModalOk}
                        enableReinitialize
                    >
                        {({ values, errors, touched, setFieldValue }) => (
                            <Form autoComplete="off">
                                <EditSessionForm
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    setFieldValue={setFieldValue}
                                />
                                <Divider />
                                <div style={{ textAlign: 'right' }}>
                                    <Space>
                                        <Button onClick={handleEditModalCancel}>
                                            Скасувати
                                        </Button>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={submitting}
                                            disabled={loadingQ}
                                        >
                                            Оновити сесію
                                        </Button>
                                    </Space>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </Spin>
        </Content>
    );
};

export default SessionsOverviewPage; 