import {changePassword} from "../../app/authApi.js";
import {extractErrorMessagesList, extractGenericErrorMessage, isValidationError} from "../../utils/apiErrorUtils.js";
import React from "react";
import { Formik, Field, ErrorMessage } from 'formik';
import { Form, Typography, Button, Input, message, Checkbox} from 'antd';
import {useMutation} from "@tanstack/react-query";
import * as Yup from 'yup';

const ChangePassword = () => {

    const { Title, Text} = Typography;

    // Validation schema for the password form
    const PasswordSchema = Yup.object().shape({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .max(32, "Password must be at most 32 characters")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,32}$/,
                "Must include upper, lower, number & special char"
            )
            .required("Password is required"),
    });

    const changePasswordMutation = useMutation({
        mutationFn: (formValues) => changePassword(formValues),
        onSuccess: () => {
            message.success("Password successfully changed!");
        },
        onError: (error) => {
            if (!isValidationError(error.response?.data)) {
                message.error(
                    extractGenericErrorMessage(error.response?.data) || "Change password failed"
                ).then();
            }
        },
    });

    return (
        <div style={{ maxWidth: 400 }}>
            <Title level={3}>Change password</Title>

            <Formik
                initialValues={{ currentPassword: '', newPassword: '', expireAllSessions: false }}
                validationSchema={PasswordSchema}
                onSubmit={(values, { setErrors, setStatus, resetForm }) => {
                    setStatus(null);
                    setErrors({});
                    changePasswordMutation.mutate(values, {
                        onSuccess: () => {
                            resetForm();
                        },
                        onError: (error) => {
                            const data = error.response?.data;
                            if (isValidationError(data)) {
                                const fieldErrors = extractErrorMessagesList(data);
                                setErrors(fieldErrors);
                            }
                            const generic = extractGenericErrorMessage(data);
                            if (generic) {
                                setStatus(generic);
                            }
                        },
                    });
                }}
            >
                {({
                      values,
                      touched,
                      errors,
                      handleChange,
                      handleSubmit,
                      handleBlur,
                      status
                  }) => (
                    <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Current Password"
                            validateStatus={
                                touched.currentPassword && errors.currentPassword ? "error" : ""
                            }
                            help={touched.currentPassword && errors.currentPassword}
                        >
                            <Input.Password
                                name="currentPassword"
                                value={values.currentPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </Form.Item>

                        <Form.Item
                            label="New Password"
                            validateStatus={
                                touched.newPassword && errors.newPassword ? "error" : ""
                            }
                            help={touched.newPassword && errors.newPassword}
                        >
                            <Input.Password
                                name="newPassword"
                                value={values.newPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </Form.Item>

                        <div style={{ marginBottom: 24 }}>
                            <Checkbox
                                name="expireAllSessions"
                                checked={values.expireAllSessions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            >
                                Expire other sessions
                            </Checkbox>
                        </div>

                        {status && (
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <Text type="danger" strong>
                                    {status}
                                </Text>
                            </div>
                        )}

                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={changePasswordMutation.status === "pending"}
                            loading={changePasswordMutation.status === "pending"}
                            block
                        >
                            Save Changes
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );

}

export default ChangePassword;