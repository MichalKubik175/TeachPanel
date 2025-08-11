import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    Layout, 
    Typography, 
    Spin, 
    Empty, 
    Card, 
    Space, 
    Button, 
    Alert, 
    Row, 
    Col, 
    Table,
    Modal,
    message,
    Popconfirm,
    Tag
} from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    ProjectOutlined,
    EyeOutlined,
    TableOutlined
} from '@ant-design/icons';
import { tableLayoutsApi } from '../../services/tableLayoutsApi';
import TableLayoutCreatePage from './TableLayoutCreatePage';
import TableLayoutEditPage from './TableLayoutEditPage';
import TableLayoutPreview from './TableLayoutPreview';

const { Content } = Layout;
const { Title, Text } = Typography;

const TableLayoutsOverviewPage = () => {
    const userData = useSelector((state) => state.auth);
    const [tableLayouts, setTableLayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePanel, setActivePanel] = useState(null); // null | 'create' | 'edit'
    const [editingLayout, setEditingLayout] = useState(null);
    const [previewModal, setPreviewModal] = useState({ visible: false, layout: null });

    // Fetch table layouts
    const fetchTableLayouts = async () => {
        try {
            setLoading(true);
            const response = await tableLayoutsApi.getAllTableLayouts(1, 100);
            setTableLayouts(response.items || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching table layouts:', err);
            setError('Помилка при завантаженні розкладок столів');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableLayouts();
    }, []);

    const handleCreate = () => {
        setEditingLayout(null);
        setActivePanel('create');
    };

    const handleEdit = (layout) => {
        setEditingLayout(layout);
        setActivePanel('edit');
    };

    const handleDelete = async (layoutId) => {
        try {
            await tableLayoutsApi.deleteTableLayout(layoutId);
            message.success('Розкладку видалено успішно!');
            fetchTableLayouts();
        } catch (err) {
            console.error('Error deleting table layout:', err);
            message.error('Не вдалося видалити розкладку');
        }
    };

    const handlePreview = (layout) => {
        setPreviewModal({ visible: true, layout });
    };

    const handleBack = () => {
        setActivePanel(null);
        setEditingLayout(null);
        fetchTableLayouts(); // Refresh data when coming back
    };

    // Calculate total tables for a layout
    const calculateTotalTables = (rows) => {
        return rows?.reduce((total, row) => total + (row.tablesCount || 0), 0) || 0;
    };

    // Table columns
    const columns = [
        {
            title: 'Назва',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <ProjectOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Кількість рядів',
            key: 'rowsCount',
            render: (_, record) => (
                <Tag color="blue">
                    {record.rows?.length || 0} рядів
                </Tag>
            ),
            sorter: (a, b) => (a.rows?.length || 0) - (b.rows?.length || 0),
        },
        {
            title: 'Загальна кількість столів',
            key: 'totalTables',
            render: (_, record) => (
                <Tag color="green">
                    <TableOutlined /> {calculateTotalTables(record.rows)} столів
                </Tag>
            ),
            sorter: (a, b) => calculateTotalTables(a.rows) - calculateTotalTables(b.rows),
        },
        {
            title: 'Створено',
            dataIndex: 'createdAtLocal',
            key: 'createdAtLocal',
            render: (date) => (
                <Text type="secondary">
                    {date ? new Date(date).toLocaleDateString('uk-UA') : 'Невідомо'}
                </Text>
            ),
            sorter: (a, b) => {
                if (!a.createdAtLocal && !b.createdAtLocal) return 0;
                if (!a.createdAtLocal) return 1;
                if (!b.createdAtLocal) return -1;
                return new Date(a.createdAtLocal) - new Date(b.createdAtLocal);
            },
        },
        {
            title: 'Дії',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(record)}
                        size="small"
                        title="Переглянути"
                    >
                        Переглянути
                    </Button>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                        title="Редагувати"
                    >
                        Редагувати
                    </Button>
                    <Popconfirm
                        title="Видалити розкладку"
                        description="Ви впевнені, що хочете видалити цю розкладку столів?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Так"
                        cancelText="Ні"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            title="Видалити"
                        >
                            Видалити
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Render different panels
    if (activePanel === 'create') {
        return <TableLayoutCreatePage onBack={handleBack} />;
    }

    if (activePanel === 'edit' && editingLayout) {
        return <TableLayoutEditPage layout={editingLayout} onBack={handleBack} />;
    }

    return (
        <Content style={{ padding: '24px' }}>
            <Spin spinning={userData.status === 'loading' || loading} delay={500}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2}>Розкладки столів</Title>
                        <Text type="secondary">
                            Управління розкладками столів для сесій
                        </Text>
                        {tableLayouts.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                    Всього розкладок: {tableLayouts.length}
                                </Text>
                            </div>
                        )}
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size="large"
                        >
                            Додати розкладку
                        </Button>
                    </Space>
                </div>

                {error && (
                    <Alert
                        message="Помилка"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: '16px' }}
                    />
                )}

                {tableLayouts.length === 0 && !loading ? (
                    <Card>
                        <Empty 
                            description="Розкладки столів не знайдено" 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
                                Створити першу розкладку
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={tableLayouts}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} з ${total} розкладок`,
                            }}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div style={{ margin: 0 }}>
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} lg={12}>
                                                <Card 
                                                    size="small" 
                                                    title="Структура рядів"
                                                    style={{ height: '100%' }}
                                                >
                                                    {record.rows?.map((row, index) => (
                                                        <div key={index} style={{ marginBottom: '8px' }}>
                                                            <Text>
                                                                <strong>Ряд {row.rowNumber}:</strong> {row.tablesCount} столів
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </Card>
                                            </Col>
                                            <Col xs={24} lg={12}>
                                                <Card 
                                                    size="small" 
                                                    title="Попередній перегляд"
                                                    style={{ height: '100%' }}
                                                >
                                                    <TableLayoutPreview 
                                                        layout={record} 
                                                        compact={true}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                ),
                                rowExpandable: (record) => record.rows && record.rows.length > 0,
                            }}
                        />
                    </Card>
                )}

                {/* Preview Modal */}
                <Modal
                    title={
                        <Space>
                            <ProjectOutlined />
                            Попередній перегляд: {previewModal.layout?.name}
                        </Space>
                    }
                    open={previewModal.visible}
                    onCancel={() => setPreviewModal({ visible: false, layout: null })}
                    footer={[
                        <Button 
                            key="close" 
                            onClick={() => setPreviewModal({ visible: false, layout: null })}
                        >
                            Закрити
                        </Button>
                    ]}
                    width={800}
                    centered
                >
                    {previewModal.layout && (
                        <TableLayoutPreview 
                            layout={previewModal.layout} 
                            compact={false}
                        />
                    )}
                </Modal>
            </Spin>
        </Content>
    );
};

export default TableLayoutsOverviewPage;
