import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { 
    Card, 
    Input, 
    Button, 
    Typography, 
    message, 
    Row, 
    Col, 
    Space, 
    Divider 
} from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    ArrowLeftOutlined,
    SaveOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';
import TableLayoutPreview from './TableLayoutPreview';

const { Title } = Typography;

const TableLayoutSchema = Yup.object().shape({
  name: Yup.string().required('Введіть назву розкладки'),
  rows: Yup.array()
    .of(
      Yup.object().shape({
        table_count: Yup.number()
          .min(1, 'Має бути хоча б 1 стіл')
          .required('Вкажіть кількість столів'),
      })
    )
    .min(1, 'Додайте хоча б один рядок'),
});

const TableLayoutEditPage = ({ layout, onBack }) => {
    const [submitting, setSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Convert layout data to form format
    const initialValues = {
        name: layout?.name || '',
        rows: layout?.rows?.map(row => ({
            table_count: row.tablesCount || 1
        })) || [{ table_count: 1 }],
    };

    const handleSubmit = async (values, { resetForm }) => {
        setSubmitting(true);
        try {
            const payload = {
                name: values.name,
                rows: values.rows.map((row, idx) => ({
                    RowNumber: idx + 1,
                    TablesCount: row.table_count,
                })),
            };
            
            await tableLayoutsApi.updateTableLayout(layout.id, payload);
            message.success('Розкладку оновлено успішно!');
            onBack?.();
        } catch (err) {
            console.error('Error updating table layout:', err);
            message.error(err.message || 'Не вдалося оновити розкладку. Спробуйте ще раз.');
        } finally {
            setSubmitting(false);
        }
    };

    // Convert form data to preview format
    const getPreviewData = (values) => ({
        id: layout?.id,
        name: values.name,
        rows: values.rows.map((row, index) => ({
            rowNumber: index + 1,
            tablesCount: parseInt(row.table_count) || 0
        }))
    });

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    size="large"
                    style={{ marginBottom: '16px' }}
                >
                    Назад до списку розкладок
                </Button>
                <Title level={2}>Редагування розкладки столів</Title>
            </div>

            <Row gutter={24}>
                <Col xs={24} lg={showPreview ? 12 : 24}>
                    <Card 
                        title="Параметри розкладки"
                        extra={
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                {showPreview ? 'Приховати' : 'Показати'} перегляд
                            </Button>
                        }
                    >
                        <Formik
                            initialValues={initialValues}
                            validationSchema={TableLayoutSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, errors, touched, setFieldValue }) => (
                                <Form autoComplete="off">
                                    <Row gutter={16} align="middle">
                                        <Col span={24}>
                                            <Field name="name">
                                                {({ field }) => (
                                                    <Input 
                                                        {...field} 
                                                        placeholder="Назва розкладки" 
                                                        size="large"
                                                    />
                                                )}
                                            </Field>
                                            {touched.name && errors.name && (
                                                <div style={{ color: 'red', marginTop: '4px' }}>
                                                    {errors.name}
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                    
                                    <Divider>Ряди столів</Divider>
                                    
                                    <FieldArray name="rows">
                                        {({ push, remove }) => (
                                            <>
                                                {values.rows.map((row, idx) => (
                                                    <Row 
                                                        gutter={8} 
                                                        align="middle" 
                                                        key={idx} 
                                                        style={{ marginBottom: 12 }}
                                                    >
                                                        <Col span={4}>
                                                            <strong>Ряд {idx + 1}</strong>
                                                        </Col>
                                                        <Col span={16}>
                                                            <Field name={`rows[${idx}].table_count`}>
                                                                {({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        type="number"
                                                                        min={1}
                                                                        placeholder="Кількість столів"
                                                                        size="large"
                                                                    />
                                                                )}
                                                            </Field>
                                                            {touched.rows && 
                                                             touched.rows[idx] && 
                                                             errors.rows && 
                                                             errors.rows[idx] && 
                                                             errors.rows[idx].table_count && (
                                                                <div style={{ color: 'red', marginTop: '4px' }}>
                                                                    {errors.rows[idx].table_count}
                                                                </div>
                                                            )}
                                                        </Col>
                                                        <Col span={4}>
                                                            <Button
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => remove(idx)}
                                                                disabled={values.rows.length === 1}
                                                                danger
                                                                size="large"
                                                                title="Видалити ряд"
                                                            />
                                                        </Col>
                                                    </Row>
                                                ))}
                                                
                                                <Button
                                                    type="dashed"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => push({ table_count: 1 })}
                                                    block
                                                    size="large"
                                                    style={{ marginTop: 12, marginBottom: 16 }}
                                                >
                                                    Додати ряд
                                                </Button>
                                                
                                                {typeof errors.rows === 'string' && (
                                                    <div style={{ color: 'red', marginTop: 8 }}>
                                                        {errors.rows}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </FieldArray>
                                    
                                    <Divider />
                                    
                                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                                        <Button
                                            onClick={onBack}
                                            size="large"
                                        >
                                            Скасувати
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={submitting}
                                            size="large"
                                            icon={<SaveOutlined />}
                                        >
                                            Зберегти зміни
                                        </Button>
                                    </Space>
                                </Form>
                            )}
                        </Formik>
                    </Card>
                </Col>
                
                {showPreview && (
                    <Col xs={24} lg={12}>
                        <Card title="Попередній перегляд" style={{ position: 'sticky', top: '24px' }}>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={TableLayoutSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ values }) => (
                                    <TableLayoutPreview 
                                        layout={getPreviewData(values)} 
                                        compact={false}
                                    />
                                )}
                            </Formik>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default TableLayoutEditPage;

