const PREFIX = 'teacher-panel:auth:';
const ACCESS_TOKEN_KEY = PREFIX + 'accessToken';
const REFRESH_TOKEN_KEY = PREFIX + 'refreshToken';
const ACCESS_TOKEN_EXPIRES_AT_KEY = PREFIX + 'accessTokenExpiresAt';

function setExpiry(isoUtcString) {
    const millis = Date.parse(isoUtcString);
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(millis));
}

export function getExpiry() {
    const v = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    return v ? Number(v) : null;
}

export function saveTokens(accessToken, refreshToken, accessTokenExpiresAt) {
    
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    setExpiry(accessTokenExpiresAt);
}

export function getAccessAndRefreshTokens() {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
        return null;
    }

    return {
        accessToken,
        refreshToken,
    };
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
}

export function isHasTokens() {
    return !!getAccessAndRefreshTokens();
}