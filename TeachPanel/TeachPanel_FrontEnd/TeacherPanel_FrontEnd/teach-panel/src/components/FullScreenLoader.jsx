import React from 'react';
import { Spin } from 'antd';

const FullScreenLoader = ({ loading, tip = null }) => {
    if (!loading) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    };

    return (
        <div style={overlayStyle}>
            {/* Ensure the Spin wrapper fills the overlay so nested spinner centers correctly */}
            <Spin
                spinning
                tip={tip}
                size="large"
                style={{ width: '100%', height: '100%' }}
            >
                <div style={{ width: '100%', height: '100%' }} />
            </Spin>
        </div>
    );
};

export default FullScreenLoader;
