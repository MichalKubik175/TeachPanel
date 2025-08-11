import { useUserAuth } from "./useUserAuth.js";
import FullScreenLoader from "../../components/FullScreenLoader.jsx";
import {useSelector} from "react-redux";

const AuthBootstrap = ({ children }) => {
    const { status } = useSelector(state => state.auth);
    useUserAuth();

    if (status === 'loading') return (
        <>
            <FullScreenLoader loading={true} />
        </>
    );

    return children;
};

export default AuthBootstrap;