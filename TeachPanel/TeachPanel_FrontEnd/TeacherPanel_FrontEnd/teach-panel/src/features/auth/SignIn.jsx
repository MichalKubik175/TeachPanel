import React from "react";
import { Formik, Form as FormikForm } from "formik";
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
import { useDispatch } from "react-redux";
import { setUser } from "./authSlice";
import {fetchCurrentUser, signIn} from "../../app/authApi.js";
import { useNavigate } from "react-router-dom";
import {
    extractErrorMessage,
    extractErrorMessagesList,
    extractGenericErrorMessage,
    isValidationError
} from "../../utils/apiErrorUtils.js"
import {saveTokens} from "../auth/tokenExpiry.js"

const { Title } = Typography;

const SignInPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    document.title = "Sign In - SecretHub";

    const signInMutation = useMutation({
        mutationFn: (formValues) => {
            const request = { ...formValues, authType: "AccessTokenWithRefreshToken" };
            return signIn(request);
        },
        onSuccess: async (response) => {
            saveTokens(response.data.accessToken.token, response.data.refreshToken.token, response.data.accessToken.expiresAtUtc);
            const userDataResponse = await fetchCurrentUser();
            dispatch(setUser(userDataResponse.data));
            message.success("Login successful!").then();
            navigate("/home");
        },
        onError: (error) => {
            if (!isValidationError(error.response?.data)){
                message.error(extractErrorMessage(error.response?.data) || "Login failed").then();
            }
        },
    });

    const validationSchema = Yup.object({
        username: Yup.string()
            .test(
                'emptyOrWhitespace',
                'Username cannot be empty or whitespace',
                (value) => value && value.trim().length > 0
            )
            .required("Required"),
        password: Yup.string()
            .test(
                'emptyOrWhitespace',
                'Password cannot be empty or whitespace',
                (value) => value && value.trim().length > 0
            )
            .required("Required"),
    });

    return (
        <Flex
            align="center"
            justify="center"
            style={{ height: "100vh", backgroundColor: "#f5f5f5" }}
        >
            <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <Title level={3} style={{ textAlign: "center" }}>
                    Sign In
                </Title>

                <Formik
                    initialValues={{ username: "", password: "" }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setErrors, setStatus }) => {
                        setStatus(null);
                        setErrors({});

                        signInMutation.mutate(values, {
                            onError: (error) => {
                                const genericError = extractGenericErrorMessage(error.response?.data);
                                if (genericError) {
                                    setStatus(genericError);
                                }

                                const validationErrors = extractErrorMessagesList(error.response?.data);
                                setErrors(validationErrors);
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
                          status,
                      }) => (
                        <FormikForm>
                            <Form.Item
                                validateStatus={
                                    touched.username && errors.username ? "error" : ""
                                }
                                help={
                                    touched.username && errors.username
                                        ? errors.username
                                        : null
                                }
                            >
                                <Input
                                    name="username"
                                    placeholder="Username"
                                    value={values.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>

                            <Form.Item
                                validateStatus={
                                    touched.password && errors.password ? "error" : ""
                                }
                                help={
                                    touched.password && errors.password
                                        ? errors.password
                                        : null
                                }
                            >
                                <Input.Password
                                    name="password"
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>

                            {status && (
                                <div style={{ color: "red", marginBottom: 16, textAlign: "center" }}>
                                    {status}
                                </div>
                            )}

                            <Button
                                style={{ marginTop: 16 }}
                                type="primary"
                                htmlType="submit"
                                block
                                loading={signInMutation.status === "pending"}
                                disabled={signInMutation.status === "pending"}
                            >
                                Sign In
                            </Button>

{/*                            <div style={{ marginTop: 24, textAlign: "center" }}>
                                <Typography.Text>
                                    Don’t have an account yet?{" "}
                                    <Typography.Link onClick={() => navigate("/sign-up")}>
                                        Sign up
                                    </Typography.Link>
                                </Typography.Text>
                            </div>*/}
                        </FormikForm>
                    )}
                </Formik>
            </Card>
        </Flex>
    );
};

export default SignInPage;
