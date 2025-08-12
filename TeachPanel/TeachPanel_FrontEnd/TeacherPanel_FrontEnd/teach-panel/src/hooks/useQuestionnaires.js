import { useState, useEffect } from 'react';
import { questionnairesApi } from '../services/questionnairesApi';

export const useQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10
  });

  const fetchQuestionnaires = async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionnairesApi.getAll(page, pageSize);
      setQuestionnaires(response.items);
      setPagination({
        currentPage: response.meta.currentPage,
        totalPages: response.meta.totalPagesCount,
        totalItems: response.meta.totalItemsCount,
        pageSize: pageSize
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch questionnaires');
      console.error('Error fetching questionnaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const createQuestionnaire = async (questionnaireData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newQuestionnaire = await questionnairesApi.create(questionnaireData);
      setQuestionnaires(prev => [newQuestionnaire, ...prev]);
      return newQuestionnaire;
    } catch (err) {
      setError(err.message || 'Failed to create questionnaire');
      console.error('Error creating questionnaire:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionnaire = async (id, questionnaireData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedQuestionnaire = await questionnairesApi.update(id, questionnaireData);
      setQuestionnaires(prev => 
        prev.map(q => q.id === id ? updatedQuestionnaire : q)
      );
      return updatedQuestionnaire;
    } catch (err) {
      setError(err.message || 'Failed to update questionnaire');
      console.error('Error updating questionnaire:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestionnaire = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await questionnairesApi.delete(id);
      setQuestionnaires(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete questionnaire');
      console.error('Error deleting questionnaire:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  return {
    questionnaires,
    loading,
    error,
    pagination,
    fetchQuestionnaires,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    setError
  };
}; 