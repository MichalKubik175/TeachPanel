import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme-preference');
    return savedTheme === 'dark';
  });

  // Check if we're on the public showcase page - if so, force light mode
  const isPublicShowcasePage = window.location.pathname.includes('public-showcase');
  const effectiveIsDarkMode = isPublicShowcasePage ? false : isDarkMode;

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme-preference', newMode ? 'dark' : 'light');
    
    // Update CSS custom properties
    updateCSSVariables(newMode);
  };

  const updateCSSVariables = (darkMode) => {
    const root = document.documentElement;
    
    if (darkMode) {
      // Dark mode variables - only black/white elements
      root.style.setProperty('--bg-color', '#141414');
      root.style.setProperty('--bg-secondary', '#1f1f1f');
      root.style.setProperty('--bg-tertiary', '#262626');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#bfbfbf');
      root.style.setProperty('--text-tertiary', '#8c8c8c');
      root.style.setProperty('--border-color', '#434343');
      root.style.setProperty('--border-secondary', '#303030');
      root.style.setProperty('--hover-bg', '#262626');
      root.style.setProperty('--card-bg', '#1f1f1f');
      root.style.setProperty('--input-bg', '#1f1f1f');
      root.style.setProperty('--disabled-bg', '#262626');
      root.style.setProperty('--disabled-text', '#595959');
    } else {
      // Light mode variables
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--bg-secondary', '#fafafa');
      root.style.setProperty('--bg-tertiary', '#f5f5f5');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--text-tertiary', '#8c8c8c');
      root.style.setProperty('--border-color', '#d9d9d9');
      root.style.setProperty('--border-secondary', '#f0f0f0');
      root.style.setProperty('--hover-bg', '#f5f5f5');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--input-bg', '#ffffff');
      root.style.setProperty('--disabled-bg', '#f5f5f5');
      root.style.setProperty('--disabled-text', '#bfbfbf');
    }
  };

  useEffect(() => {
    // Initialize CSS variables on mount
    updateCSSVariables(effectiveIsDarkMode);
  }, [effectiveIsDarkMode]);

  // Ant Design theme configuration
  const antdTheme = {
    algorithm: effectiveIsDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // Keep colored elements the same
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      
      // Only change black/white elements
      colorBgBase: effectiveIsDarkMode ? '#141414' : '#ffffff',
      colorBgContainer: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      colorBgElevated: effectiveIsDarkMode ? '#262626' : '#ffffff',
      colorBgLayout: effectiveIsDarkMode ? '#141414' : '#f5f5f5',
      colorBgSpotlight: effectiveIsDarkMode ? '#262626' : '#ffffff',
      colorBorder: effectiveIsDarkMode ? '#434343' : '#d9d9d9',
      colorBorderSecondary: effectiveIsDarkMode ? '#303030' : '#f0f0f0',
      colorFill: effectiveIsDarkMode ? '#262626' : '#f5f5f5',
      colorFillSecondary: effectiveIsDarkMode ? '#1f1f1f' : '#fafafa',
      colorFillTertiary: effectiveIsDarkMode ? '#1a1a1a' : '#f0f0f0',
      colorFillQuaternary: effectiveIsDarkMode ? '#141414' : '#fafafa',
      colorText: effectiveIsDarkMode ? '#ffffff' : '#000000',
      colorTextSecondary: effectiveIsDarkMode ? '#bfbfbf' : '#666666',
      colorTextTertiary: effectiveIsDarkMode ? '#8c8c8c' : '#8c8c8c',
      colorTextQuaternary: effectiveIsDarkMode ? '#595959' : '#bfbfbf',
      
      // Component specific
      colorBgMask: effectiveIsDarkMode ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)',
    },
    components: {
      Layout: {
        bodyBg: effectiveIsDarkMode ? '#141414' : '#f5f5f5',
        headerBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
        siderBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: effectiveIsDarkMode ? '#262626' : '#e6f7ff',
        itemHoverBg: effectiveIsDarkMode ? '#262626' : '#f5f5f5',
      },
      Card: {
        colorBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      },
      Table: {
        headerBg: effectiveIsDarkMode ? '#262626' : '#fafafa',
        rowHoverBg: effectiveIsDarkMode ? '#262626' : '#f5f5f5',
      },
      Input: {
        colorBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      },
      Select: {
        colorBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      },
      DatePicker: {
        colorBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      },
      Modal: {
        contentBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
        headerBg: effectiveIsDarkMode ? '#1f1f1f' : '#ffffff',
      },
    },
  };

  const value = {
    isDarkMode: effectiveIsDarkMode,
    toggleTheme,
    theme: {
      colors: {
        // Background colors
        bgPrimary: effectiveIsDarkMode ? '#141414' : '#ffffff',
        bgSecondary: effectiveIsDarkMode ? '#1f1f1f' : '#fafafa',
        bgTertiary: effectiveIsDarkMode ? '#262626' : '#f5f5f5',
        
        // Text colors
        textPrimary: effectiveIsDarkMode ? '#ffffff' : '#000000',
        textSecondary: effectiveIsDarkMode ? '#bfbfbf' : '#666666',
        textTertiary: effectiveIsDarkMode ? '#8c8c8c' : '#8c8c8c',
        
        // Border colors
        borderPrimary: effectiveIsDarkMode ? '#434343' : '#d9d9d9',
        borderSecondary: effectiveIsDarkMode ? '#303030' : '#f0f0f0',
        
        // Interactive colors
        hoverBg: effectiveIsDarkMode ? '#262626' : '#f5f5f5',
        
        // Keep colored elements the same
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
        info: '#1890ff',
      },
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
