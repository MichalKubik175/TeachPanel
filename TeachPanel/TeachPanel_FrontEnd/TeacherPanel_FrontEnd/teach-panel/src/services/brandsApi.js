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

// BrandGroups API endpoints
export const brandGroupsApi = {
    // Get all brand groups with pagination
    getAllBrandGroups: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/v1/brandgroups', {
                params: {
                    page,
                    pageSize
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching brand groups:', error);
            throw error;
        }
    },

    // Get brand groups by brand ID
    getBrandGroupsByBrandId: async (brandId) => {
        try {
            const response = await api.get('/v1/brandgroups', {
                params: {
                    brandId,
                    page: 1,
                    pageSize: 1000 // Get all groups for this brand
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching brand groups by brand ID:', error);
            throw error;
        }
    },

    // Create new brand group
    createBrandGroup: async (brandGroupData) => {
        try {
            const response = await api.post('/v1/brandgroups', brandGroupData);
            return response.data;
        } catch (error) {
            console.error('Error creating brand group:', error);
            throw error;
        }
    },

    // Create group in brand
    createGroupInBrand: async (brandGroupData) => {
        try {
            const response = await api.post('/v1/brandgroups/create-group', brandGroupData);
            return response.data;
        } catch (error) {
            console.error('Error creating group in brand:', error);
            throw error;
        }
    },

    // Update brand group
    updateBrandGroup: async (brandGroupId, brandGroupData) => {
        try {
            const response = await api.put(`/v1/brandgroups/${brandGroupId}`, brandGroupData);
            return response.data;
        } catch (error) {
            console.error('Error updating brand group:', error);
            throw error;
        }
    },

    // Delete brand group
    deleteBrandGroup: async (brandGroupId) => {
        try {
            const response = await api.delete(`/v1/brandgroups/${brandGroupId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting brand group:', error);
            throw error;
        }
    },
};

export default { brandsApi, brandGroupsApi }; 