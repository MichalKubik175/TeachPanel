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
  Collapse,
} from 'antd';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import { useQuestionnaires } from '../../hooks/useQuestionnaires';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';
import { sessionsApi } from '../../services/sessionsApi';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const SessionSchema = Yup.object().shape({
  name: Yup.string().required('Введіть назву уроку'),
  questionnaireId: Yup.string(), // now optional
  groupIds: Yup.array().of(Yup.string()),
  studentIds: Yup.array().of(Yup.string()),
});

const SessionCreatePage = () => {
  const [submitting, setSubmitting] = useState(false);
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

  // Groups are now independent, so we can use them directly

  // All students for multi-select
  const allStudents = students;

  // Helper: get unique student IDs from selected groups (with individual selections) and selected students
  const getSelectedStudentIds = (groupIds, studentIds, groupStudentSelections) => {
    // Get students from selected groups (considering individual selections)
    const groupStudentIds = groupIds
      .flatMap(gid => {
        if (groupStudentSelections[gid]) {
          // Use individual selections for this group
          return groupStudentSelections[gid];
        } else {
          // Use all students from the group (default behavior)
          return groupIdToStudents[gid]?.map(s => s.id) || [];
        }
      });
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
      message.success('Урок створено успішно!');
      resetForm();
    } catch (err) {
      message.error(err.message || 'Не вдалося створити урок. Спробуйте ще раз.');
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
      <Title level={3}>Створити урок</Title>
      <Formik
        initialValues={{
          name: '',
          questionnaireId: '',
          groupIds: [],
          studentIds: [],
          groupStudentSelections: {}, // { groupId: [studentId1, studentId2, ...] }
          tableLayoutId: '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Введіть назву уроку'),
          questionnaireId: Yup.string(),
          groupIds: Yup.array().of(Yup.string()),
          studentIds: Yup.array().of(Yup.string()),
          tableLayoutId: Yup.string().required('Оберіть розклад столів'),
        })}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => {
          // Compute selected students
          const selectedStudentIds = getSelectedStudentIds(values.groupIds, values.studentIds, values.groupStudentSelections);

          return (
            <Form autoComplete="off">
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

              {/* Groups Selection with Student Lists */}
              <Divider orientation="left">Оберіть групи</Divider>
              {/* Debug: Show groups data */}
              <div style={{ padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '16px', fontSize: '12px' }}>
                <strong>Debug Info:</strong><br/>
                Groups count: {groups.length}<br/>
                Groups: {JSON.stringify(groups.map(g => ({ id: g.id, name: g.name })), null, 2)}<br/>
                Students count: {students.length}<br/>
                GroupIdToStudents: {JSON.stringify(Object.keys(groupIdToStudents).map(key => ({ 
                  groupId: key, 
                  studentCount: groupIdToStudents[key]?.length || 0 
                })), null, 2)}
              </div>
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
                  if (!student) return null;
                  const group = groups.find(g => g.id === student.groupId);
                  const brand = brands.find(b => b.id === student.brandId);
                  return (
                    <Col key={sid} span={12}>
                      <span>
                        {student.fullName} 
                        <span style={{ color: '#888' }}>
                          ({group?.name || '—'} - {brand?.name || 'Без бренду'})
                        </span>
                      </span>
                    </Col>
                  );
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
                aria-label="Створити урок"
              >
                Створити урок
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default SessionCreatePage; 