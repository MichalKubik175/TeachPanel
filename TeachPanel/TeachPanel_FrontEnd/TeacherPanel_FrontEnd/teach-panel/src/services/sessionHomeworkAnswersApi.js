import api from '../app/api.js';

export const sessionHomeworkAnswersApi = {
    getAllSessionHomeworkAnswers: async (page = 1, pageSize = 100) => {
        try {
            const response = await api.get('/v1/sessionhomeworkanswers', {
                params: { page, pageSize }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching session homework answers:', error);
            throw error;
        }
    },

    getSessionHomeworkAnswersBySession: async (sessionId, sessionHomeworkStudents = []) => {
        try {
            console.log('Fetching answers for session:', sessionId);
            console.log('Session homework student IDs to filter by:', sessionHomeworkStudents.map(s => s.id));
            
            console.log('Making API call to:', '/v1/sessionhomeworkanswers');
            console.log('API call params:', { page: 1, pageSize: 1000 });
            
            const response = await api.get('/v1/sessionhomeworkanswers', {
                params: { page: 1, pageSize: 1000 },
                timeout: 10000 // 10 second timeout
            });
            
            console.log('API call successful!');
            console.log('Raw API response:', response.data);
            console.log('Total answers from API:', response.data?.items?.length || 0);
            
            // Filter answers for the specific session
            if (response.data && response.data.items) {
                const sessionStudentIds = sessionHomeworkStudents.map(s => s.id);
                console.log('Filtering answers by session student IDs:', sessionStudentIds);
                
                const filteredAnswers = response.data.items.filter(answer => {
                    const belongsToSession = sessionStudentIds.includes(answer.sessionHomeworkStudentId);
                    console.log(`Answer ${answer.id} belongs to session:`, belongsToSession, 'studentId:', answer.sessionHomeworkStudentId);
                    return belongsToSession;
                });
                
                console.log('Filtered answers for session:', filteredAnswers.length);
                
                return {
                    ...response.data,
                    items: filteredAnswers
                };
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching session homework answers by session:', error);
            throw error;
        }
    },

    getSessionHomeworkAnswerById: async (id) => {
        try {
            const response = await api.get(`/v1/sessionhomeworkanswers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching session homework answer by id:', error);
            throw error;
        }
    },

    createSessionHomeworkAnswer: async (answerData) => {
        try {
            console.log('Creating session homework answer:', answerData);
            console.log('Full URL will be:', `${window.location.origin.replace(':5173', ':7178')}/internal/v1/sessionhomeworkanswers`);
            
            const response = await api.post('/v1/sessionhomeworkanswers', answerData, {
                timeout: 10000 // 10 second timeout
            });
            
            console.log('POST request completed successfully');
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Error creating session homework answer:', error);
            console.error('Error type:', error.name);
            console.error('Error message:', error.message);
            console.error('Error response status:', error.response?.status);
            console.error('Error response data:', error.response?.data);
            console.error('Error response headers:', error.response?.headers);
            console.error('Request config:', error.config);
            
            if (error.code === 'ECONNABORTED') {
                console.error('Request timed out after 10 seconds');
            }
            
            throw error;
        }
    },

    updateSessionHomeworkAnswer: async (id, answerData) => {
        try {
            console.log('Updating session homework answer:', id, answerData);
            console.log('PUT URL:', `/v1/sessionhomeworkanswers/${id}`);
            const response = await api.put(`/v1/sessionhomeworkanswers/${id}`, answerData);
            return response.data;
        } catch (error) {
            console.error('Error updating session homework answer:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    },

    deleteSessionHomeworkAnswer: async (id) => {
        try {
            await api.delete(`/v1/sessionhomeworkanswers/${id}`);
        } catch (error) {
            console.error('Error deleting session homework answer:', error);
            throw error;
        }
    },
};

export default { sessionHomeworkAnswersApi }; 