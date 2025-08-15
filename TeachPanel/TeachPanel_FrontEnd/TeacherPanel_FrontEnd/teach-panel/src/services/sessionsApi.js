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
            console.log('Updating session with ID:', id);
            console.log('Session data:', sessionData);
            const response = await api.put(`/v1/sessions/${id}`, sessionData);
            return response.data;
        } catch (error) {
            console.error('Error updating session:', error);
            console.error('Session ID:', id);
            console.error('Request data:', sessionData);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    },
    createSessionHomeworkStudent: async (studentData) => {
        try {
            console.log('Creating session homework student with data:', studentData);
            const response = await api.post('/v1/sessionhomeworkstudents', studentData);
            return response.data;
        } catch (error) {
            console.error('Error creating session homework student:', error);
            console.error('Request data:', studentData);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }
            throw error;
        }
    },
    createSessionRegularStudent: async (studentData) => {
        try {
            console.log('Creating session regular student with data:', studentData);
            const response = await api.post('/v1/sessionregularstudents', studentData);
            return response.data;
        } catch (error) {
            console.error('Error creating session regular student:', error);
            console.error('Request data:', studentData);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }
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
    deleteSessionHomeworkStudent: async (sessionHomeworkStudentId) => {
        try {
            console.log('Deleting session homework student with ID:', sessionHomeworkStudentId);
            const response = await api.delete(`/v1/sessionhomeworkstudents/${sessionHomeworkStudentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting session homework student:', error);
            console.error('SessionHomeworkStudent ID:', sessionHomeworkStudentId);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    },
    deleteSessionRegularStudent: async (sessionRegularStudentId) => {
        try {
            console.log('Deleting session regular student with ID:', sessionRegularStudentId);
            const response = await api.delete(`/v1/sessionregularstudents/${sessionRegularStudentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting session regular student:', error);
            console.error('SessionRegularStudent ID:', sessionRegularStudentId);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    },
    getSessionStudentsWithAnswers: async (sessionId) => {
        try {
            console.log('Getting students with answers for session:', sessionId);
            const response = await api.get(`/v1/sessions/${sessionId}/students-with-answers`);
            return response.data;
        } catch (error) {
            console.error('Error getting students with answers:', error);
            console.error('Session ID:', sessionId);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    },
};

export default { sessionsApi }; 