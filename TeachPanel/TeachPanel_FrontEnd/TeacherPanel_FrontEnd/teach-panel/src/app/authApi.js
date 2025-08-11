import api from './api.js';
import { getAccessAndRefreshTokens } from '../features/auth/tokenExpiry.js';

export const fetchCurrentUser = () => api.get('/v1/auth/me');
export const signIn = (credentials) => api.post('/v1/auth/sign-in', credentials);
export const signUp = (userData) => api.post('/v1/auth/sign-up', userData);
export const signOut = () => {
    const tokens = getAccessAndRefreshTokens();
    if (!tokens) {
        return Promise.resolve(); // No tokens to deactivate
    }
    return api.post('/v1/auth/deactivate-refresh-token', {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
};
export const changePassword = (passwordData) => api.post('/v1/auth/change-password', passwordData);