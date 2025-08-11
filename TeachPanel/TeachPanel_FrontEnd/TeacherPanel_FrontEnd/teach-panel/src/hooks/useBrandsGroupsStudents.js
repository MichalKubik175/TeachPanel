import { useState, useEffect, useCallback } from 'react';
import { studentsApi, groupsApi } from '../services/studentsApi.js';
import { brandsApi, brandGroupsApi } from '../services/brandsApi.js';

export const useBrandsGroupsStudents = () => {
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [brands, setBrands] = useState([]);
    const [brandGroups, setBrandGroups] = useState([]);
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

    // Fetch brand groups
    const fetchBrandGroups = useCallback(async (page = 1, pageSize = 100) => {
        try {
            setLoading(true);
            setError(null);
            const response = await brandGroupsApi.getAllBrandGroups(page, pageSize);
            setBrandGroups(response.items || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch brand groups');
            console.error('Error fetching brand groups:', err);
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

    // Create group in brand
    const createGroupInBrand = useCallback(async (brandId, groupName) => {
        try {
            setLoading(true);
            setError(null);
            const newBrandGroup = await brandGroupsApi.createGroupInBrand({
                brandId,
                groupName
            });
            // Refresh brand groups and groups
            await fetchBrandGroups();
            await fetchGroups();
            return newBrandGroup;
        } catch (err) {
            setError(err.message || 'Failed to create group in brand');
            console.error('Error creating group in brand:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBrandGroups, fetchGroups]);

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

    // Get groups by brand
    const getGroupsByBrand = useCallback((brandId) => {
        return brandGroups
            .filter(bg => bg.brandId === brandId)
            .map(bg => groups.find(g => g.id === bg.groupId))
            .filter(Boolean);
    }, [brandGroups, groups]);

    // Initialize data
    useEffect(() => {
        fetchBrands();
        fetchBrandGroups();
        fetchStudents();
        fetchGroups();
    }, [fetchBrands, fetchBrandGroups, fetchStudents, fetchGroups]);

    return {
        students,
        groups,
        brands,
        brandGroups,
        loading,
        error,
        pagination,
        createBrand,
        updateBrand,
        deleteBrand,
        createGroupInBrand,
        updateGroup,
        deleteGroup,
        createStudent,
        updateStudent,
        deleteStudent,
        getGroupsByBrand,
        setError,
        fetchStudents
    };
}; 