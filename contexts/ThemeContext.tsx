import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createTheme, 
  Theme, 
  ThemeMode, 
  ColorblindType, 
  CustomThemeColors, 
  CustomThemeType, 
  defaultCustomTheme 
} from '../lib/theme';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  colorblind: ColorblindType;
  setMode: (mode: ThemeMode) => void;
  setColorblind: (type: ColorblindType) => void;
  toggleMode: () => void;
  customTheme: CustomThemeType;
  customColors?: CustomThemeColors;
  setCustomTheme: (type: CustomThemeType) => void;
  setCustomColors: (colors: CustomThemeColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemColorScheme === 'dark' ? 'dark' : 'light');
  const [colorblind, setColorblind] = useState<ColorblindType>('normal');
  const [customTheme, setCustomTheme] = useState<CustomThemeType>('default');
  const [customColors, setCustomColors] = useState<CustomThemeColors | undefined>(undefined);

  const [theme, setTheme] = useState<Theme>(() => createTheme(mode, colorblind, customTheme, customColors));

  useEffect(() => {
    setTheme(createTheme(mode, colorblind, customTheme, customColors));
  }, [mode, colorblind, customTheme, customColors]);

  // Load saved preferences
  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem('theme.mode');
        const savedColorblind = await AsyncStorage.getItem('theme.colorblind');
        const savedCustomTheme = await AsyncStorage.getItem('theme.customTheme');
        const savedCustomColors = await AsyncStorage.getItem('theme.customColors');

        if (savedMode === 'light' || savedMode === 'dark') {
          setMode(savedMode);
        }
        if (savedColorblind === 'normal' || savedColorblind === 'protanopia' || savedColorblind === 'deuteranopia' || savedColorblind === 'tritanopia') {
          setColorblind(savedColorblind as ColorblindType);
        }
        if (savedCustomTheme === 'default' || savedCustomTheme === 'custom') {
          setCustomTheme(savedCustomTheme as CustomThemeType);
        }
        if (savedCustomColors) {
          try {
            const parsed = JSON.parse(savedCustomColors) as CustomThemeColors;
            // Basic shape check
            if (parsed && parsed.primary && parsed.accent && parsed.background) {
              setCustomColors(parsed);
            }
          } catch {}
        }
      } catch (err) {
        // Non-fatal
      }
    })();
  }, []);

  // Persist preferences
  useEffect(() => {
    AsyncStorage.setItem('theme.mode', mode).catch(() => {});
  }, [mode]);
  useEffect(() => {
    AsyncStorage.setItem('theme.colorblind', colorblind).catch(() => {});
  }, [colorblind]);
  useEffect(() => {
    AsyncStorage.setItem('theme.customTheme', customTheme).catch(() => {});
  }, [customTheme]);
  useEffect(() => {
    if (customColors) {
      AsyncStorage.setItem('theme.customColors', JSON.stringify(customColors)).catch(() => {});
    } else {
      AsyncStorage.removeItem('theme.customColors').catch(() => {});
    }
  }, [customColors]);

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    mode,
    colorblind,
    setMode,
    setColorblind,
    toggleMode,
    customTheme,
    customColors,
    setCustomTheme: (type: CustomThemeType) => setCustomTheme(type),
    setCustomColors: (colors: CustomThemeColors) => {
      setCustomTheme('custom');
      setCustomColors(colors);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


