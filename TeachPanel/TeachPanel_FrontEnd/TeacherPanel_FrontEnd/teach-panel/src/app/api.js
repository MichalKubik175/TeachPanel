import axios from 'axios';
import { getExpiry, saveTokens, getAccessAndRefreshTokens, isHasTokens } from '../features/auth/tokenExpiry';
import { API_CONFIG } from '../config/api.js';

export const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
});

const refreshClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
});

let refreshPromise = null;

async function doRefresh() {
    
    const accessAndRefreshTokens = getAccessAndRefreshTokens();

    const { data } = await refreshClient.post(
        '/v1/auth/refresh-access-token',
        {
            accessToken: accessAndRefreshTokens.accessToken,
            refreshToken: accessAndRefreshTokens.refreshToken,
        }
    );
    
    saveTokens(data.accessToken.token, data.refreshToken.token, data.accessToken.expiresAtUtc);

    return data;
}

api.interceptors.request.use(async (config) => {
    const accessAndRefreshTokens = getAccessAndRefreshTokens();
    
    if (accessAndRefreshTokens && accessAndRefreshTokens.accessToken) {
        config.headers['Authorization'] = `Bearer ${accessAndRefreshTokens.accessToken}`;
    }
    
    return config;
});

api.interceptors.request.use(async (config) => {
    const expiresAt = getExpiry();
    const now = Date.now();

    // if we have an expiry AND we're within 30s of it (or past)
    if (isHasTokens && (expiresAt && now >= expiresAt - 30_000)) {
        
        if (!refreshPromise) {
            refreshPromise = doRefresh().finally(() => {
                refreshPromise = null;
            });
        }
        await refreshPromise;
    }
    
    const accessAndRefreshTokens = getAccessAndRefreshTokens();
    if (accessAndRefreshTokens && accessAndRefreshTokens.accessToken) {
        config.headers['Authorization'] = `Bearer ${accessAndRefreshTokens.accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    res => res,
    async (err) => {
        const original = err.config;
        
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (!refreshPromise) {
                refreshPromise = doRefresh().finally(() => {
                    refreshPromise = null;
                });
            }

            try {
                await refreshPromise;
                
                const accessAndRefreshTokens = getAccessAndRefreshTokens();
                if (accessAndRefreshTokens && accessAndRefreshTokens.accessToken) {
                    original.headers['Authorization'] = `Bearer ${accessAndRefreshTokens.accessToken}`;
                }
                
                return api(original);
            } catch (refreshErr) {
                console.error('Refresh failed:', refreshErr);
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(err);
    }
);

export default api;
