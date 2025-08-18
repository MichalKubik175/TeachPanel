import { api } from '../app/api';

const BASE_URL = '/v1/studentvisits';

export const visitsApi = {
  // Get all visits with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get visit by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new visit
  create: async (visitData) => {
    console.log('API: Creating visit with data:', visitData);
    const response = await api.post(BASE_URL, visitData);
    console.log('API: Visit created successfully:', response.data);
    return response.data;
  },

  // Update visit
  update: async (id, visitData) => {
    const response = await api.put(`${BASE_URL}/${id}`, visitData);
    return response.data;
  },

  // Delete visit
  delete: async (id) => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Bulk create or update visits
  bulkCreateOrUpdate: async (bulkData) => {
    console.log('API: Bulk creating/updating visits with data:', bulkData);
    const response = await api.post(`${BASE_URL}/bulk`, bulkData);
    console.log('API: Bulk visits operation completed:', response.data);
    return response.data;
  },

  // Get group visit summaries
  getGroupSummaries: async (fromDate = null, toDate = null) => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    const response = await api.get(`${BASE_URL}/summaries`, { params });
    return response.data;
  },

  // Get specific group visit summary
  getGroupSummary: async (groupId, visitDate) => {
    const response = await api.get(`${BASE_URL}/summaries/${groupId}`, {
      params: { visitDate }
    });
    return response.data;
  }
};
