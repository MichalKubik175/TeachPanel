import React from 'react';
import { Card, Typography, Row, Col, Space, Tag } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import './TableLayoutPreview.css';

const { Text } = Typography;

const TableLayoutPreview = ({ layout, compact = false }) => {
    if (!layout || !layout.rows || layout.rows.length === 0) {
        return (
            <div className="table-layout-preview empty">
                <Text type="secondary">Немає даних для відображення</Text>
            </div>
        );
    }

    const maxTablesInRow = Math.max(...layout.rows.map(row => row.tablesCount || 0));
    const totalTables = layout.rows.reduce((sum, row) => sum + (row.tablesCount || 0), 0);

    return (
        <div className={`table-layout-preview ${compact ? 'compact' : ''}`}>
            {!compact && (
                <div className="preview-header">
                    <Space>
                        <Tag color="blue">{layout.rows.length} рядів</Tag>
                        <Tag color="green">
                            <TableOutlined /> {totalTables} столів
                        </Tag>
                    </Space>
                </div>
            )}
            
            <div className="preview-container">
                <div className="tables-grid">
                    {layout.rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="table-row">
                            <div className="row-label">
                                <Text strong>Ряд {row.rowNumber}</Text>
                            </div>
                            <div className="tables-container">
                                {Array.from({ length: row.tablesCount || 0 }, (_, tableIndex) => (
                                    <div key={tableIndex} className="table-item">
                                        <div className="table-icon">
                                            <TableOutlined />
                                        </div>
                                        <Text className="table-number">
                                            {tableIndex + 1}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {compact && (
                <div className="compact-info">
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {layout.rows.length} рядів • {totalTables} столів
                    </Text>
                </div>
            )}
        </div>
    );
};

export default TableLayoutPreview;
