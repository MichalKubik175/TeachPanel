import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FullScreenLoader from "../FullScreenLoader.jsx";

const PrivateRoute = ({ children }) => {
    const { status } = useSelector(state => state.auth);

    if (status === 'loading') return (
        <>
            <FullScreenLoader loading={true} />
        </>
    );

    if (status === 'unauthenticated' || status === 'error')
        return <Navigate to="/sign-in" replace />;

    return children;
};

export default PrivateRoute;
