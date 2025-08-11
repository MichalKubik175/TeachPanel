import { api } from '../app/api';

const BASE_URL = '/v1/questionnaires';

export const questionnairesApi = {
  // Get all questionnaires with pagination
  getAll: async (page = 1, pageSize = 10) => {
    const response = await api.get(`${BASE_URL}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Get questionnaire by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new questionnaire
  create: async (questionnaireData) => {
    console.log('API: Creating questionnaire with data:', questionnaireData);
    const response = await api.post(BASE_URL, questionnaireData);
    console.log('API: Questionnaire created successfully:', response.data);
    return response.data;
  },

  // Update questionnaire
  update: async (id, questionnaireData) => {
    const response = await api.put(`${BASE_URL}/${id}`, questionnaireData);
    return response.data;
  },

  // Delete questionnaire
  delete: async (id) => {
    await api.delete(`${BASE_URL}/${id}`);
  }
}; 