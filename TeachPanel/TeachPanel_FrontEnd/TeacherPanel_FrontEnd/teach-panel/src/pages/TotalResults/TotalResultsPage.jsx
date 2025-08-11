import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Typography, 
    Table, 
    Space, 
    Spin, 
    Alert, 
    Badge, 
    Progress, 
    Row, 
    Col,
    Statistic,
    Avatar,
    Tag,
    Select,
    Button,
    Segmented,
    Collapse,
    Divider
} from 'antd';
import { 
    TrophyOutlined, 
    UserOutlined, 
    BookOutlined, 
    CheckCircleOutlined,
    TeamOutlined,
    RiseOutlined,
    FireOutlined,
    FilterOutlined,
    AppstoreOutlined,
    BarsOutlined,
    StarOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { studentsApi } from '../../services/studentsApi';
import { brandsApi } from '../../services/brandsApi';
import { sessionHomeworkAnswersApi } from '../../services/sessionHomeworkAnswersApi';
import { sessionRegularAnswersApi } from '../../services/sessionRegularAnswersApi';
import { useBrandsGroupsStudents } from '../../hooks/useBrandsGroupsStudents';
import './TotalResultsPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const TotalResultsPage = () => {
    const [students, setStudents] = useState([]);
    const [studentScores, setStudentScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [animatingStudents, setAnimatingStudents] = useState(new Set());
    
    // New state for filtering and views
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'hierarchy'
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [bestResultsFilter, setBestResultsFilter] = useState('all'); // 'all', 'top10', 'top20', 'above80'
    const [hierarchyData, setHierarchyData] = useState({});
    
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

    // Build hierarchy data (Brand -> Groups -> Students)
    const buildHierarchyData = (studentsData, scoresData) => {
        const hierarchy = {};
        
        if (!studentsData || studentsData.length === 0) {
            return hierarchy;
        }
        
        studentsData.forEach(student => {
            // Get brand and group info from student object
            let brandId = student.brandId;
            let brandName = 'Unknown Brand';
            let groupId = student.groupId;
            let groupName = 'Unknown Group';
            
            // Get group name (this should work)
            if (student.group?.name) {
                groupName = student.group.name;
                groupId = student.group.id || groupId;
            }
            
            // Get brand info - prioritize student.group.brand since that has the data
            if (student.group?.brand?.name) {
                brandName = student.group.brand.name;
                brandId = student.group.brand.id;
            }
            // Fallback: try direct student brand
            else if (student.brand?.name) {
                brandName = student.brand.name;
                brandId = student.brand.id || brandId;
            }
            // Fallback: try finding by brandId in brands array
            else if (brandId && brands) {
                const brand = brands.find(b => b.id === brandId);
                if (brand) {
                    brandName = brand.name;
                }
            }
            // Last resort: try to find brand through group relationship
            else if (groupId && groups) {
                const group = groups.find(g => g.id === groupId);
                if (group?.brand?.name) {
                    brandName = group.brand.name;
                    brandId = group.brand.id;
                }
            }
            
            // Use fallback IDs if still not found
            const finalBrandId = brandId || 'unknown-brand';
            const finalGroupId = groupId || 'unknown-group';
            
            console.log(`Student: ${student.fullName}, Brand: ${brandName} (${finalBrandId}), Group: ${groupName} (${finalGroupId})`);
            
            if (!hierarchy[finalBrandId]) {
                hierarchy[finalBrandId] = {
                    id: finalBrandId,
                    name: brandName,
                    groups: {},
                    totalStudents: 0,
                    averageEfficiency: 0
                };
            }
            
            if (!hierarchy[finalBrandId].groups[finalGroupId]) {
                hierarchy[finalBrandId].groups[finalGroupId] = {
                    id: finalGroupId,
                    name: groupName,
                    students: [],
                    totalStudents: 0,
                    averageEfficiency: 0
                };
            }
            
            const studentScore = scoresData[student.id];
            hierarchy[finalBrandId].groups[finalGroupId].students.push({
                ...student,
                scores: studentScore
            });
            
            hierarchy[finalBrandId].totalStudents++;
            hierarchy[finalBrandId].groups[finalGroupId].totalStudents++;
        });
        
        // Calculate averages for groups and brands
        Object.values(hierarchy).forEach(brand => {
            let brandTotalEfficiency = 0;
            let brandStudentsWithScores = 0;
            
            Object.values(brand.groups).forEach(group => {
                let groupTotalEfficiency = 0;
                let groupStudentsWithScores = 0;
                
                group.students.forEach(student => {
                    if (student.scores && student.scores.totalQuestions > 0) {
                        groupTotalEfficiency += parseFloat(student.scores.overallEfficiency);
                        groupStudentsWithScores++;
                    }
                });
                
                group.averageEfficiency = groupStudentsWithScores > 0 
                    ? (groupTotalEfficiency / groupStudentsWithScores).toFixed(1)
                    : 0;
                
                brandTotalEfficiency += groupTotalEfficiency;
                brandStudentsWithScores += groupStudentsWithScores;
            });
            
            brand.averageEfficiency = brandStudentsWithScores > 0 
                ? (brandTotalEfficiency / brandStudentsWithScores).toFixed(1)
                : 0;
        });
        
        return hierarchy;
    };

    // Filter students by best results
    const filterStudentsByBestResults = (studentsData, filter) => {
        const studentsWithScores = studentsData
            .map(student => ({
                ...student,
                efficiency: parseFloat(studentScores[student.id]?.overallEfficiency || 0),
                totalQuestions: studentScores[student.id]?.totalQuestions || 0
            }))
            .filter(student => student.totalQuestions > 0)
            .sort((a, b) => b.efficiency - a.efficiency);
        
        switch (filter) {
            case 'top10':
                return studentsWithScores.slice(0, 10);
            case 'top20':
                return studentsWithScores.slice(0, 20);
            case 'above80':
                return studentsWithScores.filter(student => student.efficiency >= 80);
            default:
                return studentsData;
        }
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
                // Find homework answers for this student
                const studentHomeworkAnswers = homeworkAnswersResponse?.items?.filter(answer => 
                    answer.sessionHomeworkStudent?.studentId === student.id
                ) || [];

                // Find regular answers for this student
                const studentRegularAnswers = regularAnswersResponse?.items?.filter(answer => 
                    answer.sessionRegularStudent?.studentId === student.id
                ) || [];

                // Calculate homework scores
                const homeworkTotalScore = studentHomeworkAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const homeworkTotalQuestions = studentHomeworkAnswers.length;
                const homeworkEfficiency = homeworkTotalQuestions > 0 ? 
                    ((homeworkTotalScore / (homeworkTotalQuestions * 1.0)) * 100) : 0;

                // Calculate regular scores
                const regularTotalScore = studentRegularAnswers.reduce((sum, answer) => 
                    sum + getAnswerStateScore(answer.state), 0
                );
                const regularTotalQuestions = studentRegularAnswers.length;
                const regularEfficiency = regularTotalQuestions > 0 ? 
                    ((regularTotalScore / (regularTotalQuestions * 1.0)) * 100) : 0;

                // Calculate total score and overall efficiency
                const totalScore = homeworkTotalScore + regularTotalScore;
                const totalQuestions = homeworkTotalQuestions + regularTotalQuestions;
                const overallEfficiency = totalQuestions > 0 ? 
                    ((totalScore / (totalQuestions * 1.0)) * 100) : 0;

                scores[student.id] = {
                    homeworkScore: homeworkTotalScore,
                    homeworkTotalQuestions,
                    homeworkEfficiency: homeworkEfficiency.toFixed(1),
                    regularScore: regularTotalScore,
                    regularTotalQuestions,
                    regularEfficiency: regularEfficiency.toFixed(1),
                    totalScore: totalScore.toFixed(1),
                    totalQuestions,
                    overallEfficiency: overallEfficiency.toFixed(1)
                };

                // Check if score changed for animation
                const prevScore = previousScores[student.id];
                if (prevScore && (
                    prevScore.totalScore !== scores[student.id].totalScore ||
                    prevScore.homeworkScore !== scores[student.id].homeworkScore ||
                    prevScore.regularScore !== scores[student.id].regularScore
                )) {
                    setAnimatingStudents(prev => new Set([...prev, student.id]));
                    // Remove animation after 2 seconds
                    setTimeout(() => {
                        setAnimatingStudents(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(student.id);
                            return newSet;
                        });
                    }, 2000);
                }
            });

            setStudents(allStudents);
            setStudentScores(scores);
            setLastUpdated(new Date());
            
            // Debug: Log student structure
            if (allStudents.length > 0) {
                console.log('=== HIERARCHY DEBUG ===');
                console.log('Sample student data structure:', allStudents[0]);
                console.log('Available brands:', brands);
                console.log('Available groups:', groups);
                
                // Test brand/group mapping
                const testStudent = allStudents[0];
                console.log('Test student brandId:', testStudent.brandId);
                console.log('Test student groupId:', testStudent.groupId);
                console.log('Test student brand object:', testStudent.brand);
                console.log('Test student group object:', testStudent.group);
                console.log('Test student.group.brand object:', testStudent.group?.brand);
                
                if (testStudent.brandId && brands) {
                    const foundBrand = brands.find(b => b.id === testStudent.brandId);
                    console.log('Found brand by ID:', foundBrand);
                }
                
                if (testStudent.groupId && groups) {
                    const foundGroup = groups.find(g => g.id === testStudent.groupId);
                    console.log('Found group by ID:', foundGroup);
                }
            }
            
            // Build hierarchy data (only if brands and groups are available)
            if (brands && groups && brands.length > 0 && groups.length > 0) {
                const hierarchy = buildHierarchyData(allStudents, scores);
                console.log('Built hierarchy:', hierarchy);
                setHierarchyData(hierarchy);
            } else {
                console.log('Waiting for brands/groups data before building hierarchy');
                console.log('Brands available:', brands?.length || 0);
                console.log('Groups available:', groups?.length || 0);
            }

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

    // Rebuild hierarchy when brands/groups data becomes available
    useEffect(() => {
        if (students.length > 0 && brands && groups && brands.length > 0 && groups.length > 0) {
            console.log('Rebuilding hierarchy with fresh brands/groups data');
            const hierarchy = buildHierarchyData(students, studentScores);
            console.log('Rebuilt hierarchy:', hierarchy);
            setHierarchyData(hierarchy);
        }
    }, [brands, groups, students, studentScores]);

    // Set up polling for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            calculateStudentScores();
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [studentScores]); // Include studentScores as dependency to detect changes

    // Calculate statistics
    const totalStudents = students.length;
    const studentsWithScores = Object.values(studentScores).filter(score => score.totalQuestions > 0).length;
    const averageEfficiency = studentsWithScores > 0 ? 
        Object.values(studentScores)
            .filter(score => score.totalQuestions > 0)
            .reduce((sum, score) => sum + parseFloat(score.overallEfficiency), 0) / studentsWithScores : 0;

    // Get top performer
    const topPerformer = students.reduce((top, student) => {
        const score = studentScores[student.id];
        const topScore = studentScores[top?.id];
        if (!score || score.totalQuestions === 0) return top;
        if (!top || !topScore || topScore.totalQuestions === 0) return student;
        return parseFloat(score.overallEfficiency) > parseFloat(topScore.overallEfficiency) ? student : top;
    }, null);

    // Filter students based on selected filters
    const getFilteredStudents = () => {
        let filtered = [...students];
        
        // Filter by brand
        if (selectedBrand) {
            filtered = filtered.filter(student => student.brandId === selectedBrand);
        }
        
        // Filter by best results
        filtered = filterStudentsByBestResults(filtered, bestResultsFilter);
        
        return filtered;
    };

    const filteredStudents = getFilteredStudents();

    // Render hierarchy view
    const renderHierarchyView = () => {
        let dataToShow = hierarchyData;
        
        // Filter hierarchy by selected brand
        if (selectedBrand) {
            dataToShow = {
                [selectedBrand]: hierarchyData[selectedBrand]
            };
        }
        
        return (
            <Collapse accordion>
                {Object.values(dataToShow).map(brand => (
                    <Panel
                        key={brand.id}
                        header={
                            <Space>
                                <BookOutlined style={{ color: '#1890ff' }} />
                                <Text strong>{brand.name}</Text>
                                <Tag color="blue">{brand.totalStudents} студентів</Tag>
                                <Tag color="green">{brand.averageEfficiency}% середня ефективність</Tag>
                            </Space>
                        }
                    >
                        <Collapse size="small">
                            {Object.values(brand.groups).map(group => {
                                // Filter group students by best results
                                let groupStudents = group.students;
                                if (bestResultsFilter !== 'all') {
                                    groupStudents = filterStudentsByBestResults(groupStudents, bestResultsFilter);
                                }
                                
                                return (
                                    <Panel
                                        key={group.id}
                                        header={
                                            <Space>
                                                <TeamOutlined style={{ color: '#52c41a' }} />
                                                <Text strong>{group.name}</Text>
                                                <Tag color="cyan">{groupStudents.length} студентів</Tag>
                                                <Tag color="orange">{group.averageEfficiency}% ефективність</Tag>
                                            </Space>
                                        }
                                    >
                                        <Row gutter={[16, 16]}>
                                            {groupStudents.map(student => {
                                                const isAnimating = animatingStudents.has(student.id);
                                                const scores = student.scores;
                                                
                                                if (!scores || scores.totalQuestions === 0) {
                                                    return (
                                                        <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                                                            <Card size="small">
                                                                <Space>
                                                                    <Avatar icon={<UserOutlined />} />
                                                                    <div>
                                                                        <Text strong>{student.fullName}</Text>
                                                                        <br />
                                                                        <Text type="secondary">Немає даних</Text>
                                                                    </div>
                                                                </Space>
                                                            </Card>
                                                        </Col>
                                                    );
                                                }
                                                
                                                const efficiency = parseFloat(scores.overallEfficiency);
                                                let color = '#f5222d';
                                                let cardClass = 'hierarchy-student-card';
                                                
                                                if (efficiency >= 90) {
                                                    color = '#52c41a';
                                                    cardClass += ' top-performer';
                                                } else if (efficiency >= 80) {
                                                    color = '#52c41a';
                                                    cardClass += ' high-performer';
                                                } else if (efficiency >= 60) {
                                                    color = '#faad14';
                                                }
                                                
                                                if (isAnimating) {
                                                    cardClass += ' score-update-animation';
                                                }
                                                
                                                return (
                                                    <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                                                        <Card 
                                                            size="small" 
                                                            className={cardClass}
                                                        >
                                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                <Space>
                                                                    <Avatar icon={<UserOutlined />} />
                                                                    <div>
                                                                        <Text strong>{student.fullName}</Text>
                                                                        {isAnimating && <FireOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} />}
                                                                    </div>
                                                                </Space>
                                                                
                                                                <Space>
                                                                    <TrophyOutlined style={{ color }} />
                                                                    <Text strong style={{ color }}>
                                                                        {scores.totalScore} / {scores.totalQuestions}
                                                                    </Text>
                                                                </Space>
                                                                
                                                                <Progress 
                                                                    percent={efficiency} 
                                                                    size="small" 
                                                                    strokeColor={color}
                                                                    showInfo={false}
                                                                />
                                                                
                                                                <Tag color={efficiency >= 80 ? 'green' : efficiency >= 60 ? 'orange' : 'red'}>
                                                                    {efficiency.toFixed(1)}%
                                                                </Tag>
                                                            </Space>
                                                        </Card>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    </Panel>
                                );
                            })}
                        </Collapse>
                    </Panel>
                ))}
            </Collapse>
        );
    };

    // Table columns
    const columns = [
        {
            title: 'Студент',
            key: 'student',
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <Text strong>{record.fullName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.group?.name} • {record.brand?.name}
                        </Text>
                    </div>
                </Space>
            ),
            width: 200,
        },
        {
            title: 'Контрольні роботи',
            key: 'homework',
            render: (_, record) => {
                const scores = studentScores[record.id];
                if (!scores || scores.homeworkTotalQuestions === 0) {
                    return <Text type="secondary">Немає даних</Text>;
                }
                return (
                    <Space direction="vertical" size="small">
                        <Text strong>
                            {scores.homeworkScore} / {scores.homeworkTotalQuestions}
                        </Text>
                        <Progress 
                            percent={parseFloat(scores.homeworkEfficiency)} 
                            size="small" 
                            strokeColor="#52c41a"
                        />
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aScore = studentScores[a.id]?.homeworkScore || 0;
                const bScore = studentScores[b.id]?.homeworkScore || 0;
                return aScore - bScore;
            },
            width: 150,
        },
        {
            title: 'Заняття',
            key: 'regular',
            render: (_, record) => {
                const scores = studentScores[record.id];
                if (!scores || scores.regularTotalQuestions === 0) {
                    return <Text type="secondary">Немає даних</Text>;
                }
                return (
                    <Space direction="vertical" size="small">
                        <Text strong>
                            {scores.regularScore} / {scores.regularTotalQuestions}
                        </Text>
                        <Progress 
                            percent={parseFloat(scores.regularEfficiency)} 
                            size="small" 
                            strokeColor="#1890ff"
                        />
                    </Space>
                );
            },
            sorter: (a, b) => {
                const aScore = studentScores[a.id]?.regularScore || 0;
                const bScore = studentScores[b.id]?.regularScore || 0;
                return aScore - bScore;
            },
            width: 150,
        },
        {
            title: 'Загальний результат',
            key: 'total',
            render: (_, record) => {
                const scores = studentScores[record.id];
                const isAnimating = animatingStudents.has(record.id);
                
                if (!scores || scores.totalQuestions === 0) {
                    return <Text type="secondary">Немає даних</Text>;
                }

                const efficiency = parseFloat(scores.overallEfficiency);
                let color = '#f5222d'; // Red
                if (efficiency >= 80) color = '#52c41a'; // Green
                else if (efficiency >= 60) color = '#faad14'; // Yellow

                return (
                    <div className={isAnimating ? 'score-update-animation' : ''}>
                        <Space direction="vertical" size="small">
                            <Space>
                                <TrophyOutlined style={{ color }} />
                                <Text strong style={{ color }}>
                                    {scores.totalScore} / {scores.totalQuestions}
                                </Text>
                                {isAnimating && <FireOutlined style={{ color: '#ff4d4f' }} />}
                            </Space>
                            <Progress 
                                percent={efficiency} 
                                size="small" 
                                strokeColor={color}
                            />
                            <Tag color={efficiency >= 80 ? 'green' : efficiency >= 60 ? 'orange' : 'red'}>
                                {efficiency.toFixed(1)}% ефективність
                            </Tag>
                        </Space>
                    </div>
                );
            },
            sorter: (a, b) => {
                const aScore = parseFloat(studentScores[a.id]?.overallEfficiency || 0);
                const bScore = parseFloat(studentScores[b.id]?.overallEfficiency || 0);
                return aScore - bScore;
            },
            defaultSortOrder: 'descend',
            width: 200,
        },
    ];

    if (loading || brandsGroupsLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: '#f0f2f5'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '50px', background: '#f0f2f5', minHeight: '100vh' }}>
                <Alert
                    message="Помилка"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                <Title level={1}>Загальні результати студентів</Title>
                <Text type="secondary">
                    Останнє оновлення: {lastUpdated.toLocaleTimeString()} • 
                    Автоматичне оновлення кожні 2 секунди
                </Text>
            </div>

            {/* Filters and View Controls */}
            <Card style={{ marginBottom: '24px' }} className="filter-controls">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <Space>
                            <FilterOutlined />
                            <Text strong>Вид:</Text>
                        </Space>
                        <Segmented
                            options={[
                                { label: 'Таблиця', value: 'table', icon: <BarsOutlined /> },
                                { label: 'Ієрархія', value: 'hierarchy', icon: <AppstoreOutlined /> }
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                            style={{ marginLeft: '8px' }}
                        />
                    </Col>
                    
                    <Col xs={24} sm={12} md={6}>
                        <Space>
                            <BookOutlined />
                            <Text strong>Бренд:</Text>
                        </Space>
                        <Select
                            placeholder="Всі бренди"
                            value={selectedBrand}
                            onChange={setSelectedBrand}
                            allowClear
                            style={{ width: '100%', marginLeft: '8px' }}
                        >
                            {(brands || []).map(brand => (
                                <Option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    
                    <Col xs={24} sm={12} md={6}>
                        <Space>
                            <StarOutlined />
                            <Text strong>Результати:</Text>
                        </Space>
                        <Select
                            value={bestResultsFilter}
                            onChange={setBestResultsFilter}
                            style={{ width: '100%', marginLeft: '8px' }}
                        >
                            <Option value="all">Всі студенти</Option>
                            <Option value="top10">Топ 10</Option>
                            <Option value="top20">Топ 20</Option>
                            <Option value="above80">Вище 80%</Option>
                        </Select>
                    </Col>
                    
                    <Col xs={24} sm={12} md={6}>
                        <Button
                            icon={<CrownOutlined />}
                            onClick={() => {
                                setBestResultsFilter('top10');
                                setViewMode('table');
                            }}
                            style={{ width: '100%' }}
                        >
                            Показати лідерів
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Всього студентів"
                            value={totalStudents}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Активних студентів"
                            value={studentsWithScores}
                            prefix={<UserOutlined />}
                            suffix={`/ ${totalStudents}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Середня ефективність"
                            value={averageEfficiency.toFixed(1)}
                            prefix={<RiseOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Кращий студент"
                            value={topPerformer?.fullName || 'Немає даних'}
                            prefix={<TrophyOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Results Content */}
            {viewMode === 'table' ? (
                <Card>
                    <div style={{ marginBottom: '16px' }}>
                        <Space>
                            <BarsOutlined />
                            <Text strong>Таблиця результатів</Text>
                            <Tag color="blue">{filteredStudents.length} студентів</Tag>
                        </Space>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={filteredStudents}
                        rowKey="id"
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} з ${total} студентів`,
                        }}
                        scroll={{ x: 800 }}
                    />
                </Card>
            ) : (
                <Card>
                    <div style={{ marginBottom: '16px' }}>
                        <Space>
                            <AppstoreOutlined />
                            <Text strong>Ієрархічний вид: Бренд → Група → Студенти</Text>
                        </Space>
                    </div>
                    {Object.keys(hierarchyData).length > 0 ? (
                        renderHierarchyView()
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Text type="secondary">Немає даних для відображення</Text>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default TotalResultsPage;
