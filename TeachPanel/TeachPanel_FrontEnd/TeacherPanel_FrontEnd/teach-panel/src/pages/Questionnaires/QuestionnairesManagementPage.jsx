import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Table, Typography, Spin, Empty, Button, Modal, Space, message, Popconfirm, Alert, Card, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, QuestionCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Form as AntForm, Input } from 'antd';
import { useQuestionnaires } from '../../hooks/useQuestionnaires';

const { Content } = Layout;
const { Title, Text } = Typography;

const QuestionnairesManagementPage = () => {
    const userData = useSelector((state) => state.auth);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingQuestionnaire, setEditingQuestionnaire] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [questions, setQuestions] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const {
        questionnaires,
        loading,
        error,
        pagination,
        fetchQuestionnaires,
        createQuestionnaire,
        updateQuestionnaire,
        deleteQuestionnaire,
        setError
    } = useQuestionnaires();

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Назва опитування обов\'язкова')
            .min(2, 'Назва повинна містити щонайменше 2 символи')
            .max(200, 'Назва повинна бути менше 200 символів'),
    });

    const handleAddQuestionnaire = () => {
        setEditingQuestionnaire(null);
        setQuestions([]);
        setIsModalVisible(true);
    };

    const handleEditQuestionnaire = (record) => {
        setEditingQuestionnaire(record);
        setQuestions(record.questions || []);
        setIsModalVisible(true);
    };

    const handleDeleteQuestionnaire = async (questionnaireId) => {
        try {
            await deleteQuestionnaire(questionnaireId);
            messageApi.success('Опитування успішно видалено');
            // Refresh current page
            fetchQuestionnaires(pagination.currentPage, pagination.pageSize);
        } catch (error) {
            messageApi.error('Не вдалося видалити опитування');
        }
    };

    const handleModalOk = async (values, { setSubmitting, resetForm }) => {
        try {
            // Transform the data to match backend API structure
            const questionnaireData = {
                name: values.name,
                questions: (values.questions || []).filter(q => q.name?.trim() && q.answer?.trim()) // Only include questions with both name and answer
            };
            
            console.log('Sending questionnaire data:', questionnaireData);
            
            if (editingQuestionnaire) {
                // Edit existing questionnaire
                await updateQuestionnaire(editingQuestionnaire.id, questionnaireData);
                messageApi.success('Опитування успішно оновлено');
            } else {
                // Add new questionnaire
                await createQuestionnaire(questionnaireData);
                messageApi.success('Опитування успішно додано');
            }
            
            setSubmitting(false);
            resetForm();
            setIsModalVisible(false);
            setQuestions([]);
            
            // Refresh current page
            fetchQuestionnaires(pagination.currentPage, pagination.pageSize);
        } catch (error) {
            console.error('Error saving questionnaire:', error);
            setSubmitting(false);
            messageApi.error('Не вдалося зберегти опитування');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingQuestionnaire(null);
        setQuestions([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };



    const toggleExpandedRow = (questionnaireId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(questionnaireId)) {
            newExpandedRows.delete(questionnaireId);
        } else {
            newExpandedRows.add(questionnaireId);
        }
        setExpandedRows(newExpandedRows);
    };

    const columns = [
        {
            title: 'Назва опитування',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Створено (Локальний час)',
            dataIndex: 'createdAtLocal',
            key: 'createdAtLocal',
            render: (date) => (
                <Text>{formatDate(date)}</Text>
            ),
            sorter: (a, b) => new Date(a.createdAtLocal) - new Date(b.createdAtLocal),
        },
        {
            title: 'Створено (UTC)',
            dataIndex: 'createdAtUtc',
            key: 'createdAtUtc',
            render: (date) => (
                <Text>{formatDate(date)}</Text>
            ),
            sorter: (a, b) => new Date(a.createdAtUtc) - new Date(b.createdAtUtc),
        },
        {
            title: 'Оновлено (UTC)',
            dataIndex: 'updatedAtUtc',
            key: 'updatedAtUtc',
            render: (date) => (
                <Text>{date ? formatDate(date) : 'Ніколи'}</Text>
            ),
            sorter: (a, b) => {
                if (!a.updatedAtUtc && !b.updatedAtUtc) return 0;
                if (!a.updatedAtUtc) return 1;
                if (!b.updatedAtUtc) return -1;
                return new Date(a.updatedAtUtc) - new Date(b.updatedAtUtc);
            },
        },
        {
            title: 'Дії',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditQuestionnaire(record)}
                        size="small"
                    >
                        Редагувати
                    </Button>
                    <Popconfirm
                        title="Видалити опитування"
                        description="Ви впевнені, що хочете видалити це опитування?"
                        onConfirm={() => handleDeleteQuestionnaire(record.id)}
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

    const QuestionnaireForm = ({ values, errors, touched, isSubmitting, setFieldValue }) => (
        <div>
            <AntForm.Item
                label="Назва опитування"
                validateStatus={errors.name && touched.name ? 'error' : ''}
                help={errors.name && touched.name ? errors.name : ''}
            >
                <Field name="name">
                    {({ field }) => (
                        <Input
                            {...field}
                            placeholder="Введіть назву опитування"
                            prefix={<FileTextOutlined />}
                        />
                    )}
                </Field>
            </AntForm.Item>

            <Divider orientation="left">Питання</Divider>

            <FieldArray name="questions">
                {({ push, remove }) => (
                    <div>
                        {values.questions && values.questions.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                {values.questions.map((question, index) => (
                                    <Card
                                        key={index}
                                        size="small"
                                        style={{ marginBottom: '8px' }}
                                        title={
                                            <Space>
                                                <QuestionCircleOutlined />
                                                <Text strong>Питання {index + 1}</Text>
                                            </Space>
                                        }
                                        extra={
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(index)}
                                            >
                                                Видалити
                                            </Button>
                                        }
                                    >
                                        <div style={{ marginBottom: '8px' }}>
                                            <Text strong>Питання:</Text>
                                            <Field name={`questions.${index}.name`}>
                                                {({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Введіть питання"
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                        <div>
                                            <Text strong>Відповідь:</Text>
                                            <Field name={`questions.${index}.answer`}>
                                                {({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Введіть відповідь"
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => push({ name: '', answer: '' })}
                            style={{ width: '100%', marginBottom: '16px' }}
                        >
                            Додати питання
                        </Button>
                    </div>
                )}
            </FieldArray>
        </div>
    );

    return (
        <Content style={{ padding: '24px' }}>
            {contextHolder}
            <Spin spinning={userData.status === 'loading' || loading} delay={500}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div></div>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestionnaire}
                                size="large"
                            >
                                Додати опитування
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <Title level={2}>Керування опитуваннями</Title>
                        <Text type="secondary">
                            Додати, редагувати або видалити опитування
                        </Text>
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

                <Table
                    columns={columns}
                    dataSource={questionnaires}
                    rowKey="id"
                    expandable={{
                        expandedRowKeys: Array.from(expandedRows),
                        onExpand: (expanded, record) => {
                            if (expanded) {
                                setExpandedRows(prev => new Set([...prev, record.id]));
                            } else {
                                setExpandedRows(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(record.id);
                                    return newSet;
                                });
                            }
                        },
                        expandedRowRender: (record) => {
                            const questions = record.questions || [];
                            if (questions.length === 0) {
                                return <div style={{ padding: '16px', color: '#999' }}>Немає питань</div>;
                            }
                            
                            return (
                                <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
                                    <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                                        Питання ({questions.length}):
                                    </Text>
                                    {questions.map((question, index) => (
                                        <div key={index} style={{ 
                                            padding: '8px 12px', 
                                            marginBottom: '8px', 
                                            backgroundColor: 'white',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '4px'
                                        }}>
                                            <div style={{ marginBottom: '4px' }}>
                                                <Text strong>Питання {index + 1}:</Text> {question.name}
                                            </div>
                                            <div>
                                                <Text type="secondary">Відповідь:</Text> {question.answer}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        },
                    }}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: pagination.totalItems,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} з ${total} опитувань`,
                        onChange: (page, pageSize) => {
                            fetchQuestionnaires(page, pageSize);
                        }
                    }}
                    locale={{
                        emptyText: <Empty description="Опитування не знайдено" />
                    }}
                />

                <Modal
                    title={editingQuestionnaire ? 'Редагувати опитування' : 'Додати нове опитування'}
                    open={isModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    width={700}
                >
                    <Formik
                        initialValues={{
                            name: editingQuestionnaire?.name || '',
                            questions: questions.length > 0 ? questions : []
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleModalOk}
                        enableReinitialize={true}
                    >
                        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                            <Form>
                                <QuestionnaireForm
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    isSubmitting={isSubmitting}
                                    setFieldValue={setFieldValue}
                                />
                                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                    <Space>
                                        <Button onClick={handleModalCancel}>
                                            Скасувати
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                            {editingQuestionnaire ? 'Оновити' : 'Додати'} опитування
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

export default QuestionnairesManagementPage;
export { QuestionnairesManagementPage }; 