import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Table, Typography, Spin, Empty, Button, Modal, Space, message, Popconfirm, Alert, Collapse, Card } from 'antd';
import { BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, TeamOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Form as AntForm, Input, Select } from 'antd';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents.js';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const BrandsManagementPage = ({ onBack, onSwitchToStudents }) => {
    const userData = useSelector((state) => state.auth);
    const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
    const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [selectedBrandForGroup, setSelectedBrandForGroup] = useState(null);
    const [editingGroup, setEditingGroup] = useState(null);
    const [editingGroupBrand, setEditingGroupBrand] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();

    const {
        brands,
        groups,
        students,
        loading,
        error,
        createBrand,
        updateBrand,
        deleteBrand,
        createGroup,
        updateGroup,
        deleteGroup,
        getStudentsByBrand,
        setError
    } = useBrandsGroupsStudents();

    // Validation schema for brand
    const brandValidationSchema = Yup.object({
        name: Yup.string()
            .required('Назва бренду обов\'язкова')
            .min(2, 'Назва повинна містити щонайменше 2 символи')
            .max(100, 'Назва повинна бути менше 100 символів'),
    });

    // Validation schema for group
    const groupValidationSchema = Yup.object({
        groupName: Yup.string()
            .required('Назва групи обов\'язкова')
            .min(2, 'Назва повинна містити щонайменше 2 символи')
            .max(100, 'Назва повинна бути менше 100 символів'),
    });

    const handleAddBrand = () => {
        setEditingBrand(null);
        setIsBrandModalVisible(true);
    };



    const handleEditBrand = (record) => {
        setEditingBrand(record);
        setIsBrandModalVisible(true);
    };

    const handleDeleteBrand = async (brand) => {
        try {
            await deleteBrand(brand.id);
            messageApi.success('Бренд успішно видалено');
        } catch (error) {
            messageApi.error('Не вдалося видалити бренд');
        }
    };



    const handleBrandModalOk = async (values, { setSubmitting, resetForm }) => {
        try {
            if (editingBrand) {
                // Edit existing brand
                await updateBrand(editingBrand.id, values);
                messageApi.success('Бренд успішно оновлено');
            } else {
                await createBrand(values);
                messageApi.success('Бренд успішно додано');
            }
            setSubmitting(false);
            resetForm();
            setIsBrandModalVisible(false);
        } catch (error) {
            setSubmitting(false);
            messageApi.error('Не вдалося зберегти бренд');
        }
    };

    const handleGroupModalOk = async (values, { setSubmitting, resetForm }) => {
        try {
            if (editingGroup) {
                // Edit existing group
                await updateGroup(editingGroup.id, { name: values.groupName });
                messageApi.success('Групу успішно оновлено');
            } else {
                await createGroup({ name: values.groupName });
                messageApi.success('Групу успішно створено');
            }
            setSubmitting(false);
            resetForm();
            setIsGroupModalVisible(false);
            setEditingGroup(null);
            setEditingGroupBrand(null);
        } catch (error) {
            setSubmitting(false);
            messageApi.error('Не вдалося зберегти групу');
        }
    };

    const handleBrandModalCancel = () => {
        setIsBrandModalVisible(false);
        setEditingBrand(null);
    };

    const handleGroupModalCancel = () => {
        setIsGroupModalVisible(false);
        setSelectedBrandForGroup(null);
        setEditingGroup(null);
        setEditingGroupBrand(null);
    };

    const BrandForm = ({ values, errors, touched, isSubmitting }) => (
        <div>
            <AntForm.Item
                label="Назва бренду"
                validateStatus={errors.name && touched.name ? 'error' : ''}
                help={errors.name && touched.name ? errors.name : ''}
            >
                <Field name="name">
                    {({ field }) => (
                        <Input
                            {...field}
                            placeholder="Введіть назву бренду"
                            prefix={<BookOutlined />}
                        />
                    )}
                </Field>
            </AntForm.Item>
        </div>
    );

    const GroupForm = ({ values, errors, touched, isSubmitting }) => (
        <div>
            <AntForm.Item
                label="Назва групи"
                validateStatus={errors.groupName && touched.groupName ? 'error' : ''}
                help={errors.groupName && touched.groupName ? errors.groupName : ''}
            >
                <Field name="groupName">
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
                            Назад до огляду
                        </Button>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddBrand}
                                size="large"
                            >
                                Додати бренд
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <Title level={2}>Керування брендами та групами</Title>
                        <Text type="secondary">
                            Додавання, редагування брендів та груп
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

                {brands.length === 0 ? (
                    <Empty description="Бренди не знайдено" />
                ) : (
                    <Collapse defaultActiveKey={brands.map(b => b.id)}>
                        {brands.map((brand) => {
                            // With the new structure, students have brandId directly
                            const studentsInBrand = students.filter(student => 
                                student.brandId === brand.id
                            );

                            return (
                                <Collapse.Panel
                                    key={brand.id}
                                    header={
                                        <Space>
                                            <BookOutlined style={{ color: '#1890ff' }} />
                                            <Text strong>{brand.name}</Text>
                                            <Text type="secondary">
                                                ({studentsInBrand.length} студентів)
                                            </Text>
                                        </Space>
                                    }
                                    extra={
                                        <Space>
                                            <Button
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditBrand(brand);
                                                }}
                                                size="small"
                                            >
                                                Редагувати
                                            </Button>
                                            <Popconfirm
                                                title="Видалити бренд?"
                                                description="Ви впевнені, що хочете видалити цей бренд?"
                                                onConfirm={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBrand(brand);
                                                }}
                                                okText="Так"
                                                cancelText="Ні"
                                                onCancel={e => e.stopPropagation()}
                                                disabled={studentsInBrand.length > 0}
                                            >
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    size="small"
                                                    disabled={studentsInBrand.length > 0}
                                                >
                                                    Видалити
                                                </Button>
                                            </Popconfirm>
                                        </Space>
                                    }
                                >
                                    {studentsInBrand.length === 0 ? (
                                        <Empty description="Студентів у цьому бренді не знайдено" />
                                    ) : (
                                        <div>
                                            {/* Group students by their groups */}
                                            {(() => {
                                                const studentsByGroup = {};
                                                studentsInBrand.forEach(student => {
                                                    const group = groups.find(g => g.id === student.groupId);
                                                    const groupName = group?.name || 'Невідома група';
                                                    if (!studentsByGroup[groupName]) {
                                                        studentsByGroup[groupName] = [];
                                                    }
                                                    studentsByGroup[groupName].push(student);
                                                });
                                                
                                                return Object.entries(studentsByGroup).map(([groupName, groupStudents]) => (
                                                    <Card
                                                        key={groupName}
                                                        title={
                                                            <Space>
                                                                <TeamOutlined style={{ color: '#52c41a' }} />
                                                                <Text strong>{groupName}</Text>
                                                                <Text type="secondary">({groupStudents.length} студентів)</Text>
                                                            </Space>
                                                        }
                                                        style={{ marginBottom: '16px' }}
                                                        size="small"
                                                    >
                                                        {groupStudents.length > 0 ? (
                                                            <div>
                                                                <Text type="secondary">Студенти в групі:</Text>
                                                                <ul style={{ marginTop: '8px' }}>
                                                                    {groupStudents.map(student => (
                                                                        <li key={student.id}>
                                                                            <Text>{student.fullName}</Text>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : (
                                                            <Text type="secondary">В групі немає студентів</Text>
                                                        )}
                                                    </Card>
                                                ));
                                            })()}
                                        </div>
                                    )}
                                </Collapse.Panel>
                            );
                        })}
                    </Collapse>
                )}

                {/* Brand Modal */}
                <Modal
                    title={editingBrand ? 'Редагувати бренд' : 'Додати новий бренд'}
                    open={isBrandModalVisible}
                    onCancel={handleBrandModalCancel}
                    footer={null}
                    width={500}
                >
                    <Formik
                        initialValues={{
                            name: editingBrand?.name || '',
                        }}
                        validationSchema={brandValidationSchema}
                        onSubmit={handleBrandModalOk}
                    >
                        {({ values, errors, touched, isSubmitting }) => (
                            <Form>
                                <BrandForm
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    isSubmitting={isSubmitting}
                                />
                                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                    <Space>
                                        <Button onClick={handleBrandModalCancel}>
                                            Скасувати
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                            {editingBrand ? 'Оновити' : 'Додати'} бренд
                                        </Button>
                                    </Space>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                {/* Group Modal */}
                <Modal
                    title={editingGroup ? `Редагувати групу${editingGroupBrand ? ` (${editingGroupBrand.name})` : ''}` : `Додати групу до бренду "${selectedBrandForGroup?.name}"`}
                    open={isGroupModalVisible}
                    onCancel={handleGroupModalCancel}
                    footer={null}
                    width={500}
                >
                    <Formik
                        initialValues={{
                            groupName: editingGroup?.name || '',
                        }}
                        validationSchema={groupValidationSchema}
                        onSubmit={handleGroupModalOk}
                        enableReinitialize
                    >
                        {({ values, errors, touched, isSubmitting }) => (
                            <Form>
                                <GroupForm
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    isSubmitting={isSubmitting}
                                />
                                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                    <Space>
                                        <Button onClick={handleGroupModalCancel}>
                                            Скасувати
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                            {editingGroup ? 'Оновити' : 'Додати'} групу
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

export default BrandsManagementPage; 