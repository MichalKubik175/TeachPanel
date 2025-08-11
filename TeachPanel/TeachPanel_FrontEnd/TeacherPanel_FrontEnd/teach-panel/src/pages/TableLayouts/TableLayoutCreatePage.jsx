import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Card, Input, Button, Typography, message, Row, Col, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';

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

const initialValues = {
  name: '',
  rows: [
    { table_count: 1 },
  ],
};

const TableLayoutCreatePage = () => {
  const [submitting, setSubmitting] = useState(false);

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
      await tableLayoutsApi.createTableLayout(payload);
      message.success('Розкладку створено успішно!');
      resetForm();
    } catch (err) {
      message.error(err.message || 'Не вдалося створити розкладку. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: '0 auto', marginTop: 24 }}>
      <Title level={3}>Створити розкладку столів</Title>
      <Formik
        initialValues={initialValues}
        validationSchema={TableLayoutSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form autoComplete="off">
            <Row gutter={16} align="middle">
              <Col span={24}>
                <Field name="name">
                  {({ field }) => (
                    <Input {...field} placeholder="Назва розкладки" />
                  )}
                </Field>
                {touched.name && errors.name && (
                  <div style={{ color: 'red' }}>{errors.name}</div>
                )}
              </Col>
            </Row>
            <Divider>Ряди</Divider>
            <FieldArray name="rows">
              {({ push, remove }) => (
                <>
                  {values.rows.map((row, idx) => (
                    <Row gutter={8} align="middle" key={idx} style={{ marginBottom: 8 }}>
                      <Col span={4}>
                        <b>Ряд {idx + 1}</b>
                      </Col>
                      <Col span={16}>
                        <Field name={`rows[${idx}].table_count`}>
                          {({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              placeholder="Кількість столів"
                            />
                          )}
                        </Field>
                        {touched.rows && touched.rows[idx] && errors.rows && errors.rows[idx] && errors.rows[idx].table_count && (
                          <div style={{ color: 'red' }}>{errors.rows[idx].table_count}</div>
                        )}
                      </Col>
                      <Col span={4}>
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => remove(idx)}
                          disabled={values.rows.length === 1}
                          danger
                          aria-label="Видалити ряд"
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => push({ table_count: 1 })}
                    block
                    style={{ marginTop: 8 }}
                  >
                    Додати ряд
                  </Button>
                  {typeof errors.rows === 'string' && (
                    <div style={{ color: 'red', marginTop: 8 }}>{errors.rows}</div>
                  )}
                </>
              )}
            </FieldArray>
            <Divider />
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              block
              aria-label="Створити розкладку"
            >
              Створити розкладку
            </Button>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default TableLayoutCreatePage; 