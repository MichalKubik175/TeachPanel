import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FullScreenLoader from "../FullScreenLoader.jsx";

const PublicRoute = ({ children }) => {
    const { status } = useSelector(state => state.auth);

    if (status === 'loading') return (
        <>
            <FullScreenLoader loading={true} />
        </>
    );

    if (status === 'authenticated') return <Navigate to="/" replace />;

    return children;
};

export default PublicRoute;