import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    status: 'idle', // 'loading' | 'authenticated' | 'unauthenticated' | 'error'
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.status = action.payload ? 'authenticated' : 'unauthenticated';
        },
        setLoading(state) {
            state.status = 'loading';
        },
        setError(state) {
            state.status = 'error';
        },
        logout(state) {
            state.user = null;
            state.status = 'unauthenticated';
        },
    },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
