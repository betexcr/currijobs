import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palettes with colorblind-friendly options
const colors = {
  primary: {
    blue: '#1E3A8A', // Dark blue from headers
    orange: '#FF6B35', // Orange from buttons and accents
    yellow: '#FBC02D', // Bright yellow for rewards
    red: '#D32F2F', // Red for alerts
  },
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: {
      primary: '#111827', // near-black for readability
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    border: '#E5E7EB',
    shadow: '#000000',
  },
  dark: {
    background: '#0B1020',
    surface: '#121A2C',
    text: {
      primary: '#F9FAFB',
      secondary: '#CBD5E1',
      disabled: '#64748B',
    },
    border: '#243143',
    shadow: '#000000',
  },
  colorblind: {
    // Protanopia (red-green colorblindness) - Scientifically accurate colors
    protanopia: {
      primary: '#0066CC', // Blue (distinguishable for protanopia)
      accent: '#FF8C00', // Orange (distinguishable for protanopia)
      highlight: '#FFD700', // Gold (distinguishable for protanopia)
      success: '#228B22', // Forest Green (distinguishable for protanopia)
      warning: '#FF4500', // Orange Red (distinguishable for protanopia)
      error: '#DC143C', // Crimson (distinguishable for protanopia)
    },
    // Deuteranopia (red-green colorblindness) - Scientifically accurate colors
    deuteranopia: {
      primary: '#0066CC', // Blue (distinguishable for deuteranopia)
      accent: '#FF8C00', // Orange (distinguishable for deuteranopia)
      highlight: '#FFD700', // Gold (distinguishable for deuteranopia)
      success: '#228B22', // Forest Green (distinguishable for deuteranopia)
      warning: '#FF4500', // Orange Red (distinguishable for deuteranopia)
      error: '#DC143C', // Crimson (distinguishable for deuteranopia)
    },
    // Tritanopia (blue-yellow colorblindness) - Scientifically accurate colors
    tritanopia: {
      primary: '#8B0000', // Dark Red (distinguishable for tritanopia)
      accent: '#FF4500', // Orange Red (distinguishable for tritanopia)
      highlight: '#FFD700', // Gold (distinguishable for tritanopia)
      success: '#228B22', // Forest Green (distinguishable for tritanopia)
      warning: '#FF8C00', // Orange (distinguishable for tritanopia)
      error: '#DC143C', // Crimson (distinguishable for tritanopia)
    },
  },
};

// Customizable theme colors
export interface CustomThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

// Default custom theme
export const defaultCustomTheme: CustomThemeColors = {
  primary: '#1E3A8A',
  secondary: '#6B7280',
  accent: '#FF6B35',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#1E3A8A',
  border: '#E5E7EB',
};

// Typography
export const typography = {
  fontFamily: {
    primary: 'System', // Will use system font for now
    secondary: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Theme types
export type ThemeMode = 'light' | 'dark';
export type ColorblindType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type CustomThemeType = 'default' | 'custom';

export interface ThemeColors extends Omit<typeof colors.light, 'text'> {
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  shadow: string;
  primary: {
    blue: string;
    orange: string;
    yellow: string;
    red: string;
  };
  accent: string;
  highlight: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  mode: ThemeMode;
  colorblind: ColorblindType;
  customTheme: CustomThemeType;
  customColors?: CustomThemeColors;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

// Time-based color variations
const getTimeBasedColors = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // Morning: Fresh, energetic colors
    return {
      primary: '#1976D2', // Bright blue
      accent: '#4CAF50', // Green for freshness
      background: '#F0F8FF', // Light blue background
      surface: '#FFFFFF',
    };
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: Balanced, productive colors
    return {
      primary: '#1976D2', // Standard blue
      accent: '#4CAF50', // Green for productivity
      background: '#F5F5F5', // Neutral background
      surface: '#FFFFFF',
    };
  } else if (hour >= 18 && hour < 22) {
    // Evening: Calming, focused colors
    return {
      primary: '#7B1FA2', // Purple for focus
      accent: '#FF9800', // Orange for energy
      background: '#F3E5F5', // Soft purple background
      surface: '#FFFFFF',
    };
  } else {
    // Night: Dark, restful colors
    return {
      primary: '#424242', // Dark gray
      accent: '#9C27B0', // Purple accent
      background: '#121212', // Dark background
      surface: '#1E1E1E',
    };
  }
};

// Theme Generator with colorblind and custom theme support
export function createTheme(
  mode: ThemeMode,
  colorblind: ColorblindType = 'normal',
  customTheme: CustomThemeType = 'default',
  customColors?: CustomThemeColors
): Theme {
  const baseColors = mode === 'light' ? colors.light : colors.dark;

  // Start with sensible defaults
  let primaryColor = colors.primary.blue;
  let accentColor = colors.primary.orange;
  let highlightColor = colors.primary.yellow;
  let successColor = '#10B981';
  let warningColor = '#F59E0B';
  let errorColor = '#EF4444';

  // If user chose a custom theme, apply those and skip colorblind overrides
  let background = baseColors.background;
  let surface = baseColors.surface;
  let text = baseColors.text;
  let border = baseColors.border;

  if (customTheme === 'custom' && customColors) {
    primaryColor = customColors.primary;
    accentColor = customColors.accent;
    highlightColor = customColors.accent;
    background = customColors.background;
    surface = customColors.surface;
    text = {
      primary: customColors.text,
      secondary: baseColors.text.secondary,
      disabled: baseColors.text.disabled,
    };
    border = customColors.border;
  } else if (colorblind !== 'normal') {
    // Apply colorblind adjustments only when not using custom theme
    const colorblindColors = colors.colorblind[colorblind];
    primaryColor = colorblindColors.primary;
    accentColor = colorblindColors.accent;
    highlightColor = colorblindColors.highlight;
    successColor = colorblindColors.success;
    warningColor = colorblindColors.warning;
    errorColor = colorblindColors.error;
  }

  const themeColors: ThemeColors = {
    ...baseColors,
    background,
    surface,
    text,
    border,
    primary: {
      blue: primaryColor,
      orange: colors.primary.orange,
      yellow: colors.primary.yellow,
      red: colors.primary.red,
    },
    accent: accentColor,
    highlight: highlightColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
  };
  
  return {
    mode,
    colorblind,
    customTheme,
    customColors,
    colors: themeColors,
    typography,
    spacing,
    borderRadius,
    shadows,
  };
}

// Default Theme
export const defaultTheme = createTheme('light', 'normal', 'default');

// Screen Dimensions
export const screen = {
  width,
  height,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
};

// Animation Durations
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};
