import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Table, Typography, Spin, Empty, Card, Space, Button, Alert, Tag, Tooltip, Modal, Popconfirm, message } from 'antd';
import { 
    PlayCircleOutlined, 
    PauseCircleOutlined, 
    StopOutlined, 
    UserOutlined, 
    FileTextOutlined, 
    CalendarOutlined,
    TeamOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    CloseOutlined,
    FolderOutlined,
    InboxOutlined,
    UndoOutlined
} from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Input, Select, Checkbox, Divider, Row, Col, Form as AntForm } from 'antd';
import { sessionsApi } from '../../services/sessionsApi';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import { useQuestionnaires } from '../../hooks/useQuestionnaires';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const SessionSchema = Yup.object().shape({
  name: Yup.string().required('Введіть назву уроку'),
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
    const [studentsWithAnswers, setStudentsWithAnswers] = useState(new Set()); // Track students who failed deletion
    const [showArchived, setShowArchived] = useState(false); // Toggle between active and archived lessons
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} з ${total} уроків`,
    });

    // Session creation form data
    const {
        brands,
        groups,
        students,
        loading: loadingBGS,
        error: errorBGS,
        getStudentsByBrand,
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

    // Map groupId to students (updated for new structure)
    const groupIdToStudents = useMemo(() => {
        const map = {};
        groups.forEach(group => {
            map[group.id] = students.filter(s => s.groupId === group.id);
        });
        return map;
    }, [groups, students]);

    // Since groups are now independent of brands, all groups are available for all brands
    const brandIdToGroups = useMemo(() => {
        const map = {};
        brands.forEach(brand => {
            map[brand.id] = groups; // All groups are available for each brand
        });
        return map;
    }, [brands, groups]);

    // All students for multi-select
    const allStudents = students;

    // Helper: get unique student IDs from selected groups and selected students
    const getSelectedStudentIds = (groupIds, studentIds, groupStudentSelections = {}) => {
        console.log('getSelectedStudentIds called with:', { groupIds, studentIds, groupStudentSelections });
        console.log('groupIdToStudents:', groupIdToStudents);
        
        const groupStudentIds = groupIds
            .flatMap(gid => {
                if (groupStudentSelections[gid]) {
                    // Use individual selections for this group
                    console.log(`Group ${gid} using individual selections:`, groupStudentSelections[gid]);
                    return groupStudentSelections[gid];
                } else {
                    // Use all students from the group (default behavior)
                    const studentsInGroup = groupIdToStudents[gid]?.map(s => s.id) || [];
                    console.log(`Students in group ${gid}:`, studentsInGroup);
                    return studentsInGroup;
                }
            });
        
        console.log('Group student IDs:', groupStudentIds);
        console.log('Individual student IDs:', studentIds);
        
        const allStudentIds = Array.from(new Set([...groupStudentIds, ...studentIds]));
        console.log('Final combined student IDs:', allStudentIds);
        
        return allStudentIds;
    };

    const fetchSessions = async (page = 1, pageSize = 10, archived = showArchived) => {
        setLoading(true);
        try {
            const response = archived 
                ? await sessionsApi.getArchivedSessions(page, pageSize)
                : await sessionsApi.getAllSessions(page, pageSize);
            console.log(`${archived ? 'Archived' : 'Active'} Sessions API response:`, response);
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
            setError(`Не вдалося завантажити ${archived ? 'архівні' : 'активні'} уроки`);
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Refetch sessions when toggling between active/archived
    useEffect(() => {
        fetchSessions(1, pagination.pageSize, showArchived);
    }, [showArchived]);

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
            
            // Fetch students with answers from backend
            console.log('Fetching students with answers for session:', record.id);
            try {
                const studentsWithAnswersData = await sessionsApi.getSessionStudentsWithAnswers(record.id);
                console.log('Students with answers data:', studentsWithAnswersData);
                
                // Extract student IDs from the response
                const studentIdsWithAnswers = new Set();
                if (studentsWithAnswersData && Array.isArray(studentsWithAnswersData)) {
                    studentsWithAnswersData.forEach(studentData => {
                        if (studentData.studentId) {
                            studentIdsWithAnswers.add(studentData.studentId);
                        }
                    });
                }
                
                console.log('Setting studentsWithAnswers:', Array.from(studentIdsWithAnswers));
                setStudentsWithAnswers(studentIdsWithAnswers);
            } catch (answersError) {
                console.error('Error fetching students with answers:', answersError);
                // If the API doesn't exist yet, just clear the set
                setStudentsWithAnswers(new Set());
            }
        } catch (err) {
            message.error('Не вдалося завантажити дані уроку');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        try {
            await sessionsApi.deleteSession(sessionId);
            message.success('Урок архівовано успішно! Дані збережено для звітності.');
            fetchSessions(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error('Error deleting session:', err);
            
            // Provide more specific error messages
            if (err.message && err.message.includes('not be implemented')) {
                message.error('Функція архівування уроків ще не реалізована на сервері. Зверніться до адміністратора.');
            } else if (err.response?.status === 404) {
                message.error('Урок не знайдено. Можливо, він вже був архівований.');
                // Refresh the list in case the session was already deleted
                fetchSessions(pagination.current, pagination.pageSize);
            } else if (err.response?.status === 500) {
                message.error('Помилка сервера при архівуванні уроку. Спробуйте пізніше або зверніться до адміністратора.');
            } else {
                message.error(`Не вдалося архівувати урок: ${err.message || 'Невідома помилка'}`);
            }
        }
    };

    const handleRestoreSession = async (sessionId) => {
        try {
            await sessionsApi.restoreSession(sessionId);
            message.success('Урок відновлено успішно!');
            fetchSessions(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error('Error restoring session:', err);
            
            // Provide more specific error messages
            if (err.message && err.message.includes('not be implemented')) {
                message.error('Функція відновлення уроків ще не реалізована на сервері. Зверніться до адміністратора.');
            } else if (err.response?.status === 404) {
                message.error('Архівний урок не знайдено.');
                // Refresh the list in case something changed
                fetchSessions(pagination.current, pagination.pageSize);
            } else if (err.response?.status === 500) {
                message.error('Помилка сервера при відновленні уроку. Спробуйте пізніше або зверніться до адміністратора.');
            } else {
                message.error(`Не вдалося відновити урок: ${err.message || 'Невідома помилка'}`);
            }
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingSession(null);
    };

    const handleEditModalCancel = () => {
        console.log('Clearing studentsWithAnswers on modal cancel');
        setIsEditModalVisible(false);
        setEditingSession(null);
        setStudentsWithAnswers(new Set()); // Clear tracked students when modal is closed
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
                Name: values.name,
                State: state,
                QuestionnaireId: values.questionnaireId || null,
                TableLayoutId: values.tableLayoutId,
                CommentaryId: null,
            };
            
            console.log('Creating session with payload:', payload);
            
            // Create the session
            const createdSession = await sessionsApi.createSession(payload);
            console.log('Session created successfully:', createdSession);
            
            // Get selected student IDs
            const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds, values.groupStudentSelections);
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
                        SessionId: createdSession.id,
                        StudentId: studentId,
                        TableNumber: tableNumber
                    };
                    console.log('Adding to session_regular_students:', regularStudentData);
                    studentPromises.push(
                        sessionsApi.createSessionRegularStudent(regularStudentData)
                    );
                    
                    // If questionnaire is selected, also add to session_homework_students
                    if (values.questionnaireId) {
                        const homeworkStudentData = {
                            SessionId: createdSession.id,
                            StudentId: studentId,
                            TableNumber: tableNumber
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
            message.success('Урок створено успішно!');
            resetForm();
            setIsModalVisible(false);
            fetchSessions(pagination.current, pagination.pageSize); // Refresh the current page
        } catch (err) {
            console.error('=== ERROR IN SESSION CREATION ===');
            console.error('Error details:', err);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            message.error(err.message || 'Не вдалося створити урок. Спробуйте ще раз.');
        } finally {
            console.log('=== handleModalOk finished ===');
            setSubmitting(false);
        }
    };

    const handleEditModalOk = async (values, { resetForm }) => {
        setSubmitting(true);
        try {
            if (!editingSession) throw new Error('Урок не знайдений');
            
            console.log('=== handleEditModalOk called ===');
            console.log('Values received:', values);
            console.log('Editing session:', editingSession);
            
            // 1. Update session basic info
            const state = values.questionnaireId ? 1 : 2; // 1 = Homework, 2 = Regular
            const sessionPayload = {
                Name: values.name,
                State: state,
                QuestionnaireId: values.questionnaireId || null,
                CommentaryId: editingSession.commentaryId,
                CurrentSelectedQuestionId: editingSession.currentSelectedQuestionId,
                CurrentSelectedSessionStudentId: editingSession.currentSelectedSessionStudentId,
            };
            await sessionsApi.updateSession(editingSession.id, sessionPayload);
            console.log('Session updated successfully');

            // 2. Handle student removals (preserve answers)
            const studentsToRemove = values.studentsToRemove || [];
            console.log('Students to remove:', studentsToRemove);
            console.log('Current studentsWithAnswers:', Array.from(studentsWithAnswers));
            
            if (studentsToRemove.length > 0) {
                console.log('Removing students from session...');
                const removalPromises = [];
                
                studentsToRemove.forEach(studentId => {
                    // Skip removal if student has answers
                    if (studentsWithAnswers.has(studentId)) {
                        console.log(`Skipping removal of student ${studentId} - has answers`);
                        return;
                    }
                    
                    console.log(`Processing removal for student ID: ${studentId}`);
                    
                    // Remove from homework students if exists
                    const homeworkStudent = editingSession.sessionHomeworkStudents?.find(s => s.studentId === studentId);
                    if (homeworkStudent) {
                        console.log('Found homework student to remove:', homeworkStudent);
                        removalPromises.push(
                            sessionsApi.deleteSessionHomeworkStudent(homeworkStudent.id)
                                .then(() => console.log(`Successfully removed homework student ${studentId}`))
                                .catch(err => console.error(`Failed to remove homework student ${studentId}:`, err))
                        );
                    }
                    
                    // Remove from regular students if exists
                    const regularStudent = editingSession.sessionRegularStudents?.find(s => s.studentId === studentId);
                    if (regularStudent) {
                        console.log('Found regular student to remove:', regularStudent);
                        removalPromises.push(
                            sessionsApi.deleteSessionRegularStudent(regularStudent.id)
                                .then(() => console.log(`Successfully removed regular student ${studentId}`))
                                .catch(err => console.error(`Failed to remove regular student ${studentId}:`, err))
                        );
                    }
                });
                
                if (removalPromises.length > 0) {
                    await Promise.all(removalPromises);
                    console.log('Student removals completed');
                }
            }

            // 3. Handle student additions
            const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds, values.groupStudentSelections);
            console.log('New students to add:', selectedStudentIds);
            
            // Filter out students that are already in the session
            const currentHomeworkStudents = editingSession.sessionHomeworkStudents || [];
            const currentRegularStudents = editingSession.sessionRegularStudents || [];
            const currentStudentIds = [
                ...currentHomeworkStudents.map(s => s.studentId),
                ...currentRegularStudents.map(s => s.studentId)
            ];
            const uniqueCurrentStudentIds = [...new Set(currentStudentIds)];
            
            // Only add students that are not already in the session and not being removed
            const studentsToAdd = selectedStudentIds.filter(studentId => 
                !uniqueCurrentStudentIds.includes(studentId) || studentsToRemove.includes(studentId)
            );
            
            console.log('Current students in session:', uniqueCurrentStudentIds);
            console.log('Students being removed:', studentsToRemove);
            console.log('Filtered students to add:', studentsToAdd);
            
            if (studentsToAdd.length > 0) {
                console.log('Adding new students to session...');
                const additionPromises = [];
                
                studentsToAdd.forEach((studentId, index) => {
                    const tableNumber = (index % 10) + 1; // Simple table assignment
                    
                    // Add to regular students (always)
                    const regularStudentData = {
                        SessionId: editingSession.id,
                        StudentId: studentId,
                        TableNumber: tableNumber
                    };
                    additionPromises.push(
                        sessionsApi.createSessionRegularStudent(regularStudentData)
                    );
                    
                    // Add to homework students if questionnaire is selected
                    if (values.questionnaireId) {
                        const homeworkStudentData = {
                            SessionId: editingSession.id,
                            StudentId: studentId,
                            TableNumber: tableNumber
                        };
                        additionPromises.push(
                            sessionsApi.createSessionHomeworkStudent(homeworkStudentData)
                        );
                    }
                });
                
                await Promise.all(additionPromises);
                console.log('Student additions completed');
            } else {
                console.log('No new students to add (all selected students are already in session)');
            }

            // Check if any students being removed have answers
            const studentsWithAnswersBeingRemoved = studentsToRemove.filter(studentId => 
                studentsWithAnswers.has(studentId)
            );
            
            // Show appropriate success message
            if (studentsWithAnswersBeingRemoved.length > 0) {
                message.warning(`Урок оновлено. ${studentsWithAnswersBeingRemoved.length} студент(ів) не було видалено через наявність відповідей.`);
            } else if (studentsToRemove.length > 0) {
                message.success('Урок та студенти оновлені успішно!');
            } else {
            message.success('Урок оновлено успішно!');
            }
            
            resetForm();
            setIsEditModalVisible(false);
            setEditingSession(null);
            // Don't clear studentsWithAnswers here - let it persist until modal is reopened
            fetchSessions(pagination.current, pagination.pageSize); // Refresh the current page
            console.log('=== handleEditModalOk finished ===');
        } catch (err) {
            console.error('Error updating session:', err);
            message.error(err.message || 'Не вдалося оновити урок. Спробуйте ще раз.');
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
            title: 'Назва уроку',
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
                    {!showArchived ? (
                        // Actions for active lessons
                        <>
                            <Tooltip title="Почати урок">
                                <Button 
                                    type="text" 
                                    icon={<PlayCircleOutlined />} 
                                    size="small"
                                    onClick={() => window.open(`/session/${record.id}`, '_blank')}
                                />
                            </Tooltip>
                            <Tooltip title="Редагувати">
                                <Button 
                                    type="text" 
                                    icon={<EditOutlined />} 
                                    size="small"
                                    onClick={() => handleEditSession(record)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Архівувати урок"
                                description="Ви впевнені, що хочете архівувати цей урок? Урок буде позначений як видалений, але дані збережуться для звітності."
                                onConfirm={() => handleDeleteSession(record.id)}
                                okText="Так"
                                cancelText="Ні"
                                okType="danger"
                            >
                                <Tooltip title="Архівувати">
                                    <Button 
                                        type="text" 
                                        danger
                                        icon={<DeleteOutlined />} 
                                        size="small"
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    ) : (
                        // Actions for archived lessons
                        <>
                            <Tooltip title="Відновити урок">
                                <Button 
                                    type="text" 
                                    icon={<UndoOutlined />} 
                                    size="small"
                                    onClick={() => handleRestoreSession(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
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
                    label="Назва уроку"
                    validateStatus={touched.name && errors.name ? 'error' : ''}
                    help={touched.name && errors.name}
                    required
                >
                    <Field name="name">
                        {({ field }) => <Input {...field} placeholder="Введіть назву уроку" autoFocus />}
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
                                allowClear
                                style={{ width: '100%' }}
                            >
                                {questionnaires.map(q => (
                                    <Option key={q.id} value={q.id}>{q.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>

                {/* Groups Selection with Student Lists */}
                <Divider orientation="left">Оберіть групи</Divider>
                {groups.length === 0 ? (
                    <Empty description="Немає груп" />
                ) : (
                    <div style={{ width: '100%' }}>
                      {groups.map(group => {
                        const groupStudents = groupIdToStudents[group.id] || [];
                        const isGroupSelected = values.groupIds.includes(group.id);
                        const selectedStudentsInGroup = values.groupStudentSelections[group.id] || [];
                        
                        const handleGroupToggle = (checked) => {
                          if (checked) {
                            // Add group to selected groups
                            setFieldValue('groupIds', [...values.groupIds, group.id]);
                            // Initially select all students in the group
                            setFieldValue('groupStudentSelections', {
                              ...values.groupStudentSelections,
                              [group.id]: groupStudents.map(s => s.id)
                            });
                          } else {
                            // Remove group from selected groups
                            setFieldValue('groupIds', values.groupIds.filter(gid => gid !== group.id));
                            // Remove student selections for this group
                            const newSelections = { ...values.groupStudentSelections };
                            delete newSelections[group.id];
                            setFieldValue('groupStudentSelections', newSelections);
                          }
                        };

                        const handleStudentToggle = (studentId, checked) => {
                          const currentSelections = values.groupStudentSelections[group.id] || [];
                          let newSelections;
                          
                          if (checked) {
                            newSelections = [...currentSelections, studentId];
                          } else {
                            newSelections = currentSelections.filter(sid => sid !== studentId);
                          }
                          
                          setFieldValue('groupStudentSelections', {
                            ...values.groupStudentSelections,
                            [group.id]: newSelections
                          });
                        };

                        return (
                          <Card 
                            key={group.id} 
                            size="small" 
                            style={{ marginBottom: 16 }}
                            title={
                              <Checkbox
                                checked={isGroupSelected}
                                onChange={(e) => handleGroupToggle(e.target.checked)}
                              >
                                {group.name} ({groupStudents.length} студентів)
                              </Checkbox>
                            }
                          >
                            {isGroupSelected && (
                              <div style={{ paddingLeft: 24 }}>
                                <Row gutter={[8, 8]}>
                                  {groupStudents.map(student => {
                                    const brand = brands.find(b => b.id === student.brandId);
                                    const isStudentSelected = selectedStudentsInGroup.includes(student.id);
                                    
                                    return (
                                      <Col key={student.id} span={12}>
                                        <Checkbox
                                          checked={isStudentSelected}
                                          onChange={(e) => handleStudentToggle(student.id, e.target.checked)}
                                        >
                                          <span style={{ fontSize: '12px' }}>
                                            {student.fullName}
                                            <span style={{ color: '#888', marginLeft: 4 }}>
                                              ({brand?.name || 'Без бренду'})
                                            </span>
                                          </span>
                                        </Checkbox>
                                      </Col>
                                    );
                                  })}
                                </Row>
                                {selectedStudentsInGroup.length !== groupStudents.length && (
                                  <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
                                    Обрано {selectedStudentsInGroup.length} з {groupStudents.length} студентів
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
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
                        {allStudents.map(student => {
                            const group = groups.find(g => g.id === student.groupId);
                            const brand = brands.find(b => b.id === student.brandId);
                            
                            // Check if student is already selected through a group
                            const isSelectedThroughGroup = values.groupIds.some(gid => {
                              const groupSelections = values.groupStudentSelections[gid];
                              return groupSelections ? groupSelections.includes(student.id) : 
                                     groupIdToStudents[gid]?.some(s => s.id === student.id);
                            });
                            
                            return (
                              <Option
                                key={student.id}
                                value={student.id}
                                disabled={isSelectedThroughGroup}
                              >
                                {student.fullName} ({group?.name || '—'} - {brand?.name || 'Без бренду'})
                                {isSelectedThroughGroup && <span style={{ color: '#888' }}> (вже обрано через групу)</span>}
                              </Option>
                            );
                        })}
                    </Select>
                </AntForm.Item>

                {/* Selected Students Preview */}
                <Divider orientation="left">Всього студентів в уроці: {selectedStudentIds.length}</Divider>
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
        // Get current students in the session
        const currentHomeworkStudents = editingSession?.sessionHomeworkStudents || [];
        const currentRegularStudents = editingSession?.sessionRegularStudents || [];
        const currentStudentIds = [
            ...currentHomeworkStudents.map(s => s.studentId),
            ...currentRegularStudents.map(s => s.studentId)
        ];
        const uniqueCurrentStudentIds = [...new Set(currentStudentIds)];

        // Compute selected students for preview
        const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds);
        const allSelectedStudentIds = [...new Set([...uniqueCurrentStudentIds, ...selectedStudentIds])];

        return (
            <div>
                {/* Session Name */}
                <AntForm.Item
                    label="Назва уроку"
                    validateStatus={touched.name && errors.name ? 'error' : ''}
                    help={touched.name && errors.name}
                    required
                >
                    <Field name="name">
                        {({ field }) => <Input {...field} placeholder="Введіть назву уроку" autoFocus />}
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
                                style={{ width: '100%' }}
                            >
                                {questionnaires.map(q => (
                                    <Option key={q.id} value={q.id}>{q.name}</Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>

                {/* Current Students */}
                <Divider orientation="left">Поточні студенти в уроці</Divider>
                <div style={{ marginBottom: 12, padding: 8, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        💡 <strong>Підказка:</strong> Студенти з 📝 мають відповіді і не можуть бути видалені. 
                        Дані про відповіді завантажуються з сервера при відкритті редагування.
                    </Text>
                </div>
                {(() => {
                    // Filter out students marked for removal
                    const studentsToRemove = values.studentsToRemove || [];
                    const displayedStudents = uniqueCurrentStudentIds.filter(studentId => 
                        !studentsToRemove.includes(studentId)
                    );
                    
                    return displayedStudents.length === 0 ? (
                        <Empty description="Немає студентів в уроці" size="small" />
                    ) : (
                        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                            {displayedStudents.map(studentId => {
                                const student = allStudents.find(s => s.id === studentId);
                                if (!student) return null;
                                const group = groups.find(g => g.id === student.groupId);
                                const brand = brands.find(b => b.id === student.brandId);
                                
                                // Check if this student is in our tracked set of students with answers
                                // This set is populated when deletion attempts fail due to constraint errors
                                const hasAnswers = studentsWithAnswers.has(studentId);
                                console.log(`Student ${studentId} hasAnswers: ${hasAnswers}, studentsWithAnswers:`, Array.from(studentsWithAnswers));
                                
                                return (
                                    <Col key={studentId} span={12}>
                                        <Tag 
                                            closable 
                                            onClose={() => {
                                                // Add to removal list (we'll handle this in submit)
                                                const currentRemovals = values.studentsToRemove || [];
                                                if (!currentRemovals.includes(studentId)) {
                                                    setFieldValue('studentsToRemove', [...currentRemovals, studentId]);
                                                }
                                            }}
                                            color={hasAnswers ? "orange" : "blue"}
                                            title={hasAnswers ? "Цей студент може мати відповіді. Видалення може бути обмежено." : "Клікніть × щоб видалити"}
                                        >
                                            {student.fullName} ({group?.name || '—'} - {brand?.name || 'Без бренду'})
                                            {hasAnswers && " 📝"}
                                        </Tag>
                                    </Col>
                                );
                            })}
                        </Row>
                    );
                })()}

                {/* Students Marked for Removal */}
                {(() => {
                    const studentsToRemove = values.studentsToRemove || [];
                    if (studentsToRemove.length === 0) return null;
                    
                    return (
                        <>
                            <Divider orientation="left">Студенти для видалення: {studentsToRemove.length}</Divider>
                            <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                                {studentsToRemove.map(studentId => {
                                    const student = allStudents.find(s => s.id === studentId);
                                    if (!student) return null;
                                    const group = groups.find(g => g.id === student.groupId);
                                    const brand = brands.find(b => b.id === student.brandId);
                                    return (
                                        <Col key={studentId} span={12}>
                                            <Tag 
                                                closable 
                                                onClose={() => {
                                                    // Remove from removal list (undo removal)
                                                    const currentRemovals = values.studentsToRemove || [];
                                                    const updatedRemovals = currentRemovals.filter(id => id !== studentId);
                                                    setFieldValue('studentsToRemove', updatedRemovals);
                                                }}
                                                color="red"
                                            >
                                                {student.fullName} ({group?.name || '—'} - {brand?.name || 'Без бренду'})
                                            </Tag>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </>
                    );
                })()}

                {/* Groups Selection */}
                <Divider orientation="left">Додати студентів за групами</Divider>
                {groups.length === 0 ? (
                    <Empty description="Немає груп" />
                ) : (
                    <Checkbox.Group
                        value={values.groupIds}
                        onChange={checked => setFieldValue('groupIds', checked)}
                        style={{ width: '100%' }}
                    >
                        <Row gutter={[16, 8]}>
                            {groups.map(group => (
                                <Col key={group.id} span={8}>
                                    <Checkbox value={group.id} style={{ marginBottom: 8 }}>
                                        {group.name} ({groupIdToStudents[group.id]?.length || 0} студентів)
                                    </Checkbox>
                                </Col>
                            ))}
                        </Row>
                    </Checkbox.Group>
                )}

                {/* Individual Students */}
                <Divider orientation="left">Додати окремих студентів</Divider>
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
                        {allStudents.map(student => {
                            const group = groups.find(g => g.id === student.groupId);
                            const brand = brands.find(b => b.id === student.brandId);
                            const isAlreadyInSession = uniqueCurrentStudentIds.includes(student.id);
                            const isSelectedInGroups = values.groupIds.some(gid => 
                                groupIdToStudents[gid]?.some(s => s.id === student.id)
                            );
                            return (
                                <Option
                                    key={student.id}
                                    value={student.id}
                                    disabled={isAlreadyInSession || isSelectedInGroups}
                                >
                                    {student.fullName} ({group?.name || '—'} - {brand?.name || 'Без бренду'})
                                    {isAlreadyInSession && ' (вже в уроці)'}
                                </Option>
                            );
                        })}
                    </Select>
                </AntForm.Item>

                {/* New Students Preview */}
                {selectedStudentIds.length > 0 && (
                    <>
                        <Divider orientation="left">Нові студенти для додавання: {selectedStudentIds.length}</Divider>
                        <Row gutter={[8, 8]}>
                            {selectedStudentIds.map(sid => {
                                const student = allStudents.find(s => s.id === sid);
                                if (!student) return null;
                                const group = groups.find(g => g.id === student.groupId);
                                const brand = brands.find(b => b.id === student.brandId);
                                return (
                                    <Col key={sid} span={12}>
                                        <Tag color="green">
                                            {student.fullName} ({group?.name || '—'} - {brand?.name || 'Без бренду'})
                                        </Tag>
                                    </Col>
                                );
                            })}
                        </Row>
                    </>
                )}

                {/* Session Type Info */}
                <Divider />
                <AntForm.Item label="Тип уроку">
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
                        <Title level={2}>
                            {showArchived ? 'Архівні уроки' : 'Уроки'}
                        </Title>
                        <Text type="secondary">
                            {showArchived 
                                ? 'Перегляд архівованих уроків'
                                : 'Перегляд всіх активних уроків'
                            }
                        </Text>
                    </div>
                    <Space>
                        <Button
                            icon={showArchived ? <InboxOutlined /> : <FolderOutlined />}
                            onClick={() => setShowArchived(!showArchived)}
                            type={showArchived ? "default" : "dashed"}
                        >
                            {showArchived ? 'Показати активні' : 'Показати архівні'}
                        </Button>
                        {!showArchived && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddSession}
                            >
                                Створити урок
                            </Button>
                        )}
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
                            emptyText: <Empty description={showArchived ? "Архівні уроки не знайдено" : "Уроки не знайдено"} />
                        }}
                        size="middle"
                    />
                </Card>

                <Modal
                    title="Створити урок"
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
                            groupStudentSelections: {}, // { groupId: [studentId1, studentId2, ...] }
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
                                            Створити урок
                                        </Button>
                                    </Space>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                <Modal
                    title="Редагувати урок"
                    open={isEditModalVisible}
                    onCancel={handleEditModalCancel}
                    footer={null}
                    width={800}
                >
                    <Formik
                        initialValues={{
                            name: editingSession?.name || '',
                            questionnaireId: editingSession?.questionnaireId || '',
                            groupIds: [],
                            studentIds: [],
                            studentsToRemove: [],
                        }}
                        validationSchema={Yup.object().shape({
                            name: Yup.string().required('Введіть назву уроку'),
                            questionnaireId: Yup.string(),
                            groupIds: Yup.array().of(Yup.string()),
                            studentIds: Yup.array().of(Yup.string()),
                            studentsToRemove: Yup.array().of(Yup.string()),
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
                                            Оновити урок
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