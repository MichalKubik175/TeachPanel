import api from '../app/api.js';

export const tableLayoutsApi = {
    getAllTableLayouts: async (page = 1, pageSize = 100) => {
        try {
            const response = await api.get('/v1/tablelayouts', {
                params: { page, pageSize }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching table layouts:', error);
            throw error;
        }
    },
    getTableLayoutById: async (id) => {
        try {
            const response = await api.get(`/v1/tablelayouts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching table layout by id:', error);
            throw error;
        }
    },
    createTableLayout: async (layoutData) => {
        try {
            const response = await api.post('/v1/tablelayouts', layoutData);
            return response.data;
        } catch (error) {
            console.error('Error creating table layout:', error);
            throw error;
        }
    },
};

export default { tableLayoutsApi }; 