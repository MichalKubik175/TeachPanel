import api from '../app/api.js';

export const sessionsApi = {
    getAllSessions: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/v1/sessions', {
                params: { page, pageSize }
            });
            return response.data;
            } catch (error) {
        console.error('Error fetching sessions:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error response headers:', error.response?.headers);
        throw error;
    }
    },
    getSessionById: async (id) => {
        try {
            const response = await api.get(`/v1/sessions/${id}`);
            return response.data;
            } catch (error) {
        console.error('Error fetching session by id:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        throw error;
    }
    },
    createSession: async (sessionData) => {
        try {
            const response = await api.post('/v1/sessions', sessionData);
            return response.data;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    },
    updateSession: async (id, sessionData) => {
        try {
            const response = await api.put(`/v1/sessions/${id}`, sessionData);
            return response.data;
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    },
    createSessionHomeworkStudent: async (studentData) => {
        try {
            const response = await api.post('/v1/sessionhomeworkstudents', studentData);
            return response.data;
        } catch (error) {
            console.error('Error creating session homework student:', error);
            throw error;
        }
    },
    createSessionRegularStudent: async (studentData) => {
        try {
            const response = await api.post('/v1/sessionregularstudents', studentData);
            return response.data;
        } catch (error) {
            console.error('Error creating session regular student:', error);
            throw error;
        }
    },
    deleteSession: async (id) => {
        try {
            const response = await api.delete(`/v1/sessions/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    },
};

export default { sessionsApi }; 