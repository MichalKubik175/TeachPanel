import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Spin, Alert, Button, Segmented, Row, Col, Badge, Tooltip, message, Modal, List, Avatar, Tag } from 'antd';
import { PlayCircleOutlined, ExclamationCircleOutlined, FileTextOutlined, BookOutlined, UserOutlined, TeamOutlined, SwapOutlined, DeleteOutlined, DragOutlined, QuestionCircleOutlined, CheckCircleOutlined, ExclamationOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { sessionsApi } from '../../services/sessionsApi';
import { sessionHomeworkAnswersApi } from '../../services/sessionHomeworkAnswersApi';
import { sessionRegularAnswersApi } from '../../services/sessionRegularAnswersApi';

const { Title, Text } = Typography;

const SessionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [currentState, setCurrentState] = useState('Regular'); // 'Regular' or 'Homework'
    
    // Separate assignments for each state
    const [regularAssignments, setRegularAssignments] = useState({}); // { tableId: [studentIds] }
    const [homeworkAssignments, setHomeworkAssignments] = useState({}); // { tableId: [studentIds] }
    const [regularUnassigned, setRegularUnassigned] = useState([]);
    const [homeworkUnassigned, setHomeworkUnassigned] = useState([]);
    
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [draggedStudent, setDraggedStudent] = useState(null);
    const [dragOverTable, setDragOverTable] = useState(null);

    // Homework state specific
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({}); // { studentId: { questionId: { id, state, score } } }
    const studentAnswersRef = useRef(studentAnswers);
    
    // Keep ref in sync with state
    useEffect(() => {
        studentAnswersRef.current = studentAnswers;
        console.log('=== STUDENT ANSWERS STATE CHANGED ===');
        console.log('New studentAnswers state:', studentAnswers);
        console.log('Number of students with answers:', Object.keys(studentAnswers).length);
    }, [studentAnswers]);
    const [loadingAnswers, setLoadingAnswers] = useState(false);

    // Regular state specific
    const [regularStudentAnswers, setRegularStudentAnswers] = useState({}); // { studentId: [{ questionNumber, state, score, id }] }
    const [nextQuestionNumber, setNextQuestionNumber] = useState(1);

    // Generate table structure from table layout
    const tableStructure = useMemo(() => {
        if (!session?.tableLayout?.rows) return [];
        
        let tableId = 1;
        const structure = [];
        
        session.tableLayout.rows.forEach(row => {
            const rowTables = [];
            for (let i = 0; i < row.tablesCount; i++) {
                rowTables.push({
                    id: tableId,
                    rowNumber: row.rowNumber,
                    position: i + 1
                });
                tableId++;
            }
            structure.push({
                rowNumber: row.rowNumber,
                tables: rowTables
            });
        });
        
        return structure;
    }, [session?.tableLayout]);

    // Get students based on current state
    const currentStudents = useMemo(() => {
        if (!session) return [];
        
        if (currentState === 'Homework' && session.sessionHomeworkStudents) {
            return session.sessionHomeworkStudents;
        } else if (session.sessionRegularStudents) {
            return session.sessionRegularStudents;
        }
        
        return [];
    }, [session, currentState]);

    // Get questions from questionnaire
    const questions = useMemo(() => {
        console.log('Session data:', session);
        console.log('Questionnaire:', session?.questionnaire);
        console.log('Questions:', session?.questionnaire?.questions);
        
        if (!session?.questionnaire?.questions) return [];
        return session.questionnaire.questions;
    }, [session?.questionnaire]);

    // Get current assignments based on state
    const currentAssignments = currentState === 'Homework' ? homeworkAssignments : regularAssignments;
    const currentUnassigned = currentState === 'Homework' ? homeworkUnassigned : regularUnassigned;

    // Answer state utilities
    const getAnswerStateInfo = (state) => {
        console.log('getAnswerStateInfo called with state:', state, 'type:', typeof state);
        
        // Handle both numeric and string enum values
        switch (state) {
            case 1: // Green (numeric)
            case '1':
            case 'Green': // String enum value
            case 'green':
                return { color: '#52c41a', icon: <CheckCircleOutlined />, text: 'Добре', score: 1.0 };
            case 3: // Yellow (numeric)
            case '3':
            case 'Yellow': // String enum value
            case 'yellow':
                return { color: '#faad14', icon: <ExclamationOutlined />, text: 'Нормально', score: 0.5 };
            case 2: // Red (numeric)
            case '2':
            case 'Red': // String enum value
            case 'red':
                return { color: '#ff4d4f', icon: <CloseCircleOutlined />, text: 'Погано', score: 0.0 };
            case 0: // None (numeric)
            case '0':
            case 'None': // String enum value
            case 'none':
                return { color: '#d9d9d9', icon: <QuestionCircleOutlined />, text: 'Не відповідав', score: 0.0 };
            default: // Fallback
                console.log('Using default state for unrecognized value:', state);
                return { color: '#d9d9d9', icon: <QuestionCircleOutlined />, text: 'Не відповідав', score: 0.0 };
        }
    };

    // Keyboard shortcut handler
    const handleKeyPress = useCallback((event) => {
        console.log('=== KEYBOARD EVENT DEBUG ===');
        console.log('Key pressed:', event.key);
        console.log('Current state:', currentState);
        console.log('Selected student:', selectedStudent?.student?.fullName);
        console.log('Selected question:', selectedQuestion?.text);
        
        if (!selectedStudent) {
            console.log('No student selected - ignoring keypress');
            return;
        }
        
        // For Homework state, require selected question
        if (currentState === 'Homework' && !selectedQuestion) {
            console.log('Homework state but no question selected - ignoring keypress');
            return;
        }

        let newState = null;
        switch (event.key) {
            case 'F1':
                newState = 1; // Green
                console.log('F1 pressed - Green (1 point)');
                break;
            case 'F2':
                newState = 3; // Yellow
                console.log('F2 pressed - Yellow (0.5 points)');
                break;
            case 'F3':
                newState = 2; // Red
                console.log('F3 pressed - Red (0 points)');
                break;
            default:
                console.log('Non-F key pressed - ignoring');
                return;
        }

        event.preventDefault();
        console.log('Calling answer score handler with state:', newState);
        
        if (currentState === 'Homework') {
            handleHomeworkAnswerScore(newState);
        } else {
            handleRegularAnswerScore(newState);
        }
    }, [currentState, selectedQuestion, selectedStudent]);

    // Setup keyboard event listeners
    useEffect(() => {
        console.log('Setting up keyboard event listener...');
        document.addEventListener('keydown', handleKeyPress);
        console.log('Keyboard event listener attached');
        
        return () => {
            console.log('Removing keyboard event listener...');
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    const handleHomeworkAnswerScore = async (state) => {
        if (!selectedQuestion || !selectedStudent) return;
        
        // Prevent rapid successive calls
        if (loadingAnswers) {
            console.log('Already processing answer, ignoring duplicate call');
            return;
        }

        try {
            setLoadingAnswers(true);
            
            // Check if answer already exists (use ref to get current state)
            const currentAnswers = studentAnswersRef.current;
            const existingAnswer = currentAnswers[selectedStudent.id]?.[selectedQuestion.id];
            
            console.log('=== HOMEWORK ANSWER SCORE DEBUG ===');
            console.log('Current studentAnswers state at start:', currentAnswers);
            console.log('handleHomeworkAnswerScore called with:', {
                selectedStudent: selectedStudent.student?.fullName,
                selectedStudentId: selectedStudent.id,
                selectedQuestion: selectedQuestion.text,
                selectedQuestionId: selectedQuestion.id,
                newState: state,
                existingAnswer,
                existingAnswerId: existingAnswer?.id,
                existingAnswerState: existingAnswer?.state,
                isExistingAnswerValid: existingAnswer && existingAnswer.id && !existingAnswer.id.startsWith('temp-'),
                allStudentAnswers: currentAnswers[selectedStudent.id],
                entireStudentAnswersState: currentAnswers
            });
            console.log('Condition check:', {
                hasExistingAnswer: !!existingAnswer,
                hasValidId: existingAnswer && existingAnswer.id,
                isNotTempId: existingAnswer && !existingAnswer.id.startsWith('temp-'),
                finalCondition: existingAnswer && existingAnswer.id && !existingAnswer.id.startsWith('temp-')
            });
            
            let updatedAnswer;
            
            if (existingAnswer && existingAnswer.id && !existingAnswer.id.startsWith('temp-')) {
                // Update existing answer
                console.log('Updating existing answer:', existingAnswer.id);
                updatedAnswer = await sessionHomeworkAnswersApi.updateSessionHomeworkAnswer(existingAnswer.id, {
                    state: state
                });
                console.log('Answer updated successfully:', updatedAnswer);
                console.log('Response state type:', typeof updatedAnswer.state, 'value:', updatedAnswer.state);
                
                // Update local state for existing answer updates
                setStudentAnswers(prev => {
                    const newState = {
                        ...prev,
                        [selectedStudent.id]: {
                            ...prev[selectedStudent.id],
                            [selectedQuestion.id]: {
                                id: existingAnswer.id,
                                state: state,
                                score: getAnswerStateInfo(state).score
                            }
                        }
                    };
                    console.log('Updating studentAnswers state after PUT:', {
                        studentId: selectedStudent.id,
                        questionId: selectedQuestion.id,
                        updatedAnswer: newState[selectedStudent.id][selectedQuestion.id],
                        fullStudentAnswers: newState[selectedStudent.id]
                    });
                    return newState;
                });
                
                const stateInfo = getAnswerStateInfo(state);
                message.success(`${selectedStudent.student?.fullName}: Оновлено - ${stateInfo.text} (${stateInfo.score} балів)`);
                
            } else {
                // Create new answer
                console.log('Creating new answer for:', {
                    sessionHomeworkStudentId: selectedStudent.id,
                    questionId: selectedQuestion.id,
                    state: state
                });
                
                console.log('About to call createSessionHomeworkAnswer API...');
                const createdAnswer = await sessionHomeworkAnswersApi.createSessionHomeworkAnswer({
                    sessionHomeworkStudentId: selectedStudent.id,
                    questionId: selectedQuestion.id,
                    state: state
                });
                console.log('createSessionHomeworkAnswer API call completed successfully');
                
                console.log('Answer created successfully:', createdAnswer);
                
                // Update local state with the real ID from database
                setStudentAnswers(prev => {
                    console.log('Previous state before POST update:', prev);
                    const newState = {
                        ...prev,
                        [selectedStudent.id]: {
                            ...prev[selectedStudent.id],
                            [selectedQuestion.id]: {
                                id: createdAnswer.id,
                                state: state,
                                score: getAnswerStateInfo(state).score
                            }
                        }
                    };
                    console.log('Updating studentAnswers state after POST:', {
                        studentId: selectedStudent.id,
                        questionId: selectedQuestion.id,
                        createdAnswerId: createdAnswer.id,
                        newAnswer: newState[selectedStudent.id][selectedQuestion.id],
                        fullStudentAnswers: newState[selectedStudent.id],
                        entireState: newState
                    });
                    console.log('New state after POST update:', newState);
                    return newState;
                });
                
                const stateInfo = getAnswerStateInfo(state);
                message.success(`${selectedStudent.student?.fullName}: Створено - ${stateInfo.text} (${stateInfo.score} балів)`);
                
                // Verify state was updated (for debugging)
                setTimeout(() => {
                    const currentState = studentAnswersRef.current;
                    console.log('=== STATE VERIFICATION AFTER POST ===');
                    console.log('Student ID:', selectedStudent.id);
                    console.log('Question ID:', selectedQuestion.id);
                    console.log('Full studentAnswers state:', currentState);
                    console.log('Student specific answers:', currentState[selectedStudent.id]);
                    console.log('Specific answer:', currentState[selectedStudent.id]?.[selectedQuestion.id]);
                    console.log('Answer should exist:', !!currentState[selectedStudent.id]?.[selectedQuestion.id]);
                }, 200);
            }
            
        } catch (error) {
            console.error('Error updating answer:', error);
            console.error('Error details:', error.response?.data);
            message.error('Помилка при збереженні відповіді');
        } finally {
            setLoadingAnswers(false);
        }
    };

    const handleRegularAnswerScore = async (state) => {
        if (!selectedStudent) return;

        try {
            setLoadingAnswers(true);
            
            // For Regular session, we create a new question each time
            const questionNumber = nextQuestionNumber;
            
            // Create new answer
            const createdAnswer = await sessionRegularAnswersApi.createSessionRegularAnswer({
                sessionRegularStudentId: selectedStudent.id,
                questionNumber: questionNumber,
                state: state
            });
            
            // Update local state
            setRegularStudentAnswers(prev => {
                const studentAnswers = prev[selectedStudent.id] || [];
                const newAnswer = {
                    id: createdAnswer.id,
                    questionNumber: questionNumber,
                    state: state,
                    score: getAnswerStateInfo(state).score
                };
                
                return {
                    ...prev,
                    [selectedStudent.id]: [...studentAnswers, newAnswer]
                };
            });
            
            // Increment question number for next answer
            setNextQuestionNumber(prev => prev + 1);

            const stateInfo = getAnswerStateInfo(state);
            message.success(`${selectedStudent.student?.fullName}: Питання №${questionNumber} - ${stateInfo.text} (${stateInfo.score} балів)`);
            
        } catch (error) {
            console.error('Error updating regular answer:', error);
            message.error('Помилка при збереженні відповіді');
        } finally {
            setLoadingAnswers(false);
        }
    };

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            try {
                const sessionData = await sessionsApi.getSessionById(id);
                console.log('Session data received:', sessionData);
                setSession(sessionData);
                setError(null);
                
                // Set initial state based on session type
                if (sessionData.questionnaireId) {
                    setCurrentState('Homework');
                } else {
                    setCurrentState('Regular');
                }
            } catch (err) {
                console.error('Error fetching session:', err);
                setError('Сесія з таким ID не існує');
                setSession(null);
                
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            navigate('/');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSession();
        }
    }, [id, navigate]);

    // Initialize assignments for both states when session data changes
    useEffect(() => {
        if (session && session.sessionRegularStudents) {
            initializeAssignments('Regular', session.sessionRegularStudents);
        }
        if (session && session.sessionHomeworkStudents) {
            initializeAssignments('Homework', session.sessionHomeworkStudents);
        }
    }, [session]);

        // Load existing answers when session and students are available
    useEffect(() => {
        const loadExistingAnswers = async () => {
            console.log('loadExistingAnswers called with:', {
                session: !!session,
                currentState,
                sessionHomeworkStudents: session?.sessionHomeworkStudents?.length || 0
            });
            
            if (!session || currentState !== 'Homework' || !session.sessionHomeworkStudents || session.sessionHomeworkStudents.length === 0) {
                console.log('Skipping answer loading - conditions not met');
                return;
            }

            try {
                console.log('Loading existing answers for session:', session.id);
                console.log('Session homework students:', session.sessionHomeworkStudents);
                setLoadingAnswers(true);
                
                // Get all answers for this session
                console.log('About to call getSessionHomeworkAnswersBySession...');
                const answersResponse = await sessionHomeworkAnswersApi.getSessionHomeworkAnswersBySession(session.id, session.sessionHomeworkStudents);
                console.log('getSessionHomeworkAnswersBySession completed successfully');
                console.log('Loaded answers response:', answersResponse);
                console.log('Number of answers found:', answersResponse?.items?.length || 0);
                
                if (answersResponse && answersResponse.items && answersResponse.items.length > 0) {
                    const answers = {};
                    
                    // Group answers by student and question
                    answersResponse.items.forEach((answer, index) => {
                        console.log(`Processing answer ${index + 1}:`, answer);
                        
                        // Find the student this answer belongs to
                        const sessionStudent = session.sessionHomeworkStudents.find(
                            shs => shs.id === answer.sessionHomeworkStudentId
                        );
                        
                        console.log('Found session student for answer:', sessionStudent);
                        
                        if (sessionStudent) {
                            if (!answers[sessionStudent.id]) {
                                answers[sessionStudent.id] = {};
                            }
                            
                            answers[sessionStudent.id][answer.questionId] = {
                                id: answer.id,
                                state: answer.state,
                                score: getAnswerStateInfo(answer.state).score
                            };
                            
                            console.log('Answer state info for state', answer.state, ':', getAnswerStateInfo(answer.state));
                            
                            console.log(`Added answer for student ${sessionStudent.id}, question ${answer.questionId}:`, {
                                id: answer.id,
                                state: answer.state,
                                score: getAnswerStateInfo(answer.state).score
                            });
                        } else {
                            console.log('No session student found for answer:', answer);
                        }
                    });
                    
                    console.log('Final processed answers:', answers);
                    console.log('Setting student answers...');
                    console.log('Answer structure being set:', JSON.stringify(answers, null, 2));
                    setStudentAnswers(answers);
                    console.log('Student answers state should now be updated');
                } else {
                    console.log('No answers found in response');
                }
                
            } catch (error) {
                console.error('Error loading existing answers:', error);
                console.error('Error details:', error.response?.data);
                console.error('Error status:', error.response?.status);
                console.error('Error message:', error.message);
                console.error('Full error object:', error);
                
                // Fallback: Initialize empty state so the component works
                console.log('Initializing empty studentAnswers state as fallback');
                setStudentAnswers({});
            } finally {
                setLoadingAnswers(false);
            }
        };

        loadExistingAnswers();
    }, [session, currentState]);

    // Load existing Regular answers when session and students are available
    useEffect(() => {
        const loadExistingRegularAnswers = async () => {
            console.log('loadExistingRegularAnswers called with:', {
                session: !!session,
                currentState,
                sessionRegularStudents: session?.sessionRegularStudents?.length || 0
            });
            
            if (!session || currentState !== 'Regular' || !session.sessionRegularStudents || session.sessionRegularStudents.length === 0) {
                console.log('Skipping regular answer loading - conditions not met');
                return;
            }

            try {
                console.log('Loading existing regular answers for session:', session.id);
                setLoadingAnswers(true);
                
                // Get all regular answers for this session
                const answersResponse = await sessionRegularAnswersApi.getSessionRegularAnswersBySession(session.id);
                console.log('Loaded regular answers response:', answersResponse);
                console.log('Number of regular answers found:', answersResponse?.items?.length || 0);
                
                if (answersResponse && answersResponse.items && answersResponse.items.length > 0) {
                    const answers = {};
                    let maxQuestionNumber = 0;
                    
                    // Group answers by student
                    answersResponse.items.forEach((answer, index) => {
                        console.log(`Processing regular answer ${index + 1}:`, answer);
                        
                        // Find the student this answer belongs to
                        const sessionStudent = session.sessionRegularStudents.find(
                            srs => srs.id === answer.sessionRegularStudentId
                        );
                        
                        console.log('Found session student for regular answer:', sessionStudent);
                        
                        if (sessionStudent) {
                            if (!answers[sessionStudent.id]) {
                                answers[sessionStudent.id] = [];
                            }
                            
                            const answerData = {
                                id: answer.id,
                                questionNumber: answer.questionNumber || 1,
                                state: answer.state,
                                score: getAnswerStateInfo(answer.state).score
                            };
                            
                            answers[sessionStudent.id].push(answerData);
                            
                            // Track max question number to set next question number
                            maxQuestionNumber = Math.max(maxQuestionNumber, answerData.questionNumber);
                            
                            console.log(`Added regular answer for student ${sessionStudent.id}:`, answerData);
                        } else {
                            console.log('No session student found for regular answer:', answer);
                        }
                    });
                    
                    // Sort answers by question number for each student
                    Object.keys(answers).forEach(studentId => {
                        answers[studentId].sort((a, b) => a.questionNumber - b.questionNumber);
                    });
                    
                    console.log('Final processed regular answers:', answers);
                    setRegularStudentAnswers(answers);
                    setNextQuestionNumber(maxQuestionNumber + 1);
                } else {
                    console.log('No regular answers found in response');
                }
                
            } catch (error) {
                console.error('Error loading existing regular answers:', error);
                console.error('Error details:', error.response?.data);
            } finally {
                setLoadingAnswers(false);
            }
        };

        loadExistingRegularAnswers();
    }, [session, currentState]);

     const initializeAssignments = (state, students) => {
            const assignments = {};
            const unassigned = [];
            
            students.forEach(sessionStudent => {
                const tableId = sessionStudent.tableNumber;
                if (tableId && tableId > 0) {
                    if (!assignments[tableId]) {
                        assignments[tableId] = [];
                    }
                    assignments[tableId].push(sessionStudent);
                } else {
                    unassigned.push(sessionStudent);
                }
            });
            
            if (state === 'Regular') {
                setRegularAssignments(assignments);
                setRegularUnassigned(unassigned);
            } else {
                setHomeworkAssignments(assignments);
                setHomeworkUnassigned(unassigned);
            }
        };

        const handleStateChange = (value) => {
            setCurrentState(value);
            setSelectedQuestion(null);
            setSelectedStudent(null);
        };

        // Drag and Drop handlers
        const handleDragStart = (e, student) => {
            setDraggedStudent(student);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
            e.target.style.opacity = '0.5';
        };

        const handleDragEnd = (e) => {
            e.target.style.opacity = '1';
            setDraggedStudent(null);
            setDragOverTable(null);
        };

        const handleDragOver = (e, tableId) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverTable(tableId);
        };

        const handleDragLeave = (e) => {
            // Only clear drag over if we're leaving the table entirely
            if (!e.currentTarget.contains(e.relatedTarget)) {
                setDragOverTable(null);
            }
        };

        const handleDrop = (e, tableId) => {
            e.preventDefault();
            setDragOverTable(null);
            
            if (!draggedStudent) return;

            // Update assignments based on current state
            if (currentState === 'Homework') {
                setHomeworkAssignments(prev => {
                    const newAssignments = { ...prev };
                    
                    // Remove student from current table
                    Object.keys(newAssignments).forEach(tId => {
                        newAssignments[tId] = newAssignments[tId].filter(s => s.id !== draggedStudent.id);
                    });
                    
                    // Add to new table
                    if (!newAssignments[tableId]) {
                        newAssignments[tableId] = [];
                    }
                    newAssignments[tableId].push(draggedStudent);
                    
                    return newAssignments;
                });
                
                // Remove from unassigned
                setHomeworkUnassigned(prev => prev.filter(s => s.id !== draggedStudent.id));
            } else {
                setRegularAssignments(prev => {
                    const newAssignments = { ...prev };
                    
                    // Remove student from current table
                    Object.keys(newAssignments).forEach(tId => {
                        newAssignments[tId] = newAssignments[tId].filter(s => s.id !== draggedStudent.id);
                    });
                    
                    // Add to new table
                    if (!newAssignments[tableId]) {
                        newAssignments[tableId] = [];
                    }
                    newAssignments[tableId].push(draggedStudent);
                    
                    return newAssignments;
                });
                
                // Remove from unassigned
                setRegularUnassigned(prev => prev.filter(s => s.id !== draggedStudent.id));
            }

            message.success(`${draggedStudent.student?.fullName || 'Студент'} призначений до столу ${tableId}`);
        };

        const handleRemoveFromTable = (student, tableId) => {
            if (currentState === 'Homework') {
                setHomeworkAssignments(prev => {
                    const newAssignments = { ...prev };
                    newAssignments[tableId] = newAssignments[tableId].filter(s => s.id !== student.id);
                    return newAssignments;
                });
                setHomeworkUnassigned(prev => [...prev, student]);
            } else {
                setRegularAssignments(prev => {
                    const newAssignments = { ...prev };
                    newAssignments[tableId] = newAssignments[tableId].filter(s => s.id !== student.id);
                    return newAssignments;
                });
                setRegularUnassigned(prev => [...prev, student]);
            }
        };

        const handleAutoAssignment = () => {
            Modal.confirm({
                title: 'Автоматичне призначення',
                content: `Ви впевнені, що хочете автоматично розподілити всіх студентів по столах для режиму "${currentState === 'Homework' ? 'Домашня робота' : 'Звичайна сесія'}"? Поточні призначення будуть скинуті.`,
                okText: 'Так, розподілити',
                cancelText: 'Скасувати',
                onOk: () => {
                    setAssignmentLoading(true);
                    
                    setTimeout(() => {
                        const allStudents = [...currentStudents];
                        const totalTables = tableStructure.reduce((sum, row) => sum + row.tables.length, 0);
                        
                        if (totalTables === 0) {
                            message.error('Немає доступних столів для призначення');
                            setAssignmentLoading(false);
                            return;
                        }
                        
                        // Shuffle students randomly
                        const shuffledStudents = [...allStudents].sort(() => Math.random() - 0.5);
                        
                        // Calculate students per table
                        const studentsPerTable = Math.floor(shuffledStudents.length / totalTables);
                        const remainder = shuffledStudents.length % totalTables;
                        
                        const newAssignments = {};
                        let studentIndex = 0;
                        
                        // Assign students to tables
                        tableStructure.forEach(row => {
                            row.tables.forEach((table, tableIndexInRow) => {
                                const tableId = table.id;
                                newAssignments[tableId] = [];
                                
                                // Assign base number of students
                                for (let i = 0; i < studentsPerTable; i++) {
                                    if (studentIndex < shuffledStudents.length) {
                                        newAssignments[tableId].push(shuffledStudents[studentIndex]);
                                        studentIndex++;
                                    }
                                }
                                
                                // Distribute remainder students to first tables
                                if (tableIndexInRow < remainder && studentIndex < shuffledStudents.length) {
                                    newAssignments[tableId].push(shuffledStudents[studentIndex]);
                                    studentIndex++;
                                }
                            });
                        });
                        
                        // Update assignments based on current state
                        if (currentState === 'Homework') {
                            setHomeworkAssignments(newAssignments);
                            setHomeworkUnassigned([]);
                        } else {
                            setRegularAssignments(newAssignments);
                            setRegularUnassigned([]);
                        }
                        
                        setAssignmentLoading(false);
                        message.success(`Студентів автоматично розподілено по ${totalTables} столах (${currentState === 'Homework' ? 'Домашня робота' : 'Звичайна сесія'})`);
                    }, 500);
                }
            });
        };

        const renderTable = (table, studentsAtTable = []) => {
            const isDragOver = dragOverTable === table.id;
            
            return (
                <Card
                    key={table.id}
                    size="small"
                    title={
                        <Space>
                            <Text strong>Стіл {table.id}</Text>
                            <Badge count={studentsAtTable.length} style={{ backgroundColor: '#52c41a' }} />
                        </Space>
                    }
                    extra={
                        studentsAtTable.length > 0 && (
                            <Tooltip title="Очистити стіл">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        studentsAtTable.forEach(student => {
                                            handleRemoveFromTable(student, table.id);
                                        });
                                    }}
                                />
                            </Tooltip>
                        )
                    }
                    style={{
                        minHeight: '120px',
                        border: isDragOver 
                            ? '2px solid #1890ff' 
                            : studentsAtTable.length > 0 
                                ? '2px solid #52c41a' 
                                : '1px solid #d9d9d9',
                        backgroundColor: isDragOver 
                            ? '#e6f7ff' 
                            : studentsAtTable.length > 0 
                                ? '#f6ffed' 
                                : '#fafafa',
                        transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: '8px' }}
                    onDragOver={(e) => handleDragOver(e, table.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, table.id)}
                >
                    {studentsAtTable.length > 0 ? (
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    {studentsAtTable.map(sessionStudent => {
                            const studentAnswerForQuestion = selectedQuestion ? 
                                studentAnswers[sessionStudent.id]?.[selectedQuestion.id] : null;
                            const answerStateInfo = studentAnswerForQuestion ? 
                                getAnswerStateInfo(studentAnswerForQuestion.state) : 
                                getAnswerStateInfo(0);
                                
                            // Debug logging for each student
                            if (selectedQuestion) {
                                console.log(`Student ${sessionStudent.student?.fullName} (${sessionStudent.id}) for question ${selectedQuestion.id}:`, {
                                    studentAnswerForQuestion,
                                    answerStateInfo,
                                    allStudentAnswers: studentAnswers[sessionStudent.id]
                                });
                            }
                                    
                                return (
                                    <div
                                        key={sessionStudent.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, sessionStudent)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedStudent(sessionStudent)}
                                        style={{
                                            padding: '4px 8px',
                                            backgroundColor: selectedStudent?.id === sessionStudent.id ? '#e6f7ff' : '#fff',
                                            border: selectedStudent?.id === sessionStudent.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedStudent?.id !== sessionStudent.id) {
                                                e.target.style.backgroundColor = '#f0f0f0';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedStudent?.id !== sessionStudent.id) {
                                                e.target.style.backgroundColor = '#fff';
                                            }
                                        }}
                                    >
                                        <Space>
                                            <DragOutlined style={{ color: '#999' }} />
                                            {currentState === 'Homework' && selectedQuestion && (
                                                <div style={{ color: answerStateInfo.color }}>
                                                    {answerStateInfo.icon}
                                                </div>
                                            )}
                                            <UserOutlined style={{ color: '#1890ff' }} />
                                            <Text style={{ fontSize: '12px' }}>
                                                {sessionStudent.student?.fullName || `Студент ${sessionStudent.studentId ? sessionStudent.studentId.toString().substring(0, 8) : 'ID'}...`}
                                            </Text>
                                        </Space>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFromTable(sessionStudent, table.id);
                                            }}
                                            style={{ color: '#ff4d4f' }}
                                        />
                                    </div>
                                );
                            })}
                        </Space>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            color: isDragOver ? '#1890ff' : '#999', 
                            padding: '20px 0',
                            border: isDragOver ? '2px dashed #1890ff' : '2px dashed #d9d9d9',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                        }}>
                            <Text type={isDragOver ? 'primary' : 'secondary'}>
                                {isDragOver ? 'Відпустіть студента тут' : 'Перетягніть студента сюди'}
                            </Text>
                        </div>
                    )}
                </Card>
            );
        };

        const renderHomeworkInterface = () => {
            return (
                <div>
                    <Row gutter={[24, 24]}>
                        {/* Questions Panel */}
                        <Col xs={24} lg={8}>
                            <Card title={`Питання (${questions.length})`} style={{ height: '70vh', overflow: 'auto' }}>
                                {questions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                        <QuestionCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                        <div>Питання не знайдено</div>
                                        <div style={{ fontSize: '12px' }}>Перевірте, чи має опитування питання</div>
                                    </div>
                                ) : (
                                    <List
                                        dataSource={questions}
                                        renderItem={(question, index) => (
                                        <List.Item
                                            onClick={() => setSelectedQuestion(question)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: selectedQuestion?.id === question.id ? '#e6f7ff' : 'transparent',
                                                border: selectedQuestion?.id === question.id ? '1px solid #1890ff' : '1px solid transparent',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar style={{ 
                                                        backgroundColor: selectedQuestion?.id === question.id ? '#1890ff' : '#f0f0f0',
                                                        color: selectedQuestion?.id === question.id ? '#fff' : '#666'
                                                    }}>
                                                        {index + 1}
                                                    </Avatar>
                                                }
                                                title={
                                                    <Text strong={selectedQuestion?.id === question.id}>
                                                        {question.name}
                                                    </Text>
                                                }
                                                description={
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {question.answer}
                                                    </Text>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                    />
                                )}
                            </Card>
                        </Col>

                        {/* Students and Controls Panel */}
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                {/* Control Panel */}
                                <Card>
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                                                                    <Space direction="vertical" size="small">
                                            <Text strong>
                                                Обране питання: {selectedQuestion ? selectedQuestion.name : 'Не обрано'}
                                            </Text>
                                            <Text>
                                                Обраний студент: {selectedStudent ? selectedStudent.student?.fullName : 'Не обрано'}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Завантажених відповідей: {Object.keys(studentAnswers).length} студентів
                                            </Text>
                                            <Space>
                                                <Tag color="green">F1 - Добре (1 бал)</Tag>
                                                <Tag color="orange">F2 - Нормально (0.5 бала)</Tag>
                                                <Tag color="red">F3 - Погано (0 балів)</Tag>
                                            </Space>
                                        </Space>
                                        </Col>
                                        <Col>
                                            <Button
                                                type="primary"
                                                icon={<SwapOutlined />}
                                                onClick={handleAutoAssignment}
                                                loading={assignmentLoading}
                                                disabled={currentStudents.length === 0}
                                            >
                                                Призначити автоматично
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Unassigned Students */}
                                {currentUnassigned.length > 0 && (
                                    <Card title="Не призначені студенти">
                                        <Row gutter={[8, 8]}>
                                                                                    {currentUnassigned.map(sessionStudent => {
                                            const studentAnswerForQuestion = selectedQuestion ? 
                                                studentAnswers[sessionStudent.id]?.[selectedQuestion.id] : null;
                                            const answerStateInfo = studentAnswerForQuestion ? 
                                                getAnswerStateInfo(studentAnswerForQuestion.state) : 
                                                getAnswerStateInfo(0);
                                                
                                            // Debug logging for unassigned students
                                            if (selectedQuestion) {
                                                console.log(`Unassigned student ${sessionStudent.student?.fullName} (${sessionStudent.id}) for question ${selectedQuestion.id}:`, {
                                                    studentAnswerForQuestion,
                                                    answerStateInfo,
                                                    allStudentAnswers: studentAnswers[sessionStudent.id]
                                                });
                                            }
                                                    
                                                return (
                                                    <Col key={sessionStudent.id}>
                                                        <div
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, sessionStudent)}
                                                            onDragEnd={handleDragEnd}
                                                            onClick={() => setSelectedStudent(sessionStudent)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <Button
                                                                size="small"
                                                                type={selectedStudent?.id === sessionStudent.id ? 'primary' : 'default'}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <DragOutlined />
                                                                {selectedQuestion && (
                                                                    <div style={{ color: answerStateInfo.color }}>
                                                                        {answerStateInfo.icon}
                                                                    </div>
                                                                )}
                                                                <UserOutlined />
                                                                {sessionStudent.student?.fullName || `Студент ${sessionStudent.studentId ? sessionStudent.studentId.toString().substring(0, 8) : 'ID'}...`}
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                💡 Перетягніть студентів на столи для призначення
                                            </Text>
                                        </div>
                                    </Card>
                                )}

                                {/* Tables Layout */}
                                <div>
                                    {tableStructure.map(row => (
                                        <div key={row.rowNumber} style={{ marginBottom: '16px' }}>
                                            <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
                                                Ряд {row.rowNumber}
                                            </Text>
                                            <Row gutter={[16, 16]}>
                                                {row.tables.map(table => (
                                                    <Col 
                                                        key={table.id} 
                                                        xs={24} 
                                                        sm={12} 
                                                        md={8} 
                                                        lg={6} 
                                                        xl={Math.floor(24 / row.tables.length)}
                                                    >
                                                        {renderTable(table, currentAssignments[table.id] || [])}
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    ))}
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </div>
            );
        };

            const renderStateContent = () => {
        if (currentState === 'Homework') {
            return (
                <div>
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <Space direction="vertical" size="small">
                            <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                            <Title level={4} style={{ margin: 0 }}>Режим домашньої роботи</Title>
                            <Text type="secondary">
                                Опитування: {session?.questionnaire?.name || 'Завантаження...'}
                            </Text>
                        </Space>
                    </div>
                    {renderHomeworkInterface()}
                </div>
            );
        } else {
            return (
                <div>
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <Space direction="vertical" size="small">
                            <BookOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                            <Title level={4} style={{ margin: 0 }}>Звичайний режим</Title>
                        </Space>
                    </div>
                    {renderRegularInterface()}
                </div>
            );
        }
    };

    const renderRegularInterface = () => {
        const calculateStudentStats = (studentId) => {
            const studentAnswers = regularStudentAnswers[studentId] || [];
            const totalScore = studentAnswers.reduce((sum, answer) => sum + answer.score, 0);
            const totalQuestions = studentAnswers.length;
            const maxPossibleScore = totalQuestions * 1.0; // Each question can be max 1 point
            const efficiency = totalQuestions > 0 ? ((totalScore / maxPossibleScore) * 100).toFixed(1) : 0;
            
            return { totalScore, totalQuestions, efficiency };
        };

        return (
            <div>
                <Row gutter={[24, 24]}>
                    {/* Student Selection and Answers Panel */}
                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Control Panel */}
                            <Card>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text strong>
                                        Обраний студент: {selectedStudent ? selectedStudent.student?.fullName : 'Не обрано'}
                                    </Text>
                                    <Text type="secondary">
                                        Наступне питання: №{nextQuestionNumber}
                                    </Text>
                                    <Space>
                                        <Tag color="green">F1 - Добре (1 бал)</Tag>
                                        <Tag color="orange">F2 - Нормально (0.5 бала)</Tag>
                                        <Tag color="red">F3 - Погано (0 балів)</Tag>
                                    </Space>
                                </Space>
                            </Card>

                            {/* Student Answers Display */}
                            {selectedStudent && (
                                <Card title={`Відповіді студента: ${selectedStudent.student?.fullName || 'Невідомий'}`}>
                                    {(() => {
                                        const studentAnswers = regularStudentAnswers[selectedStudent.id] || [];
                                        const stats = calculateStudentStats(selectedStudent.id);
                                        
                                        return (
                                            <div>
                                                {studentAnswers.length > 0 ? (
                                                    <div>
                                                        <List
                                                            dataSource={studentAnswers}
                                                            renderItem={(answer) => {
                                                                const stateInfo = getAnswerStateInfo(answer.state);
                                                                return (
                                                                    <List.Item style={{ padding: '8px 0' }}>
                                                                                                                                <Space>
                                                            <Text strong>Відповідь</Text>
                                                            <div 
                                                                style={{ 
                                                                    width: '12px', 
                                                                    height: '12px', 
                                                                    borderRadius: '50%', 
                                                                    backgroundColor: stateInfo.color 
                                                                }} 
                                                            />
                                                            <Text>{answer.score} {answer.score === 1 ? 'бал' : answer.score === 0 ? 'балів' : 'бала'}</Text>
                                                        </Space>
                                                                    </List.Item>
                                                                );
                                                            }}
                                                        />
                                                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                                            <Row justify="space-between">
                                                                <Col>
                                                                    <Text strong>Загальний рахунок: {stats.totalScore} / {stats.totalQuestions}</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text strong style={{ color: stats.efficiency >= 70 ? '#52c41a' : stats.efficiency >= 50 ? '#faad14' : '#ff4d4f' }}>
                                                                        Ефективність: {stats.efficiency}%
                                                                    </Text>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                                        <QuestionCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                                        <div>Студент ще не відповідав на питання</div>
                                                        <div style={{ fontSize: '12px' }}>Натисніть F1, F2 або F3 для оцінки відповіді</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </Card>
                            )}
                        </Space>
                    </Col>

                    {/* Tables and Student Assignment Panel */}
                    <Col xs={24} lg={12}>
                        {renderTablesLayout()}
                    </Col>
                </Row>
            </div>
        );
    };

    const renderTablesLayout = () => {
            return (
                <div>
                    {/* Control Panel */}
                    <Card style={{ marginBottom: '16px' }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Space>
                                    <TeamOutlined style={{ color: '#1890ff' }} />
                                    <Text strong>
                                        Студентів: {currentStudents.length} | 
                                        Не призначено: {currentUnassigned.length} | 
                                        Столів: {tableStructure.reduce((sum, row) => sum + row.tables.length, 0)} |
                                        Режим: <Text type={currentState === 'Homework' ? 'primary' : 'success'}>
                                            {currentState === 'Homework' ? 'Домашня робота' : 'Звичайна сесія'}
                                        </Text>
                                    </Text>
                                </Space>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<SwapOutlined />}
                                    onClick={handleAutoAssignment}
                                    loading={assignmentLoading}
                                    disabled={currentStudents.length === 0}
                                >
                                    Призначити автоматично
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Unassigned Students */}
                    {currentUnassigned.length > 0 && (
                        <Card title="Не призначені студенти" style={{ marginBottom: '16px' }}>
                            <Row gutter={[8, 8]}>
                                {currentUnassigned.map(sessionStudent => (
                                    <Col key={sessionStudent.id}>
                                        <div
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, sessionStudent)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setSelectedStudent(sessionStudent)}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                icon={<DragOutlined />}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    backgroundColor: selectedStudent?.id === sessionStudent.id ? '#e6f7ff' : undefined,
                                                    border: selectedStudent?.id === sessionStudent.id ? '2px solid #1890ff' : undefined
                                                }}
                                            >
                                                <UserOutlined />
                                                {sessionStudent.student?.fullName || `Студент ${sessionStudent.studentId ? sessionStudent.studentId.toString().substring(0, 8) : 'ID'}...`}
                                            </Button>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    💡 Перетягніть студентів на столи для призначення
                                </Text>
                            </div>
                        </Card>
                    )}

                    {/* Tables Layout */}
                    <div>
                        {tableStructure.map(row => (
                            <div key={row.rowNumber} style={{ marginBottom: '16px' }}>
                                <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
                                    Ряд {row.rowNumber}
                                </Text>
                                <Row gutter={[16, 16]}>
                                    {row.tables.map(table => (
                                        <Col 
                                            key={table.id} 
                                            xs={24} 
                                            sm={12} 
                                            md={8} 
                                            lg={6} 
                                            xl={Math.floor(24 / row.tables.length)}
                                        >
                                            {renderTable(table, currentAssignments[table.id] || [])}
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        if (loading) {
            return (
                <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{ maxWidth: 400, textAlign: 'center' }}>
                        <Space direction="vertical" size="large">
                            <Spin size="large" />
                            <Text>Завантаження сесії...</Text>
                        </Space>
                    </Card>
                </div>
            );
        }

        if (error) {
            return (
                <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{ maxWidth: 500, textAlign: 'center' }}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <ExclamationCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
                            <Title level={2} type="danger">Помилка</Title>
                            <Alert
                                message={error}
                                description={`Перенаправлення на головну сторінку через ${countdown} секунд...`}
                                type="error"
                                showIcon
                            />
                            <Text type="secondary">
                                ID сесії: {id}
                            </Text>
                        </Space>
                    </Card>
                </div>
            );
        }

        const hasQuestionnaire = session?.questionnaireId;

        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
                {/* Top Header with Session Info and State Switcher */}
                <div style={{ 
                    backgroundColor: '#fff', 
                    padding: '16px 24px', 
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Left side - Session Info */}
                    <Space>
                        <PlayCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {session?.name || 'Назва сесії'}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                ID: {id}
                            </Text>
                        </div>
                    </Space>

                    {/* Right side - State Switcher (only if questionnaire exists) */}
                    {hasQuestionnaire && (
                        <Segmented
                            value={currentState}
                            onChange={handleStateChange}
                            options={[
                                {
                                    label: (
                                        <Space>
                                            <FileTextOutlined />
                                            Домашня робота
                                        </Space>
                                    ),
                                    value: 'Homework'
                                },
                                {
                                    label: (
                                        <Space>
                                            <BookOutlined />
                                            Звичайна сесія
                                        </Space>
                                    ),
                                    value: 'Regular'
                                }
                            ]}
                            size="large"
                        />
                    )}
                    
                    {/* Show current state for regular sessions */}
                    {!hasQuestionnaire && (
                        <Space>
                            <BookOutlined style={{ color: '#52c41a' }} />
                            <Text strong>Звичайна сесія</Text>
                        </Space>
                    )}
                </div>

                {/* Main Content Area */}
                <div style={{ padding: '24px' }}>
                    <Card style={{ minHeight: '70vh' }}>
                        {renderStateContent()}
                    </Card>
                </div>
            </div>
        );
    };

export default SessionPage; 