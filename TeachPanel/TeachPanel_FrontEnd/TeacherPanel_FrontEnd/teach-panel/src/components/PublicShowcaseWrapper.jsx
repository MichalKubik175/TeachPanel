import React, { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const PublicShowcaseWrapper = ({ children }) => {
  useEffect(() => {
    // Add class to body for page-specific styling
    document.body.classList.add('public-showcase-active');
    
    // Force override any existing theme classes
    document.documentElement.setAttribute('data-theme', 'light');
    
    // ULTIMATE Nuclear option: inject inline styles to override everything
    const styleElement = document.createElement('style');
    styleElement.id = 'public-showcase-force-light';
    styleElement.innerHTML = `
      /* Disable dark mode completely */
      html[data-theme] body.public-showcase-active,
      html body.public-showcase-active,
      body.public-showcase-active {
        background: #ffffff !important;
        color: #000000 !important;
      }
      
      /* Reset ALL CSS variables */
      html[data-theme] body.public-showcase-active *,
      html body.public-showcase-active *,
      body.public-showcase-active * {
        --bg-color: #ffffff !important;
        --bg-secondary: #fafafa !important;
        --bg-tertiary: #f5f5f5 !important;
        --text-primary: #000000 !important;
        --text-secondary: #666666 !important;
        --text-tertiary: #8c8c8c !important;
        --border-color: #d9d9d9 !important;
        --border-secondary: #f0f0f0 !important;
        --hover-bg: #f5f5f5 !important;
        --card-bg: #ffffff !important;
        --input-bg: #ffffff !important;
        --disabled-bg: #f5f5f5 !important;
        --disabled-text: #bfbfbf !important;
        --color-primary: #1890ff !important;
        --color-success: #52c41a !important;
        --color-warning: #faad14 !important;
        --color-error: #ff4d4f !important;
        background-color: initial !important;
        color: initial !important;
        border-color: initial !important;
      }
      
      /* Hide theme toggle */
      html body.public-showcase-active .theme-toggle-btn {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Force Ant Design components */
      html body.public-showcase-active .ant-card {
        background: #ffffff !important;
        color: #000000 !important;
        border: 1px solid #d9d9d9 !important;
      }
      
      html body.public-showcase-active .ant-card-head {
        background: #ffffff !important;
        color: #000000 !important;
        border-bottom: 1px solid #f0f0f0 !important;
      }
      
      html body.public-showcase-active .ant-typography,
      html body.public-showcase-active .ant-typography *,
      html body.public-showcase-active h1,
      html body.public-showcase-active h2,
      html body.public-showcase-active h3,
      html body.public-showcase-active h4,
      html body.public-showcase-active h5,
      html body.public-showcase-active h6,
      html body.public-showcase-active p,
      html body.public-showcase-active span,
      html body.public-showcase-active div {
        color: #000000 !important;
      }
      
      html body.public-showcase-active .ant-typography-secondary {
        color: #666666 !important;
      }
      
      html body.public-showcase-active .ant-progress-text {
        color: #000000 !important;
      }
      
      html body.public-showcase-active .ant-statistic-title {
        color: #666666 !important;
      }
      
      html body.public-showcase-active .ant-statistic-content {
        color: #000000 !important;
      }
      
      html body.public-showcase-active .ant-empty-description {
        color: #666666 !important;
      }
      
      html body.public-showcase-active .ant-avatar {
        background: #1890ff !important;
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup function
    return () => {
      document.body.classList.remove('public-showcase-active');
      document.documentElement.removeAttribute('data-theme');
      const injectedStyle = document.getElementById('public-showcase-force-light');
      if (injectedStyle) {
        injectedStyle.remove();
      }
    };
  }, []);

  // Force light theme for Ant Design components
  const forcedLightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      // Force all colors to light theme
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a', 
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      
      // Force backgrounds
      colorBgBase: '#ffffff',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgLayout: '#ffffff',
      colorBgSpotlight: '#ffffff',
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      
      // Force borders
      colorBorder: '#d9d9d9',
      colorBorderSecondary: '#f0f0f0',
      
      // Force fills
      colorFill: '#f5f5f5',
      colorFillSecondary: '#fafafa',
      colorFillTertiary: '#f0f0f0',
      colorFillQuaternary: '#fafafa',
      
      // Force text colors
      colorText: '#000000',
      colorTextSecondary: '#666666',
      colorTextTertiary: '#8c8c8c',
      colorTextQuaternary: '#bfbfbf',
      colorTextDisabled: '#bfbfbf',
      
      // Force specific component colors
      colorLink: '#1890ff',
      colorLinkHover: '#40a9ff',
      colorLinkActive: '#096dd9',
    },
    components: {
      Layout: {
        bodyBg: '#ffffff',
        headerBg: '#ffffff',
        siderBg: '#ffffff',
        triggerBg: '#ffffff',
        triggerColor: '#000000',
      },
      Card: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorBorderSecondary: '#f0f0f0',
      },
      Typography: {
        colorText: '#000000',
        colorTextSecondary: '#666666',
        colorTextTertiary: '#8c8c8c',
      },
      Progress: {
        colorText: '#000000',
        colorTextSecondary: '#666666',
      },
      Tag: {
        colorBg: '#fafafa',
        colorBgContainer: '#fafafa',
        colorText: '#000000',
        colorBorder: '#d9d9d9',
      },
      Avatar: {
        colorBg: '#1890ff',
        colorText: '#ffffff',
      },
      Statistic: {
        colorText: '#000000',
        colorTextSecondary: '#666666',
      },
      Empty: {
        colorText: '#000000',
        colorTextSecondary: '#666666',
      },
      Spin: {
        colorPrimary: '#1890ff',
      },
      Badge: {
        colorBg: '#ff4d4f',
        colorText: '#ffffff',
      },
      Button: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorText: '#000000',
        colorBorder: '#d9d9d9',
      },
      Input: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorText: '#000000',
        colorBorder: '#d9d9d9',
      },
      Select: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorText: '#000000',
        colorBorder: '#d9d9d9',
      },
      Table: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        headerBg: '#fafafa',
        colorText: '#000000',
        colorBorder: '#f0f0f0',
      },
      Modal: {
        contentBg: '#ffffff',
        headerBg: '#ffffff',
        colorText: '#000000',
      },
      Dropdown: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorText: '#000000',
      },
      Menu: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorText: '#000000',
        itemBg: 'transparent',
        itemHoverBg: '#f5f5f5',
        itemSelectedBg: '#e6f7ff',
      },
      List: {
        colorBg: '#ffffff',
        colorBgContainer: '#ffffff',
        colorText: '#000000',
        colorBorder: '#f0f0f0',
      },
      Divider: {
        colorBorder: '#f0f0f0',
      },
      Alert: {
        colorBg: '#fafafa',
        colorBgContainer: '#fafafa',
        colorText: '#000000',
        colorBorder: '#d9d9d9',
      },
    },
  };

  return (
    <ConfigProvider theme={forcedLightTheme}>
      <div 
        className="public-showcase-wrapper"
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          minHeight: '100vh'
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
};

export default PublicShowcaseWrapper;
