import React, { useState, useEffect } from 'react';
import './PublicShowcasePage.css';
import { sessionHomeworkAnswersApi } from '../../services/sessionHomeworkAnswersApi';
import { sessionRegularAnswersApi } from '../../services/sessionRegularAnswersApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';

// Custom components that don't use Ant Design to avoid theme interference
const IsolatedCard = ({ children, className = '', style = {} }) => (
    <div 
        className={`isolated-card ${className}`}
        style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            ...style
        }}
    >
        {children}
    </div>
);

const IsolatedTitle = ({ level = 2, children, style = {} }) => {
    const Tag = `h${level}`;
    return (
        <Tag style={{
            margin: '0 0 16px 0',
            color: '#1a1a1a',
            fontWeight: '700',
            fontSize: level === 1 ? '32px' : level === 2 ? '24px' : '20px',
            ...style
        }}>
            {children}
        </Tag>
    );
};

const IsolatedText = ({ type = 'default', children, style = {} }) => {
    const getColor = () => {
        switch (type) {
            case 'secondary': return '#666666';
            case 'white': return '#ffffff';
            case 'large': return '#1a1a1a';
            default: return '#1a1a1a';
        }
    };

    return (
        <span style={{
            color: getColor(),
            fontSize: type === 'large' ? '16px' : '14px',
            fontWeight: type === 'large' ? '600' : '400',
            ...style
        }}>
            {children}
        </span>
    );
};

const IsolatedTag = ({ children, color = 'default', style = {} }) => (
    <span style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        background: color === 'warning' ? '#faad14' : '#f0f0f0',
        color: color === 'warning' ? 'white' : '#1a1a1a',
        ...style
    }}>
        {children}
    </span>
);

const IsolatedAvatar = ({ children, style = {} }) => (
    <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#1890ff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '600',
        ...style
    }}>
        {children}
    </div>
);

const IsolatedProgress = ({ percent = 0, strokeColor = '#1890ff', style = {} }) => (
    <div style={{
        width: '100%',
        height: '8px',
        background: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden',
        ...style
    }}>
        <div style={{
            width: `${percent}%`,
            height: '100%',
            background: strokeColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
        }} />
    </div>
);

const IsolatedSpin = ({ size = 'default' }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: size === 'large' ? '200px' : '100px'
    }}>
        <div style={{
            width: size === 'large' ? '40px' : '20px',
            height: size === 'large' ? '40px' : '20px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
        }} />
    </div>
);

const PublicShowcasePageIsolated = () => {
    const [students, setStudents] = useState([]);
    const [studentScores, setStudentScores] = useState({});
    const [brandData, setBrandData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [animatingStudents, setAnimatingStudents] = useState(new Set());
    const [animatingBrands, setAnimatingBrands] = useState(new Set());

    // Use the brands/groups/students hook
    const {
        brands,
        groups,
        students: hookStudents,
        loading: brandsGroupsLoading
    } = useBrandsGroupsStudents();

    // Add CSS animation for spinner and responsive grid
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.7;
                    transform: scale(1.05);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            @keyframes brandUpdate {
                0% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                50% { transform: scale(1.02); box-shadow: 0 8px 24px rgba(255,215,0,0.3); }
                100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            }
            @keyframes studentUpdate {
                0% { background-color: inherit; }
                50% { background-color: #fff7e6; }
                100% { background-color: inherit; }
            }
            
            /* Responsive grid adjustments */
            @media (max-width: 1400px) {
                .showcase-teams-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
            }
            @media (max-width: 1000px) {
                .showcase-teams-grid {
                    grid-template-columns: 1fr !important;
                }
                .showcase-teams-grid .brand-showcase-card {
                    max-width: 600px;
                    margin: 0 auto;
                }
            }
            @media (max-width: 600px) {
                .showcase-teams-grid {
                    gap: 16px !important;
                }
                .showcase-teams-grid .brand-showcase-card {
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Helper function to get answer state score
    const getAnswerStateScore = (state) => {
        switch (state) {
            case 1: case '1': case 'Green': case 'green':
                return 1.0;
            case 3: case '3': case 'Yellow': case 'yellow':
                return 0.5;
            case 2: case '2': case 'Red': case 'red':
                return 0.0;
            case 0: case '0': case 'None': case 'none':
            default:
                return 0.0;
        }
    };

    // Build brand showcase data
    const buildBrandShowcaseData = (studentsData, scoresData) => {
        const brandShowcase = {};
        
        if (!studentsData || studentsData.length === 0) {
            return brandShowcase;
        }
        
        studentsData.forEach(student => {
            // Get brand and group info from student object
            let brandId = student.brandId;
            let brandName = 'Unknown Brand';
            
            // Get brand info - prioritize student.group.brand since that has the data
            if (student.group?.brand?.name) {
                brandName = student.group.brand.name;
                brandId = student.group.brand.id;
            }
            else if (student.brand?.name) {
                brandName = student.brand.name;
                brandId = student.brand.id || brandId;
            }
            else if (brandId && brands) {
                const brand = brands.find(b => b.id === brandId);
                if (brand) {
                    brandName = brand.name;
                }
            }
            
            const finalBrandId = brandId || 'unknown-brand';
            
            if (!brandShowcase[finalBrandId]) {
                brandShowcase[finalBrandId] = {
                    id: finalBrandId,
                    name: brandName,
                    students: [],
                    totalScore: 0,
                    totalQuestions: 0,
                    averageEfficiency: 0,
                    studentsWithScores: 0
                };
            }
            
            // Add student data
            const studentData = scoresData[student.id];
            if (studentData) {
                const homeworkScore = studentData.homeworkScore || 0;
                const regularScore = studentData.regularScore || 0;
                const homeworkQuestions = studentData.homeworkTotalQuestions || 0;
                const regularQuestions = studentData.regularTotalQuestions || 0;
                
                const totalScore = homeworkScore + regularScore;
                const totalQuestions = homeworkQuestions + regularQuestions;
                const efficiency = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
                
                brandShowcase[finalBrandId].students.push({
                    id: student.id,
                    fullName: student.fullName,
                    totalScore: totalScore,
                    totalQuestions: totalQuestions,
                    efficiency: efficiency,
                    homeworkScore: homeworkScore,
                    regularScore: regularScore,
                    homeworkQuestions: homeworkQuestions,
                    regularQuestions: regularQuestions
                });
                
                brandShowcase[finalBrandId].totalScore += totalScore;
                brandShowcase[finalBrandId].totalQuestions += totalQuestions;
                brandShowcase[finalBrandId].studentsWithScores += 1;
            }
        });
        
        // Calculate averages for each brand
        Object.values(brandShowcase).forEach(brand => {
            if (brand.studentsWithScores > 0) {
                brand.averageEfficiency = Math.round((brand.totalScore / brand.totalQuestions) * 100);
            }
            
            // Sort students by efficiency
            brand.students.sort((a, b) => b.efficiency - a.efficiency);
        });
        
        return brandShowcase;
    };

    // Calculate student scores
    const calculateStudentScores = async () => {
        if (!hookStudents || hookStudents.length === 0) return;

        console.log('Starting to calculate scores for', hookStudents.length, 'students');
        
        try {
            // Get all homework and regular answers
            const [homeworkAnswersResponse, regularAnswersResponse] = await Promise.all([
                sessionHomeworkAnswersApi.getAllSessionHomeworkAnswers(1, 10000),
                sessionRegularAnswersApi.getAllSessionRegularAnswers(1, 10000)
            ]);

            console.log('Homework answers count:', homeworkAnswersResponse?.items?.length || 0);
            console.log('Regular answers count:', regularAnswersResponse?.items?.length || 0);
            
            const scores = {};

            // Calculate scores for each student
            hookStudents.forEach(student => {
                console.log(`Processing student: ${student.fullName} (${student.id})`);
                
                // Find homework answers for this student
                const studentHomeworkAnswers = homeworkAnswersResponse?.items?.filter(answer => 
                    answer.sessionHomeworkStudent?.studentId === student.id
                ) || [];
                
                // Find regular answers for this student
                const studentRegularAnswers = regularAnswersResponse?.items?.filter(answer => 
                    answer.sessionRegularStudent?.studentId === student.id
                ) || [];
                
                console.log(`Student ${student.fullName}: ${studentHomeworkAnswers.length} homework, ${studentRegularAnswers.length} regular answers`);

                // Calculate homework scores
                const homeworkTotalScore = studentHomeworkAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const homeworkTotalQuestions = studentHomeworkAnswers.length;
                const homeworkEfficiency = homeworkTotalQuestions > 0 ? 
                    ((homeworkTotalScore / homeworkTotalQuestions) * 100) : 0;

                // Calculate regular scores
                const regularTotalScore = studentRegularAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const regularTotalQuestions = studentRegularAnswers.length;
                const regularEfficiency = regularTotalQuestions > 0 ? 
                    ((regularTotalScore / regularTotalQuestions) * 100) : 0;

                scores[student.id] = {
                    homeworkScore: homeworkTotalScore,
                    homeworkTotalQuestions,
                    homeworkEfficiency: homeworkEfficiency.toFixed(1),
                    regularScore: regularTotalScore,
                    regularTotalQuestions,
                    regularEfficiency: regularEfficiency.toFixed(1)
                };

                console.log(`Student ${student.fullName} scores:`, scores[student.id]);
            });

            setStudentScores(scores);
            console.log('Scores calculation completed');

        } catch (error) {
            console.error('Error calculating student scores:', error);
        }
    };

    // Load data when students change
    useEffect(() => {
        if (hookStudents && hookStudents.length > 0) {
            calculateStudentScores();
        }
    }, [hookStudents]);

    // Build brand showcase data when scores are calculated
    useEffect(() => {
        if (Object.keys(studentScores).length > 0 && hookStudents) {
            const brandShowcaseData = buildBrandShowcaseData(hookStudents, studentScores);
            
            // Sort brands by average efficiency
            const sortedBrands = Object.values(brandShowcaseData)
                .filter(brand => brand.studentsWithScores > 0)
                .sort((a, b) => b.averageEfficiency - a.averageEfficiency);
            
            // Convert back to object with sorted order
            const sortedBrandData = {};
            sortedBrands.forEach(brand => {
                sortedBrandData[brand.id] = brand;
            });
            
            setBrandData(sortedBrandData);
            setStudents(hookStudents);
            setLastUpdated(new Date());
            setLoading(false);
            
            console.log('Brand showcase data built:', sortedBrandData);
        }
    }, [studentScores, hookStudents]);

    // Set loading state
    useEffect(() => {
        setLoading(brandsGroupsLoading || (hookStudents && hookStudents.length > 0 && Object.keys(studentScores).length === 0));
    }, [brandsGroupsLoading, hookStudents, studentScores]);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (hookStudents && hookStudents.length > 0) {
                calculateStudentScores();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [hookStudents]);

    if (loading) {
        return (
            <div className="public-showcase showcase-loading">
                <div className="loading-content">
                    <IsolatedTitle level={2} style={{ color: 'white', marginBottom: '20px' }}>
                        🏆 Завантаження даних...
                    </IsolatedTitle>
                    <IsolatedSpin size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-showcase showcase-error">
                <IsolatedTitle level={2} style={{ color: 'white', marginBottom: '20px' }}>
                    ⚠️ Помилка завантаження
                </IsolatedTitle>
                <IsolatedText type="white" style={{ fontSize: '18px', marginBottom: '20px' }}>
                    {error}
                </IsolatedText>
                <IsolatedText type="white" style={{ fontSize: '14px', opacity: 0.8 }}>
                    Спробуйте оновити сторінку або зверніться до адміністратора
                </IsolatedText>
            </div>
        );
    }

    return (
        <div className="public-showcase">
            {/* Header */}
            <div className="showcase-header">
                <div className="header-content">
                    <div style={{ fontSize: '48px', color: '#faad14', textShadow: '0 0 20px rgba(250, 173, 20, 0.5)' }}>
                        🏆
                    </div>
                    <div>
                        <IsolatedTitle level={2} style={{ color: 'white', fontSize: '36px', margin: 0 }}>
                            Публічна вітрина успіхів
                        </IsolatedTitle>
                        <IsolatedText type="white" style={{ fontSize: '16px', opacity: 0.8, marginLeft: '20px' }}>
                            Досягнення наших студентів
                            {Object.keys(brandData).length > 0 && (
                                <span style={{ marginLeft: '16px', fontSize: '14px', opacity: 0.7 }}>
                                    • {Object.keys(brandData).length} команд у змаганні
                                </span>
                            )}
                        </IsolatedText>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#ff4d4f',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }} />
                    <IsolatedText type="white" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        LIVE
                    </IsolatedText>
                </div>
            </div>

            {/* Content */}
            <div className="showcase-content">
                {Object.keys(brandData).length === 0 ? (
                    <IsolatedCard style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
                        <IsolatedTitle level={3} style={{ marginBottom: '16px', color: '#666666' }}>
                            Немає даних для відображення
                        </IsolatedTitle>
                        <IsolatedText type="secondary" style={{ fontSize: '16px' }}>
                            Дані з'являться після того, як студенти почнуть відповідати на питання
                        </IsolatedText>
                    </IsolatedCard>
                ) : (
                    <div 
                        className="showcase-teams-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                            gap: '24px',
                            alignItems: 'start'
                        }}
                    >
                        {Object.values(brandData).map((brand, index) => (
                            <IsolatedCard 
                                key={brand.id}
                                className={`brand-showcase-card ${index === 0 ? 'top-brand' : ''}`}
                                style={{ 
                                    marginBottom: '0',
                                    height: 'fit-content',
                                    animation: animatingBrands.has(brand.id) ? 'brandUpdate 3s ease-in-out' : 'none'
                                }}
                            >
                                {/* Brand Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <IsolatedTitle level={3}>{brand.name}</IsolatedTitle>
                                        {index === 0 && <span style={{ color: '#faad14', fontSize: '24px' }}>👑</span>}
                                        {brand.averageEfficiency >= 90 && <span style={{ color: '#ff4d4f', fontSize: '20px' }}>🔥</span>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <IsolatedTag 
                                            color={index === 0 ? 'warning' : index === 1 ? 'default' : 'default'}
                                            style={{ 
                                                fontSize: '16px', 
                                                padding: '4px 12px',
                                                background: index === 0 ? 'linear-gradient(135deg, #faad14, #ffd666)' : 
                                                           index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' :
                                                           index === 2 ? 'linear-gradient(135deg, #cd7f32, #daa560)' : '#fafafa',
                                                color: index <= 2 ? 'white' : '#000000',
                                                border: 'none'
                                            }}
                                        >
                                            #{index + 1} місце
                                        </IsolatedTag>
                                        <IsolatedText type="secondary" style={{ fontSize: '12px' }}>
                                            ({brand.students.length} студентів)
                                        </IsolatedText>
                                    </div>
                                </div>

                                {/* Students */}
                                <div style={{ marginBottom: '20px' }}>
                                    {brand.students.length === 0 ? (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '20px', 
                                            background: '#f9f9f9', 
                                            borderRadius: '8px',
                                            color: '#666666'
                                        }}>
                                            <IsolatedText type="secondary">
                                                Немає студентів з результатами
                                            </IsolatedText>
                                        </div>
                                    ) : (
                                        brand.students.map((student, studentIndex) => (
                                            <div 
                                                key={student.id}
                                                className={`student-row ${studentIndex === 0 ? 'top-student' : ''}`}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '16px',
                                                    marginBottom: '12px',
                                                    background: studentIndex === 0 ? 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)' : '#fafafa',
                                                    borderRadius: '12px',
                                                    border: studentIndex === 0 ? '2px solid #faad14' : '2px solid transparent',
                                                    transition: 'all 0.3s ease',
                                                    animation: animatingStudents.has(student.id) ? 'studentUpdate 3s ease-in-out' : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <IsolatedAvatar style={{
                                                        background: studentIndex === 0 ? '#faad14' : '#1890ff'
                                                    }}>
                                                        {student.fullName.charAt(0)}
                                                    </IsolatedAvatar>
                                                    <div>
                                                        <IsolatedText type="large" style={{ display: 'block' }}>
                                                            {student.fullName}
                                                            {studentIndex === 0 && <span style={{ color: '#faad14', marginLeft: '8px' }}>⭐</span>}
                                                            {student.efficiency >= 95 && <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>🔥</span>}
                                                        </IsolatedText>
                                                        <IsolatedText type="secondary" style={{ fontSize: '12px' }}>
                                                            Д/З: {student.homeworkScore}/{student.homeworkQuestions} • 
                                                            Заняття: {student.regularScore}/{student.regularQuestions}
                                                        </IsolatedText>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                                        <IsolatedText type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                                                            Загальний бал
                                                        </IsolatedText>
                                                        <IsolatedText type="large" style={{ display: 'block' }}>
                                                            {student.totalScore} / {student.totalQuestions}
                                                        </IsolatedText>
                                                    </div>
                                                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                                        <IsolatedText type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                                                            Ефективність
                                                        </IsolatedText>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <IsolatedProgress 
                                                                percent={student.efficiency}
                                                                strokeColor={student.efficiency >= 80 ? '#52c41a' : student.efficiency >= 60 ? '#faad14' : '#ff4d4f'}
                                                                style={{ flex: 1, minWidth: '80px' }}
                                                            />
                                                            <IsolatedText 
                                                                style={{ 
                                                                    fontSize: '14px', 
                                                                    fontWeight: '700',
                                                                    color: student.efficiency >= 80 ? '#52c41a' : student.efficiency >= 60 ? '#faad14' : '#ff4d4f',
                                                                    minWidth: '50px',
                                                                    textAlign: 'right'
                                                                }}
                                                            >
                                                                {student.efficiency}%
                                                            </IsolatedText>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Brand Totals */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '2px solid #e8e8e8'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontSize: '24px', color: '#faad14' }}>🏆</div>
                                            <div>
                                                <IsolatedText type="secondary" style={{ display: 'block', fontSize: '14px' }}>
                                                    Загальний результат бренду
                                                </IsolatedText>
                                                <IsolatedText type="large" style={{ display: 'block', fontSize: '20px' }}>
                                                    {brand.totalScore} / {brand.totalQuestions}
                                                </IsolatedText>
                                                <IsolatedText type="secondary" style={{ fontSize: '12px' }}>
                                                    Студентів з результатами: {brand.studentsWithScores}
                                                </IsolatedText>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <IsolatedText type="secondary" style={{ display: 'block', fontSize: '14px' }}>
                                                Середня ефективність
                                            </IsolatedText>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                                <IsolatedProgress 
                                                    percent={brand.averageEfficiency}
                                                    strokeColor={brand.averageEfficiency >= 80 ? '#52c41a' : brand.averageEfficiency >= 60 ? '#faad14' : '#ff4d4f'}
                                                    style={{ flex: 1, minWidth: '100px' }}
                                                />
                                                <IsolatedText 
                                                    style={{ 
                                                        fontSize: '18px', 
                                                        fontWeight: '700',
                                                        color: brand.averageEfficiency >= 80 ? '#52c41a' : brand.averageEfficiency >= 60 ? '#faad14' : '#ff4d4f',
                                                        minWidth: '60px',
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    {brand.averageEfficiency}%
                                                </IsolatedText>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </IsolatedCard>
                        ))}
                    </div>
                )}

                {/* Last Updated Info */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <IsolatedText type="white" style={{ fontSize: '14px', opacity: 0.8 }}>
                        Останнє оновлення: {lastUpdated.toLocaleString("uk-UA")}
                    </IsolatedText>
                    <br />
                    <IsolatedText type="white" style={{ fontSize: '12px', opacity: 0.6 }}>
                        Дані оновлюються автоматично кожні 30 секунд
                    </IsolatedText>
                </div>
            </div>
        </div>
    );
};

export default PublicShowcasePageIsolated;
