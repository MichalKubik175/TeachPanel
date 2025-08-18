import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Table, Typography, Spin, Empty, Button, Modal, Space, message, Popconfirm, Alert, Card } from 'antd';
import { TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Form as AntForm, Input } from 'antd';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents.js';

const { Content } = Layout;
const { Title, Text } = Typography;

const GroupsManagementPage = ({ onBack }) => {
    const userData = useSelector((state) => state.auth);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    const {
        groups,
        students,
        loading,
        error,
        createGroup,
        updateGroup,
        deleteGroup,
        setError
    } = useBrandsGroupsStudents();

    // Validation schema for group
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Назва групи обов\'язкова')
            .min(2, 'Назва повинна містити щонайменше 2 символи')
            .max(100, 'Назва повинна бути менше 100 символів'),
    });

    const handleAddGroup = () => {
        setEditingGroup(null);
        setIsModalVisible(true);
    };

    const handleEditGroup = (record) => {
        setEditingGroup(record);
        setIsModalVisible(true);
    };

    const handleDeleteGroup = async (group) => {
        try {
            await deleteGroup(group.id);
            messageApi.success('Групу успішно видалено');
        } catch (error) {
            messageApi.error('Не вдалося видалити групу');
        }
    };

    const handleModalOk = async (values, { setSubmitting, resetForm }) => {
        try {
            if (editingGroup) {
                // Edit existing group
                await updateGroup(editingGroup.id, { name: values.name });
                messageApi.success('Групу успішно оновлено');
            } else {
                // Add new group
                await createGroup({ name: values.name });
                messageApi.success('Групу успішно створено');
            }
            setSubmitting(false);
            resetForm();
            setIsModalVisible(false);
            setEditingGroup(null);
        } catch (error) {
            setSubmitting(false);
            messageApi.error('Не вдалося зберегти групу');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingGroup(null);
    };

    // Calculate students per group
    const getStudentsInGroup = (groupId) => {
        return students.filter(student => student.groupId === groupId);
    };

    const columns = [
        {
            title: 'Назва групи',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Space>
                    <TeamOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Кількість студентів',
            key: 'studentsCount',
            render: (_, record) => {
                const studentsInGroup = getStudentsInGroup(record.id);
                return (
                    <Space>
                        <UserOutlined style={{ color: '#1890ff' }} />
                        <Text>{studentsInGroup.length}</Text>
                    </Space>
                );
            },
            sorter: (a, b) => getStudentsInGroup(a.id).length - getStudentsInGroup(b.id).length,
        },
        {
            title: 'Дата створення',
            dataIndex: 'createdAtUtc',
            key: 'createdAtUtc',
            render: (text) => new Date(text).toLocaleDateString('uk-UA'),
            sorter: (a, b) => new Date(a.createdAtUtc) - new Date(b.createdAtUtc),
        },
        {
            title: 'Дії',
            key: 'actions',
            render: (_, record) => {
                const studentsInGroup = getStudentsInGroup(record.id);
                return (
                    <Space>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditGroup(record)}
                            size="small"
                        >
                            Редагувати
                        </Button>
                        <Popconfirm
                            title="Видалити групу?"
                            description={studentsInGroup.length > 0 
                                ? `У цій групі є ${studentsInGroup.length} студентів. Ви впевнені?`
                                : "Ви впевнені, що хочете видалити цю групу?"
                            }
                            onConfirm={() => handleDeleteGroup(record)}
                            okText="Так"
                            cancelText="Ні"
                            disabled={studentsInGroup.length > 0}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                disabled={studentsInGroup.length > 0}
                            >
                                Видалити
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const GroupForm = ({ values, errors, touched, isSubmitting }) => (
        <div>
            <AntForm.Item
                label="Назва групи"
                validateStatus={errors.name && touched.name ? 'error' : ''}
                help={errors.name && touched.name ? errors.name : ''}
            >
                <Field name="name">
                    {({ field }) => (
                        <Input
                            {...field}
                            placeholder="Введіть назву групи"
                            prefix={<TeamOutlined />}
                        />
                    )}
                </Field>
            </AntForm.Item>
        </div>
    );

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
                            Назад
                        </Button>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddGroup}
                                size="large"
                            >
                                Додати групу
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <Title level={2}>Керування групами</Title>
                        <Text type="secondary">
                            Створення та редагування груп для організації студентів
                        </Text>
                        {groups.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                    Всього груп: {groups.length}
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

                {groups.length === 0 ? (
                    <Empty 
                        description="Груп не знайдено"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleAddGroup}
                        >
                            Створити першу групу
                        </Button>
                    </Empty>
                ) : (
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={groups}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} з ${total} груп`,
                            }}
                            locale={{
                                emptyText: 'Групи не знайдено'
                            }}
                        />
                    </Card>
                )}

                <Modal
                    title={editingGroup ? 'Редагувати групу' : 'Створити групу'}
                    open={isModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    destroyOnClose
                >
                    <Formik
                        initialValues={{
                            name: editingGroup?.name || '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleModalOk}
                        enableReinitialize
                    >
                        {(formikProps) => (
                            <Form>
                                <GroupForm {...formikProps} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                    <Button onClick={handleModalCancel}>
                                        Скасувати
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={formikProps.isSubmitting}
                                    >
                                        {editingGroup ? 'Оновити' : 'Створити'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </Spin>
        </Content>
    );
};

export default GroupsManagementPage;

