import api from '../app/api.js';

// Students API endpoints
export const studentsApi = {
    // Get all students with pagination
    getAllStudents: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/v1/students', {
                params: {
                    page,
                    pageSize
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    // Get student by ID
    getStudentById: async (studentId) => {
        try {
            const response = await api.get(`/v1/students/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student:', error);
            throw error;
        }
    },

    // Create new student
    createStudent: async (studentData) => {
        try {
            const response = await api.post('/v1/students', studentData);
            return response.data;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    },

    // Update student
    updateStudent: async (studentId, studentData) => {
        try {
            const response = await api.put(`/v1/students/${studentId}`, studentData);
            return response.data;
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    },

    // Delete student
    deleteStudent: async (studentId) => {
        try {
            const response = await api.delete(`/v1/students/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },
};

// Groups API endpoints
export const groupsApi = {
    // Get all groups with pagination
    getAllGroups: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/v1/groups', {
                params: {
                    page,
                    pageSize
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    },

    // Get group by ID
    getGroupById: async (groupId) => {
        try {
            const response = await api.get(`/v1/groups/${groupId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching group:', error);
            throw error;
        }
    },

    // Create new group
    createGroup: async (groupData) => {
        try {
            const response = await api.post('/v1/groups', groupData);
            return response.data;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    // Update group
    updateGroup: async (groupId, groupData) => {
        try {
            const response = await api.put(`/v1/groups/${groupId}`, groupData);
            return response.data;
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    },

    // Delete group
    deleteGroup: async (groupId) => {
        try {
            const response = await api.delete(`/v1/groups/${groupId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    },
};

export default { studentsApi, groupsApi }; 