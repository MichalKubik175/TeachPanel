import React, { useState, useEffect } from 'react';
import { 
    Typography, 
    Row, 
    Col, 
    Card, 
    Progress, 
    Space,
    Divider,
    Tag,
    Avatar
} from 'antd';
import { 
    TrophyOutlined, 
    UserOutlined, 
    CrownOutlined,
    FireOutlined,
    StarOutlined
} from '@ant-design/icons';
import { studentsApi } from '../../services/studentsApi';
import { sessionHomeworkAnswersApi } from '../../services/sessionHomeworkAnswersApi';
import { sessionRegularAnswersApi } from '../../services/sessionRegularAnswersApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import './PublicShowcasePage.css';
import './PublicShowcaseForceLight.css';

const { Title, Text } = Typography;

const PublicShowcasePage = () => {
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
        loading: brandsGroupsLoading
    } = useBrandsGroupsStudents();

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
            
            const studentScore = scoresData[student.id];
            const studentWithScore = {
                ...student,
                scores: studentScore || {
                    totalScore: 0,
                    totalQuestions: 0,
                    overallEfficiency: 0,
                    homeworkScore: 0,
                    regularScore: 0
                }
            };
            
            brandShowcase[finalBrandId].students.push(studentWithScore);
            
            // Calculate brand totals
            if (studentScore && studentScore.totalQuestions > 0) {
                brandShowcase[finalBrandId].totalScore += parseFloat(studentScore.totalScore);
                brandShowcase[finalBrandId].totalQuestions += studentScore.totalQuestions;
                brandShowcase[finalBrandId].studentsWithScores += 1;
            }
        });
        
        // Calculate average efficiency for each brand
        Object.values(brandShowcase).forEach(brand => {
            if (brand.totalQuestions > 0) {
                brand.averageEfficiency = ((brand.totalScore / brand.totalQuestions) * 100).toFixed(1);
            }
            
            // Sort students by efficiency (highest first)
            brand.students.sort((a, b) => {
                const aEff = parseFloat(a.scores?.overallEfficiency || 0);
                const bEff = parseFloat(b.scores?.overallEfficiency || 0);
                return bEff - aEff;
            });
        });
        
        return brandShowcase;
    };

    // Calculate scores for all students
    const calculateStudentScores = async () => {
        try {
            // Get all students
            const studentsResponse = await studentsApi.getAllStudents(1, 10000);
            const allStudents = studentsResponse.items || [];
            
            if (allStudents.length === 0) {
                setStudents([]);
                setStudentScores({});
                setBrandData({});
                return;
            }

            // Get all homework and regular answers
            const [homeworkAnswersResponse, regularAnswersResponse] = await Promise.all([
                sessionHomeworkAnswersApi.getAllSessionHomeworkAnswers(1, 10000),
                sessionRegularAnswersApi.getAllSessionRegularAnswers(1, 10000)
            ]);

            const scores = {};
            const previousScores = { ...studentScores };

            // Calculate scores for each student
            allStudents.forEach(student => {
                const studentHomeworkAnswers = homeworkAnswersResponse?.items?.filter(answer => 
                    answer.sessionHomeworkStudent?.studentId === student.id
                ) || [];

                const studentRegularAnswers = regularAnswersResponse?.items?.filter(answer => 
                    answer.sessionRegularStudent?.studentId === student.id
                ) || [];

                // Calculate scores
                const homeworkTotalScore = studentHomeworkAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const homeworkTotalQuestions = studentHomeworkAnswers.length;

                const regularTotalScore = studentRegularAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const regularTotalQuestions = studentRegularAnswers.length;

                const totalScore = homeworkTotalScore + regularTotalScore;
                const totalQuestions = homeworkTotalQuestions + regularTotalQuestions;
                const overallEfficiency = totalQuestions > 0 ? 
                    ((totalScore / (totalQuestions * 1.0)) * 100) : 0;

                scores[student.id] = {
                    homeworkScore: homeworkTotalScore,
                    homeworkTotalQuestions,
                    regularScore: regularTotalScore,
                    regularTotalQuestions,
                    totalScore: totalScore.toFixed(1),
                    totalQuestions,
                    overallEfficiency: overallEfficiency.toFixed(1)
                };

                // Check if score changed for animation
                const prevScore = previousScores[student.id];
                if (prevScore && (
                    prevScore.totalScore !== scores[student.id].totalScore ||
                    prevScore.overallEfficiency !== scores[student.id].overallEfficiency
                )) {
                    setAnimatingStudents(prev => new Set([...prev, student.id]));
                    setTimeout(() => {
                        setAnimatingStudents(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(student.id);
                            return newSet;
                        });
                    }, 3000);
                }
            });

            setStudents(allStudents);
            setStudentScores(scores);
            setLastUpdated(new Date());
            
            // Build brand showcase data
            const showcase = buildBrandShowcaseData(allStudents, scores);
            
            // Check for brand score changes
            Object.keys(showcase).forEach(brandId => {
                const prevBrand = brandData[brandId];
                const currentBrand = showcase[brandId];
                
                if (prevBrand && (
                    prevBrand.totalScore !== currentBrand.totalScore ||
                    prevBrand.averageEfficiency !== currentBrand.averageEfficiency
                )) {
                    setAnimatingBrands(prev => new Set([...prev, brandId]));
                    setTimeout(() => {
                        setAnimatingBrands(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(brandId);
                            return newSet;
                        });
                    }, 3000);
                }
            });
            
            setBrandData(showcase);

        } catch (error) {
            console.error('Error calculating student scores:', error);
            setError('Помилка при завантаженні результатів студентів');
        }
    };

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await calculateStudentScores();
            setLoading(false);
        };
        loadData();
    }, []);

    // Set up polling for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            calculateStudentScores();
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [studentScores, brandData]);

    if (loading || brandsGroupsLoading) {
        return (
            <div className="showcase-loading">
                <div className="loading-content">
                    <TrophyOutlined className="loading-icon" />
                    <Title level={2} style={{ color: 'white', marginTop: '20px' }}>
                        Завантаження результатів...
                    </Title>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="showcase-error">
                <Title level={2} style={{ color: '#ff4d4f' }}>
                    Помилка завантаження даних
                </Title>
                <Text style={{ color: 'white', fontSize: '18px' }}>{error}</Text>
            </div>
        );
    }

    const sortedBrands = Object.values(brandData).sort((a, b) => 
        parseFloat(b.averageEfficiency) - parseFloat(a.averageEfficiency)
    );

    return (
        <div className="public-showcase">
            {/* Header */}
            <div className="showcase-header">
                <div className="header-content">
                    <TrophyOutlined className="header-icon" />
                    <Title level={1} className="header-title">
                        Результати змагання
                    </Title>
                    <Text className="header-subtitle">
                        Останнє оновлення: {lastUpdated.toLocaleTimeString()}
                    </Text>
                </div>
                <div className="live-indicator">
                    <div className="live-dot"></div>
                    <Text className="live-text">LIVE</Text>
                </div>
            </div>

            {/* Brand Sections */}
            <div className="showcase-content">
                <Row gutter={[24, 24]}>
                    {sortedBrands.map((brand, brandIndex) => {
                        const isAnimating = animatingBrands.has(brand.id);
                        const isTopBrand = brandIndex === 0 && parseFloat(brand.averageEfficiency) > 0;
                        
                        return (
                            <Col xs={24} lg={12} key={brand.id}>
                                <Card 
                                    className={`brand-showcase-card ${isAnimating ? 'brand-update-animation' : ''} ${isTopBrand ? 'top-brand' : ''}`}
                                >
                                    {/* Brand Header */}
                                    <div className="brand-header">
                                        <Space>
                                            {isTopBrand && <CrownOutlined className="crown-icon" />}
                                            <Title level={2} className="brand-title">
                                                {brand.name}
                                            </Title>
                                            {isAnimating && <FireOutlined className="fire-icon" />}
                                        </Space>
                                        {brandIndex < 3 && (
                                            <Tag className={`rank-tag rank-${brandIndex + 1}`}>
                                                #{brandIndex + 1}
                                            </Tag>
                                        )}
                                    </div>

                                    {/* Students List */}
                                    <div className="students-section">
                                        {brand.students.map((student, index) => {
                                            const isStudentAnimating = animatingStudents.has(student.id);
                                            const efficiency = parseFloat(student.scores?.overallEfficiency || 0);
                                            const isTopStudent = index === 0 && efficiency > 0;
                                            
                                            let efficiencyColor = '#ff4d4f';
                                            if (efficiency >= 90) efficiencyColor = '#52c41a';
                                            else if (efficiency >= 80) efficiencyColor = '#faad14';
                                            else if (efficiency >= 60) efficiencyColor = '#fa8c16';
                                            
                                            return (
                                                <div 
                                                    key={student.id} 
                                                    className={`student-row ${isStudentAnimating ? 'student-update-animation' : ''} ${isTopStudent ? 'top-student' : ''}`}
                                                >
                                                    <div className="student-info">
                                                        <Space>
                                                            <Avatar 
                                                                icon={<UserOutlined />} 
                                                                className="student-avatar"
                                                            />
                                                            <div>
                                                                <Text className="student-name">
                                                                    {student.fullName}
                                                                    {isTopStudent && <StarOutlined className="star-icon" />}
                                                                </Text>
                                                                {isStudentAnimating && (
                                                                    <FireOutlined className="student-fire-icon" />
                                                                )}
                                                            </div>
                                                        </Space>
                                                    </div>
                                                    
                                                    <div className="student-scores">
                                                        <div className="score-item">
                                                            <Text className="score-label">Загальний бал</Text>
                                                            <Text className="score-value">
                                                                {student.scores?.totalScore || 0} / {student.scores?.totalQuestions || 0}
                                                            </Text>
                                                        </div>
                                                        
                                                        <div className="score-item">
                                                            <Text className="score-label">Ефективність</Text>
                                                            <div className="efficiency-display">
                                                                <Progress
                                                                    percent={efficiency}
                                                                    strokeColor={efficiencyColor}
                                                                    showInfo={false}
                                                                    size="small"
                                                                    className="efficiency-progress"
                                                                />
                                                                <Text 
                                                                    className="efficiency-text"
                                                                    style={{ color: efficiencyColor }}
                                                                >
                                                                    {efficiency.toFixed(1)}%
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Brand Totals */}
                                    <Divider className="brand-divider" />
                                    <div className={`brand-totals ${isAnimating ? 'totals-update-animation' : ''}`}>
                                        <Row gutter={[16, 16]} align="middle">
                                            <Col span={12}>
                                                <div className="total-item">
                                                    <TrophyOutlined className="total-icon" />
                                                    <div>
                                                        <Text className="total-label">Загальний бал бренду</Text>
                                                        <Text className="total-value">
                                                            {brand.totalScore.toFixed(1)} / {brand.totalQuestions}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div className="total-item">
                                                    <div className="efficiency-total">
                                                        <Text className="total-label">Середня ефективність</Text>
                                                        <div className="brand-efficiency">
                                                            <Progress
                                                                percent={parseFloat(brand.averageEfficiency)}
                                                                strokeColor={parseFloat(brand.averageEfficiency) >= 80 ? '#52c41a' : parseFloat(brand.averageEfficiency) >= 60 ? '#faad14' : '#ff4d4f'}
                                                                className="brand-progress"
                                                                strokeWidth={8}
                                                            />
                                                            <Text className="brand-efficiency-text">
                                                                {brand.averageEfficiency}%
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    );
};

export default PublicShowcasePage;

