import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localizations, { Language, LocalizationStrings } from '../lib/localization';
import i18n from '../lib/i18n';

interface LocalizationContextType {
  language: Language;
  strings: LocalizationStrings;
  setLanguage: (language: Language) => void;
  t: (key: keyof LocalizationStrings) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

interface LocalizationProviderProps {
  children: React.ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es-CR');

  useEffect(() => {
    // Load saved language preference; default to Spanish if unset or invalid
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage === 'es-CR' || savedLanguage === 'en' || savedLanguage === 'zh') {
          setLanguageState(savedLanguage as Language);
        } else {
          await AsyncStorage.setItem('userLanguage', 'es-CR');
          setLanguageState('es-CR');
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
        setLanguageState('es-CR');
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('userLanguage', newLanguage);
      setLanguageState(newLanguage);
      // Update i18next for immediate UI refresh
      await i18n.changeLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const strings = localizations[language];

  const t = (key: keyof LocalizationStrings): string => {
    return strings[key] || key;
  };

  const value = {
    language,
    strings,
    setLanguage,
    t,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};


