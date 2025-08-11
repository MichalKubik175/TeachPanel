import React, { useMemo, useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Input,
  Button,
  Select,
  Checkbox,
  Divider,
  Typography,
  Spin,
  message,
  Empty,
  Row,
  Col,
  Card,
  Form as AntForm,
} from 'antd';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import { useQuestionnaires } from '../../hooks/useQuestionnaires';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';
import { sessionsApi } from '../../services/sessionsApi';

const { Title } = Typography;
const { Option } = Select;

const SessionSchema = Yup.object().shape({
  name: Yup.string().required('Введіть назву сесії'),
  questionnaireId: Yup.string(), // now optional
  groupIds: Yup.array().of(Yup.string()),
  studentIds: Yup.array().of(Yup.string()),
});

const SessionCreatePage = () => {
  const [submitting, setSubmitting] = useState(false);
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
    const groupStudentIds = groupIds
      .flatMap(gid => groupIdToStudents[gid]?.map(s => s.id) || []);
    return Array.from(new Set([...groupStudentIds, ...studentIds]));
  };

  // Submit handler
  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      if (!user) throw new Error('Користувач не авторизований');
      if (!values.tableLayoutId) throw new Error('Оберіть розклад столів');
      // Determine session state
      const state = values.questionnaireId ? 1 : 2; // 1 = Homework, 2 = Regular
      const payload = {
        name: values.name,
        state,
        userId: user.id,
        questionnaireId: values.questionnaireId || null,
        tableLayoutId: values.tableLayoutId,
        commentaryId: null, // Add commentaryId if needed
      };
      await sessionsApi.createSession(payload);
      message.success('Сесію створено успішно!');
      resetForm();
    } catch (err) {
      message.error(err.message || 'Не вдалося створити сесію. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBGS || loadingQ || loadingTableLayouts) {
    return <Spin style={{ width: '100%', marginTop: 48 }} />;
  }
  if (errorBGS || errorQ || errorTableLayouts) {
    return <Empty description={errorBGS || errorQ || errorTableLayouts} />;
  }

  return (
    <Card style={{ maxWidth: 700, margin: '0 auto', marginTop: 24 }}>
      <Title level={3}>Створити сесію</Title>
      <Formik
        initialValues={{
          name: '',
          questionnaireId: '',
          groupIds: [],
          studentIds: [],
          tableLayoutId: '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Введіть назву сесії'),
          questionnaireId: Yup.string(),
          groupIds: Yup.array().of(Yup.string()),
          studentIds: Yup.array().of(Yup.string()),
          tableLayoutId: Yup.string().required('Оберіть розклад столів'),
        })}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => {
          // Compute selected students
          const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds);

          return (
            <Form autoComplete="off">
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
                    >
                      {questionnaires.map(q => (
                        <Option key={q.id} value={q.id}>{q.name}</Option>
                      ))}
                    </Select>
                  )}
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

              <Divider />
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={submitting}
                size="large"
                block
                disabled={selectedStudentIds.length === 0}
                aria-label="Створити сесію"
              >
                Створити сесію
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default SessionCreatePage; 