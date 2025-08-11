// components/ErrorFallback.jsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

const ErrorFallback = () => {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Error {error.status}</h1>
                <p>{error.statusText}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Something went wrong</h1>
            <p>{error?.message || String(error)}</p>
        </div>
    );
};

export default ErrorFallback;
