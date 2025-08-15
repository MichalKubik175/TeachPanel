import api from '../app/api.js';

// Brands API endpoints
export const brandsApi = {
    // Get all brands with pagination
    getAllBrands: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/v1/brands', {
                params: {
                    page,
                    pageSize
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching brands:', error);
            throw error;
        }
    },

    // Get brand by ID
    getBrandById: async (brandId) => {
        try {
            const response = await api.get(`/v1/brands/${brandId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching brand:', error);
            throw error;
        }
    },

    // Create new brand
    createBrand: async (brandData) => {
        try {
            const response = await api.post('/v1/brands', brandData);
            return response.data;
        } catch (error) {
            console.error('Error creating brand:', error);
            throw error;
        }
    },

    // Update brand
    updateBrand: async (brandId, brandData) => {
        try {
            const response = await api.put(`/v1/brands/${brandId}`, brandData);
            return response.data;
        } catch (error) {
            console.error('Error updating brand:', error);
            throw error;
        }
    },

    // Delete brand
    deleteBrand: async (brandId) => {
        try {
            const response = await api.delete(`/v1/brands/${brandId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting brand:', error);
            throw error;
        }
    },
};

export default { brandsApi }; 