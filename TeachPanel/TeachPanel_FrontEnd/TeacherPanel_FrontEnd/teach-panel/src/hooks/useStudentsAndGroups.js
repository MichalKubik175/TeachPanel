import { useState, useEffect, useCallback } from 'react';
import { studentsApi, groupsApi } from '../services/studentsApi.js';

export const useStudentsAndGroups = () => {
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

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
                total: response.totalCount || 0
            }));
        } catch (err) {
            setError(err.message || 'Failed to fetch students');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch groups
    const fetchGroups = useCallback(async (page = 1, pageSize = 10) => {
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
            setStudents(prev => prev.map(student => 
                student.id === studentId ? updatedStudent : student
            ));
            return updatedStudent;
        } catch (err) {
            setError(err.message || 'Failed to update student');
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
            setStudents(prev => prev.filter(student => student.id !== studentId));
        } catch (err) {
            setError(err.message || 'Failed to delete student');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create group
    const createGroup = useCallback(async (groupData) => {
        try {
            setLoading(true);
            setError(null);
            const newGroup = await groupsApi.createGroup(groupData);
            setGroups(prev => [...prev, newGroup]);
            return newGroup;
        } catch (err) {
            setError(err.message || 'Failed to create group');
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
            setGroups(prev => prev.map(group => 
                group.id === groupId ? updatedGroup : group
            ));
            return updatedGroup;
        } catch (err) {
            setError(err.message || 'Failed to update group');
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
            setGroups(prev => prev.filter(group => group.id !== groupId));
        } catch (err) {
            setError(err.message || 'Failed to delete group');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        fetchStudents();
        fetchGroups();
    }, [fetchStudents, fetchGroups]);

    return {
        students,
        groups,
        loading,
        error,
        pagination,
        fetchStudents,
        fetchGroups,
        createStudent,
        updateStudent,
        deleteStudent,
        createGroup,
        updateGroup,
        deleteGroup,
        setError
    };
}; 