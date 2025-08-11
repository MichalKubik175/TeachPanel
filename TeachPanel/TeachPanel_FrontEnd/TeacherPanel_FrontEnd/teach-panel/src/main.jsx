import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@ant-design/v5-patch-for-react-19';
import store from './app/store';
import { Provider } from 'react-redux';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';

import AppLayout from './pages/AppLayout.jsx';
import HomePage from './pages/Home/HomePage.jsx';
import SessionPage from './pages/Sessions/SessionPage.jsx';
import PrivateRoute from './components/routing/PrivateRoute.jsx';
import PublicRoute from './components/routing/PublicRoute.jsx';
import ErrorFallback from './components/routing/ErrorFallback.jsx';
import SignIn from "./features/auth/SignIn.jsx";
import SignUp from "./features/auth/SignUp.jsx";
import AuthBootstrap from "./features/auth/AuthBootstrap.jsx";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";
import StudentsOverviewPage from "./pages/Students/StudentsOverviewPage.jsx";
import StudentManagementPage from "./pages/Students/StudentManagementPage.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        errorElement: <ErrorFallback />,
        children: [
            {
                index: true,
                element: (
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                ),
                errorElement: <ErrorFallback />,
            },
            {
                path: 'sign-in',
                element: (
                    <PublicRoute>
                        <SignIn />
                    </PublicRoute>
                ),
                errorElement: <ErrorFallback />,
            },
            {
                path: 'sign-up',
                element: (
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                ),
                errorElement: <ErrorFallback />,
            },
            {
                path: 'settings',
                element: (
                    <PrivateRoute>
                        <SettingsPage/>
                    </PrivateRoute>
                ),
                errorElement: <ErrorFallback />,
            },

            {
                path: '*',
                element: <h2>Page Not Found</h2>,
            },
        ],
    },
    {
        path: 'session/:id',
        element: (
            <PrivateRoute>
                <SessionPage />
            </PrivateRoute>
        ),
        errorElement: <ErrorFallback />,
    },
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <AuthBootstrap>
                    <RouterProvider router={router} />
                </AuthBootstrap>
            </QueryClientProvider>
        </Provider>
    </StrictMode>
);
