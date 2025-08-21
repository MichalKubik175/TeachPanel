import { useTheme } from '../contexts/ThemeContext';

export const useThemeStyles = () => {
  const { theme } = useTheme();
  
  return {
    colors: theme.colors,
    // Convenience methods for common style patterns
    getCardStyle: (additionalStyles = {}) => ({
      backgroundColor: theme.colors.bgPrimary,
      borderColor: theme.colors.borderPrimary,
      color: theme.colors.textPrimary,
      ...additionalStyles,
    }),
    getInputStyle: (additionalStyles = {}) => ({
      backgroundColor: theme.colors.bgPrimary,
      borderColor: theme.colors.borderPrimary,
      color: theme.colors.textPrimary,
      ...additionalStyles,
    }),
    getTextStyle: (type = 'primary', additionalStyles = {}) => {
      const colorMap = {
        primary: theme.colors.textPrimary,
        secondary: theme.colors.textSecondary,
        tertiary: theme.colors.textTertiary,
      };
      
      return {
        color: colorMap[type] || theme.colors.textPrimary,
        ...additionalStyles,
      };
    },
  };
};

