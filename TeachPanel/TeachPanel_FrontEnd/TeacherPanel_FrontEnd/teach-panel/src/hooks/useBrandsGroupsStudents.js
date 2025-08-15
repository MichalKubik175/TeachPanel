import { useState, useEffect, useCallback } from 'react';
import { studentsApi, groupsApi } from '../services/studentsApi.js';
import { brandsApi } from '../services/brandsApi.js';

export const useBrandsGroupsStudents = () => {
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

    // Fetch brands
    const fetchBrands = useCallback(async (page = 1, pageSize = 100) => {
        try {
            setLoading(true);
            setError(null);
            const response = await brandsApi.getAllBrands(page, pageSize);
            setBrands(response.items || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch brands');
            console.error('Error fetching brands:', err);
        } finally {
            setLoading(false);
        }
    }, []);



    // Fetch students
    const fetchStudents = useCallback(async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            setError(null);
            const response = await studentsApi.getAllStudents(page, pageSize);
            setStudents(response.items || []);
            setPagination(prev => ({
                ...prev,
                page,
                pageSize,
                total: response.meta?.totalItemsCount || 0
            }));
        } catch (err) {
            setError(err.message || 'Failed to fetch students');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch groups
    const fetchGroups = useCallback(async (page = 1, pageSize = 100) => {
        try {
            setLoading(true);
            setError(null);
            const response = await groupsApi.getAllGroups(page, pageSize);
            setGroups(response.items || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch groups');
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create brand
    const createBrand = useCallback(async (brandData) => {
        try {
            setLoading(true);
            setError(null);
            const newBrand = await brandsApi.createBrand(brandData);
            setBrands(prev => [...prev, newBrand]);
            return newBrand;
        } catch (err) {
            setError(err.message || 'Failed to create brand');
            console.error('Error creating brand:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update brand
    const updateBrand = useCallback(async (brandId, brandData) => {
        try {
            setLoading(true);
            setError(null);
            const updatedBrand = await brandsApi.updateBrand(brandId, brandData);
            setBrands(prev => prev.map(b => b.id === brandId ? updatedBrand : b));
            return updatedBrand;
        } catch (err) {
            setError(err.message || 'Failed to update brand');
            console.error('Error updating brand:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete brand
    const deleteBrand = useCallback(async (brandId) => {
        try {
            setLoading(true);
            setError(null);
            await brandsApi.deleteBrand(brandId);
            setBrands(prev => prev.filter(b => b.id !== brandId));
        } catch (err) {
            setError(err.message || 'Failed to delete brand');
            console.error('Error deleting brand:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create group (now independent of brands)
    const createGroup = useCallback(async (groupData) => {
        try {
            setLoading(true);
            setError(null);
            const newGroup = await groupsApi.createGroup(groupData);
            setGroups(prev => [...prev, newGroup]);
            return newGroup;
        } catch (err) {
            setError(err.message || 'Failed to create group');
            console.error('Error creating group:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update group
    const updateGroup = useCallback(async (groupId, groupData) => {
        try {
            setLoading(true);
            setError(null);
            const updatedGroup = await groupsApi.updateGroup(groupId, groupData);
            setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
            return updatedGroup;
        } catch (err) {
            setError(err.message || 'Failed to update group');
            console.error('Error updating group:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete group
    const deleteGroup = useCallback(async (groupId) => {
        try {
            setLoading(true);
            setError(null);
            await groupsApi.deleteGroup(groupId);
            setGroups(prev => prev.filter(g => g.id !== groupId));
        } catch (err) {
            setError(err.message || 'Failed to delete group');
            console.error('Error deleting group:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create student
    const createStudent = useCallback(async (studentData) => {
        try {
            setLoading(true);
            setError(null);
            const newStudent = await studentsApi.createStudent(studentData);
            setStudents(prev => [...prev, newStudent]);
            return newStudent;
        } catch (err) {
            setError(err.message || 'Failed to create student');
            console.error('Error creating student:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update student
    const updateStudent = useCallback(async (studentId, studentData) => {
        try {
            setLoading(true);
            setError(null);
            const updatedStudent = await studentsApi.updateStudent(studentId, studentData);
            setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
            return updatedStudent;
        } catch (err) {
            setError(err.message || 'Failed to update student');
            console.error('Error updating student:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete student
    const deleteStudent = useCallback(async (studentId) => {
        try {
            setLoading(true);
            setError(null);
            await studentsApi.deleteStudent(studentId);
            setStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (err) {
            setError(err.message || 'Failed to delete student');
            console.error('Error deleting student:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get students by brand (since students now have brandId directly)
    const getStudentsByBrand = useCallback((brandId) => {
        return students.filter(student => student.brandId === brandId);
    }, [students]);

    // Initialize data
    useEffect(() => {
        fetchBrands();
        fetchStudents();
        fetchGroups();
    }, [fetchBrands, fetchStudents, fetchGroups]);

    return {
        students,
        groups,
        brands,
        loading,
        error,
        pagination,
        createBrand,
        updateBrand,
        deleteBrand,
        createGroup,
        updateGroup,
        deleteGroup,
        createStudent,
        updateStudent,
        deleteStudent,
        getStudentsByBrand,
        setError,
        fetchStudents
    };
}; 