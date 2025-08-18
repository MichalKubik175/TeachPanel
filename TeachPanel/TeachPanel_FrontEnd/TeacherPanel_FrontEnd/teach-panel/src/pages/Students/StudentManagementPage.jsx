import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Table, Typography, Spin, Empty, Button, Modal, Space, message, Popconfirm, Alert, Collapse, Card, Row, Col, Input } from 'antd';
import { UserOutlined, TrophyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, TeamOutlined, FileTextOutlined, BookOutlined, SearchOutlined, PercentageOutlined } from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Form as AntForm, Select, InputNumber } from 'antd';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents.js';
import { sessionHomeworkAnswersApi } from '../../services/sessionHomeworkAnswersApi.js';
import { sessionRegularAnswersApi } from '../../services/sessionRegularAnswersApi.js';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const StudentManagementPage = ({ onBack, onSwitchToGroups, onSwitchToBrands }) => {
    const userData = useSelector((state) => state.auth);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [studentScores, setStudentScores] = useState({}); // { studentId: { homeworkScore, regularScore, homeworkEfficiency, regularEfficiency } }
    const [loadingScores, setLoadingScores] = useState(false);

    const {
        students,
        groups,
        brands,
        loading,
        error,
        pagination,
        createStudent,
        updateStudent,
        deleteStudent,
        getStudentsByBrand,
        setError
    } = useBrandsGroupsStudents();

    // Validation schema
    const validationSchema = Yup.object({
        fullName: Yup.string()
            .required('Ім\'я студента обов\'язкове')
            .min(2, 'Ім\'я повинно містити щонайменше 2 символів')
            .max(50, 'Ім\'я повинно бути менше 50 символів'),
        brandId: Yup.string()
            .required('Бренд обов\'язковий'),
        groupId: Yup.string()
            .required('Група обов\'язкова'),
    });

    // Helper function to get answer state score
    const getAnswerStateScore = (state) => {
        // Handle both numeric and string enum values
        switch (state) {
            case 1: case '1': case 'Green': case 'green':
                return 1.0;
            case 3: case '3': case 'Yellow': case 'yellow':
                return 0.5;
            case 2: case '2': case 'Red': case 'red':
                return 0.0;
            case 0: case '0': case 'None': case 'none':
            default:
                return 0.0;
        }
    };

    // Calculate scores for all students
    const calculateStudentScores = async () => {
        if (!students || students.length === 0) return;

        setLoadingScores(true);
        console.log('Starting to calculate scores for', students.length, 'students');
        
        try {
            // Get all homework and regular answers
            const [homeworkAnswersResponse, regularAnswersResponse] = await Promise.all([
                sessionHomeworkAnswersApi.getAllSessionHomeworkAnswers(1, 10000),
                sessionRegularAnswersApi.getAllSessionRegularAnswers(1, 10000)
            ]);

            console.log('=== STUDENT SCORES DEBUG ===');
            console.log('Homework answers response:', homeworkAnswersResponse);
            console.log('Homework answers count:', homeworkAnswersResponse?.items?.length || 0);
            console.log('Regular answers response:', regularAnswersResponse);
            console.log('Regular answers count:', regularAnswersResponse?.items?.length || 0);
            console.log('Students to calculate scores for:', students.map(s => ({ id: s.id, name: s.fullName })));
            
            // Debug: Show sample answers to check ID format
            if (homeworkAnswersResponse?.items?.length > 0) {
                console.log('Sample homework answer:', homeworkAnswersResponse.items[0]);
                console.log('Homework answer student IDs:', homeworkAnswersResponse.items.map(a => a.sessionHomeworkStudentId));
            }
            
            if (regularAnswersResponse?.items?.length > 0) {
                console.log('Sample regular answer:', regularAnswersResponse.items[0]);
                console.log('Regular answer student IDs:', regularAnswersResponse.items.map(a => a.sessionRegularStudentId));
            }

            const scores = {};

            // Calculate scores for each student
            students.forEach(student => {
                console.log(`\n--- Processing student: ${student.fullName} (${student.id}) ---`);
                
                // Find homework answers for this student (through sessionHomeworkStudent.studentId)
                const studentHomeworkAnswers = homeworkAnswersResponse?.items?.filter(answer => 
                    answer.sessionHomeworkStudent?.studentId === student.id
                ) || [];
                
                console.log(`Homework answers for ${student.fullName}:`, studentHomeworkAnswers.length);
                if (studentHomeworkAnswers.length > 0) {
                    console.log('Sample homework answer:', studentHomeworkAnswers[0]);
                    console.log('SessionHomeworkStudent:', studentHomeworkAnswers[0].sessionHomeworkStudent);
                }

                // Find regular answers for this student (through sessionRegularStudent.studentId)
                const studentRegularAnswers = regularAnswersResponse?.items?.filter(answer => 
                    answer.sessionRegularStudent?.studentId === student.id
                ) || [];
                
                console.log(`Regular answers for ${student.fullName}:`, studentRegularAnswers.length);
                if (studentRegularAnswers.length > 0) {
                    console.log('Sample regular answer:', studentRegularAnswers[0]);
                    console.log('SessionRegularStudent:', studentRegularAnswers[0].sessionRegularStudent);
                }

                // Calculate homework scores
                const homeworkTotalScore = studentHomeworkAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const homeworkTotalQuestions = studentHomeworkAnswers.length;
                const homeworkMaxPossibleScore = homeworkTotalQuestions * 1.0;
                const homeworkEfficiency = homeworkTotalQuestions > 0 ? 
                    ((homeworkTotalScore / homeworkMaxPossibleScore) * 100) : 0;

                // Calculate regular scores
                const regularTotalScore = studentRegularAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const regularTotalQuestions = studentRegularAnswers.length;
                const regularMaxPossibleScore = regularTotalQuestions * 1.0;
                const regularEfficiency = regularTotalQuestions > 0 ? 
                    ((regularTotalScore / regularMaxPossibleScore) * 100) : 0;

                scores[student.id] = {
                    homeworkScore: homeworkTotalScore,
                    homeworkTotalQuestions,
                    homeworkEfficiency: homeworkEfficiency.toFixed(1),
                    regularScore: regularTotalScore,
                    regularTotalQuestions,
                    regularEfficiency: regularEfficiency.toFixed(1)
                };

                console.log(`Student ${student.fullName}:`, scores[student.id]);
            });

            setStudentScores(scores);
            console.log('Scores calculation completed');

        } catch (error) {
            console.error('Error calculating student scores:', error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            message.error('Помилка при розрахунку балів студентів');
            
            // Set empty scores so columns show "-" instead of loading
            const emptyScores = {};
            students.forEach(student => {
                emptyScores[student.id] = {
                    homeworkScore: 0,
                    homeworkTotalQuestions: 0,
                    homeworkEfficiency: '0.0',
                    regularScore: 0,
                    regularTotalQuestions: 0,
                    regularEfficiency: '0.0'
                };
            });
            setStudentScores(emptyScores);
        } finally {
            setLoadingScores(false);
        }
    };

    // Load scores when students change
    useEffect(() => {
        calculateStudentScores();
    }, [students]);

    const handleAddStudent = () => {
        setEditingStudent(null);
        setIsModalVisible(true);
    };

    const handleEditStudent = (record) => {
        setEditingStudent(record);
        setIsModalVisible(true);
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            await deleteStudent(studentId);
            messageApi.success('Студента успішно видалено');
        } catch (error) {
            messageApi.error('Не вдалося видалити студента');
        }
    };

    const handleModalOk = async (values, { setSubmitting, resetForm }) => {
        try {
            // Transform form values to match backend API
            const studentData = {
                fullName: values.fullName,
                brandId: values.brandId,
                groupId: values.groupId
            };

            if (editingStudent) {
                // Edit existing student
                await updateStudent(editingStudent.id, studentData);
                messageApi.success('Студента успішно оновлено');
            } else {
                // Add new student
                await createStudent(studentData);
                messageApi.success('Студента успішно додано');
            }
            
            setSubmitting(false);
            resetForm();
            setIsModalVisible(false);
        } catch (error) {
            setSubmitting(false);
            messageApi.error('Не вдалося зберегти студента');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingStudent(null);
    };

    // Filter students based on search text
    const filteredStudents = useMemo(() => {
        if (!searchText.trim()) return students;
        
        return students.filter(student => {
            const brand = brands.find(b => b.id === student.brandId);
            const group = groups.find(g => g.id === student.groupId);
            
            return student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                   group?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                   brand?.name?.toLowerCase().includes(searchText.toLowerCase());
        });
    }, [students, searchText, brands, groups]);

    // Organize students by group
    const studentsByGroup = useMemo(() => {
        const organized = {};
        
        filteredStudents.forEach(student => {
            const group = groups.find(g => g.id === student.groupId);
            const groupName = group?.name || 'Невідома група';
            
            if (!organized[groupName]) {
                organized[groupName] = [];
            }
            
            organized[groupName].push(student);
        });
        
        return organized;
    }, [filteredStudents, groups]);

    const studentColumns = [
        {
            title: 'Ім\'я студента',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 180,
            render: (text) => (
                <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Бренд',
            key: 'brand',
            width: 150,
            render: (_, record) => {
                const brand = brands.find(b => b.id === record.brandId);
                return (
                    <Space>
                        <BookOutlined style={{ color: '#1890ff' }} />
                        <Text>{brand?.name || 'Без бренду'}</Text>
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aBrand = brands.find(brand => brand.id === a.brandId)?.name || 'Без бренду';
                const bBrand = brands.find(brand => brand.id === b.brandId)?.name || 'Без бренду';
                return aBrand.localeCompare(bBrand);
            },
        },
        {
            title: 'Загальний бал(Контрольні роботи)',
            key: 'homeworkScore',
            width: 200,
            render: (_, record) => {
                const scores = studentScores[record.id];
                if (!scores) {
                    return loadingScores ? <Spin size="small" /> : <Text>-</Text>;
                }
                return (
                    <Space>
                        <TrophyOutlined style={{ color: '#faad14' }} />
                        <Text strong>
                            {scores.homeworkScore} / {scores.homeworkTotalQuestions}
                        </Text>
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aScore = studentScores[a.id]?.homeworkScore || 0;
                const bScore = studentScores[b.id]?.homeworkScore || 0;
                return aScore - bScore;
            },
        },
        {
            title: 'Загальний бал(Заняття)',
            key: 'regularScore',
            width: 180,
            render: (_, record) => {
                const scores = studentScores[record.id];
                if (!scores) {
                    return loadingScores ? <Spin size="small" /> : <Text>-</Text>;
                }
                return (
                    <Space>
                        <TrophyOutlined style={{ color: '#faad14' }} />
                        <Text strong>
                            {scores.regularScore} / {scores.regularTotalQuestions}
                        </Text>
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aScore = studentScores[a.id]?.regularScore || 0;
                const bScore = studentScores[b.id]?.regularScore || 0;
                return aScore - bScore;
            },
        },
        {
            title: 'Ефективність(Контрольні)',
            key: 'homeworkEfficiency',
            width: 150,
            render: (_, record) => {
                const scores = studentScores[record.id];
                if (!scores) {
                    return loadingScores ? <Spin size="small" /> : <Text>-</Text>;
                }
                const efficiency = parseFloat(scores.homeworkEfficiency);
                return (
                    <Space>
                        <PercentageOutlined style={{ color: 'var(--color-primary)' }} />
                        <Text strong style={{ 
                            color: efficiency >= 70 ? 'var(--color-success)' : efficiency >= 50 ? 'var(--color-warning)' : 'var(--color-error)' 
                        }}>
                            {scores.homeworkEfficiency}%
                        </Text>
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aEfficiency = parseFloat(studentScores[a.id]?.homeworkEfficiency || 0);
                const bEfficiency = parseFloat(studentScores[b.id]?.homeworkEfficiency || 0);
                return aEfficiency - bEfficiency;
            },
        },
        {
            title: 'Ефективність(Заняття)',
            key: 'regularEfficiency',
            width: 150,
            render: (_, record) => {
                const scores = studentScores[record.id];
                if (!scores) {
                    return loadingScores ? <Spin size="small" /> : <Text>-</Text>;
                }
                const efficiency = parseFloat(scores.regularEfficiency);
                return (
                    <Space>
                        <PercentageOutlined style={{ color: 'var(--color-primary)' }} />
                        <Text strong style={{ 
                            color: efficiency >= 70 ? 'var(--color-success)' : efficiency >= 50 ? 'var(--color-warning)' : 'var(--color-error)' 
                        }}>
                            {scores.regularEfficiency}%
                        </Text>
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aEfficiency = parseFloat(studentScores[a.id]?.regularEfficiency || 0);
                const bEfficiency = parseFloat(studentScores[b.id]?.regularEfficiency || 0);
                return aEfficiency - bEfficiency;
            },
        },
        {
            title: 'Дії',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditStudent(record)}
                        size="small"
                    >
                        Редагувати
                    </Button>
                    <Popconfirm
                        title="Видалити студента"
                        description="Ви впевнені, що хочете видалити цього студента?"
                        onConfirm={() => handleDeleteStudent(record.id)}
                        okText="Так"
                        cancelText="Ні"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Видалити
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const StudentForm = ({ values, setFieldValue, errors, touched, isSubmitting }) => {
        // With the new structure, all groups are available regardless of brand
        const availableGroups = groups;

        return (
            <div>
                <AntForm.Item
                    label="Ім'я студента"
                    validateStatus={errors.fullName && touched.fullName ? 'error' : ''}
                    help={errors.fullName && touched.fullName ? errors.fullName : ''}
                >
                    <Field name="fullName">
                        {({ field }) => (
                            <Input
                                {...field}
                                placeholder="Введіть ім'я студента"
                                prefix={<UserOutlined />}
                            />
                        )}
                    </Field>
                </AntForm.Item>

                <AntForm.Item
                    label="Бренд"
                    validateStatus={errors.brandId && touched.brandId ? 'error' : ''}
                    help={errors.brandId && touched.brandId ? errors.brandId : ''}
                >
                    <Field name="brandId">
                        {({ field }) => (
                            <Select
                                {...field}
                                placeholder="Виберіть бренд"
                                onChange={(value) => {
                                    setFieldValue('brandId', value);
                                    // No need to reset group anymore since groups are independent
                                }}
                            >
                                {brands.map(brand => (
                                    <Option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>

                <AntForm.Item
                    label="Група"
                    validateStatus={errors.groupId && touched.groupId ? 'error' : ''}
                    help={errors.groupId && touched.groupId ? errors.groupId : ''}
                >
                    <Field name="groupId">
                        {({ field }) => (
                            <Select
                                {...field}
                                placeholder="Виберіть групу"
                                onChange={(value) => setFieldValue('groupId', value)}
                            >
                                {availableGroups.map(group => (
                                    <Option key={group.id} value={group.id}>
                                        {group.name}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Field>
                </AntForm.Item>
            </div>
        );
    };

    return (
        <Content style={{ padding: '24px' }}>
            {contextHolder}
            <Spin spinning={userData.status === 'loading' || loading} delay={500}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={onBack}
                            size="large"
                        >
                            Назад до огляду
                        </Button>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddStudent}
                                size="large"
                            >
                                Додати студента
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <Title level={2}>Керування студентами</Title>
                        <Text type="secondary">
                            Додавання, редагування або видалення студентів
                        </Text>
                        {students.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                    {searchText ? (
                                        `Знайдено: ${filteredStudents.length} з ${students.length} студентів в ${Object.keys(studentsByGroup).length} групах`
                                    ) : (
                                        `Всього: ${students.length} студентів в ${Object.keys(studentsByGroup).length} групах`
                                    )}
                                </Text>
                            </div>
                        )}
                    </div>
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

                <div style={{ marginBottom: '16px' }}>
                    <Input
                        placeholder="Пошук студентів, груп або брендів..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        style={{ maxWidth: '400px' }}
                    />
                </div>

                {Object.keys(studentsByGroup).length === 0 ? (
                    <Empty description="Студентів не знайдено" />
                ) : (
                    <div>
                        {Object.entries(studentsByGroup).map(([groupName, groupStudents]) => (
                                        <Card
                                            key={groupName}
                                            title={
                                                <Space>
                                                    <TeamOutlined style={{ color: '#52c41a' }} />
                                                    <Text strong>{groupName}</Text>
                                                    <Text type="secondary">({groupStudents.length} студентів)</Text>
                                                </Space>
                                            }
                                            style={{ 
                                                marginBottom: '16px',
                                                border: '1px solid #e8e8e8',
                                                borderRadius: '6px'
                                            }}
                                            size="small"
                                            headStyle={{ 
                                                backgroundColor: '#fafafa',
                                                borderBottom: '1px solid #e8e8e8'
                                            }}
                                        >
                                            <Table
                                                columns={studentColumns}
                                                dataSource={groupStudents}
                                                rowKey="id"
                                                pagination={false}
                                                size="small"
                                                locale={{
                                                    emptyText: <Empty description="Студентів в групі не знайдено" />
                                                }}
                                            />
                                        </Card>
                        ))}
                    </div>
                )}

                <Modal
                    title={editingStudent ? 'Редагувати студента' : 'Додати нового студента'}
                    open={isModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    width={500}
                >
                    <Formik
                        initialValues={{
                            fullName: editingStudent?.fullName || '',
                            brandId: editingStudent?.group?.brand?.id || undefined,
                            groupId: editingStudent?.groupId || undefined,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleModalOk}
                    >
                        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
                            <Form>
                                <StudentForm
                                    values={values}
                                    setFieldValue={setFieldValue}
                                    errors={errors}
                                    touched={touched}
                                    isSubmitting={isSubmitting}
                                />
                                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                    <Space>
                                        <Button onClick={handleModalCancel}>
                                            Скасувати
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                            {editingStudent ? 'Оновити' : 'Додати'} студента
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

export default StudentManagementPage; 