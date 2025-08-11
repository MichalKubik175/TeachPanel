import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Flex,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "../../app/authApi.js";
import { useNavigate } from "react-router-dom";
import {
    extractErrorMessagesList,
    extractGenericErrorMessage,
    isValidationError,
} from "../../utils/apiErrorUtils.js";

const { Title, Text, Link } = Typography;

const SignUpPage = () => {
    const navigate = useNavigate();

    document.title = "Sign Up - SecretHub";

    const signUpMutation = useMutation({
        mutationFn: (formValues) => signUp(formValues),
        onSuccess: () => {
            message.success("Account successfully created!");
            navigate("/sign-in");
        },
        onError: (error) => {
            if (!isValidationError(error.response?.data)) {
                message.error(
                    extractGenericErrorMessage(error.response?.data) || "Sign up failed"
                );
            }
        },
    });

    const validationSchema = Yup.object({
        fullName: Yup.string()
            .min(1, "Full name is required")
            .max(100, "Full name must be at most 100 characters")
            .matches(/^\S.*\S$/, "No leading or trailing spaces allowed")
            .matches(/^\S+(\s\S+)*$/, "No leading or trailing spaces allowed")
            .required("Full name is required"),
        username: Yup.string()
            .min(1, "Username is required")
            .max(50, "Username must be at most 50 characters")
            .matches(/^\S+$/, "No spaces allowed")
            .required("Username is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .max(32, "Password must be at most 32 characters")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,32}$/,
                "Must include upper, lower, number & special char"
            )
            .required("Password is required"),
    });

    return (
        <Flex
            align="center"
            justify="center"
            style={{ height: "100vh", backgroundColor: "#f5f5f5" }}
        >
            <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <Title level={3} style={{ textAlign: "center" }}>
                    Sign Up
                </Title>

                <Formik
                    initialValues={{ fullName: "", username: "", password: "" }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setErrors, setStatus }) => {
                        setStatus(null);
                        setErrors({});
                        signUpMutation.mutate(values, {
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
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          status,
                      }) => (
                        <Form
                            layout="vertical"
                            onFinish={handleSubmit}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Full Name"
                                validateStatus={
                                    touched.fullName && errors.fullName ? "error" : ""
                                }
                                help={touched.fullName && errors.fullName}
                            >
                                <Input
                                    name="fullName"
                                    value={values.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Username"
                                validateStatus={
                                    touched.username && errors.username ? "error" : ""
                                }
                                help={touched.username && errors.username}
                            >
                                <Input
                                    name="username"
                                    value={values.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                validateStatus={
                                    touched.password && errors.password ? "error" : ""
                                }
                                help={touched.password && errors.password}
                            >
                                <Input.Password
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>

                            {status && (
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <Text type="danger" strong>
                                        {status}
                                    </Text>
                                </div>
                            )}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={signUpMutation.status === "pending"}
                                    disabled={signUpMutation.status === "pending"}
                                >
                                    Sign Up
                                </Button>
                            </Form.Item>

                            <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
                                <Text>
                                    Already have an account?{" "}
                                    <Link onClick={() => navigate("/sign-in")}>
                                        Sign in
                                    </Link>
                                </Text>
                            </Form.Item>
                        </Form>
                    )}
                </Formik>
            </Card>
        </Flex>
    );
};

export default SignUpPage;
