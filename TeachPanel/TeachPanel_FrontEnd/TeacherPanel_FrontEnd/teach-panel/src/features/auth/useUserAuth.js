import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../../app/authApi.js';
import { useDispatch } from 'react-redux';
import { setUser, setError, setLoading } from './authSlice.js';
import { isHasTokens, clearTokens } from "./tokenExpiry.js";

export const useUserAuth = () => {
    const dispatch = useDispatch();

    const isLoggedIn = isHasTokens();

    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {

            if (!isLoggedIn) {
                dispatch(setUser(null));
                clearTokens();
                return null;
            }

            dispatch(setLoading());

            try {
                const res = await fetchCurrentUser();
                dispatch(setUser(res.data));
                return res.data;
            } catch (error) {
                console.error('Error fetching current user:', error);

                if (error.response.status === 401) {
                    clearTokens();
                    dispatch(setUser(null));
                    return null;
                }

                dispatch(setError({
                    message: error.message,
                    status: error.response?.status,
                    code: error.code,
                }));

                return null;
            }
        },
        onError: () => {
            dispatch(setError());
        },
        retry: 3,
        retryDelay: 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};
