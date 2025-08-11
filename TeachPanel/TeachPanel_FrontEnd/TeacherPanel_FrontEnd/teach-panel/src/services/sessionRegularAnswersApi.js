import api from '../app/api.js';

export const sessionRegularAnswersApi = {
    getAllSessionRegularAnswers: async (page = 1, pageSize = 100) => {
        try {
            const response = await api.get('/v1/sessionregularanswers', {
                params: { page, pageSize }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching session regular answers:', error);
            throw error;
        }
    },

    getSessionRegularAnswersBySession: async (sessionId) => {
        try {
            console.log('Fetching regular answers for session:', sessionId);
            const response = await api.get('/v1/sessionregularanswers', {
                params: { page: 1, pageSize: 1000 }
            });
            
            // Filter answers for the specific session
            if (response.data && response.data.items) {
                const filteredAnswers = response.data.items.filter(answer => {
                    // We need to check if the answer belongs to students of this session
                    return true; // For now, return all and filter in frontend
                });
                
                return {
                    ...response.data,
                    items: filteredAnswers
                };
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching session regular answers by session:', error);
            throw error;
        }
    },

    getSessionRegularAnswerById: async (id) => {
        try {
            const response = await api.get(`/v1/sessionregularanswers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching session regular answer by id:', error);
            throw error;
        }
    },

    createSessionRegularAnswer: async (answerData) => {
        try {
            console.log('Creating session regular answer:', answerData);
            console.log('Full URL will be:', `${window.location.origin.replace(':5173', ':7178')}/internal/v1/sessionregularanswers`);
            const response = await api.post('/v1/sessionregularanswers', answerData);
            return response.data;
        } catch (error) {
            console.error('Error creating session regular answer:', error);
            console.error('Error response status:', error.response?.status);
            console.error('Error response data:', error.response?.data);
            console.error('Error response headers:', error.response?.headers);
            console.error('Request config:', error.config);
            throw error;
        }
    },

    updateSessionRegularAnswer: async (id, answerData) => {
        try {
            console.log('Updating session regular answer:', id, answerData);
            console.log('PUT URL:', `/v1/sessionregularanswers/${id}`);
            const response = await api.put(`/v1/sessionregularanswers/${id}`, answerData);
            return response.data;
        } catch (error) {
            console.error('Error updating session regular answer:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    },

    deleteSessionRegularAnswer: async (id) => {
        try {
            await api.delete(`/v1/sessionregularanswers/${id}`);
        } catch (error) {
            console.error('Error deleting session regular answer:', error);
            throw error;
        }
    },
};

export default { sessionRegularAnswersApi }; 