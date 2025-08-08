import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalization } from '../contexts/LocalizationContext';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  {
    code: 'es-CR',
    name: 'Spanish (Costa Rica)',
    nativeName: 'Español (Costa Rica)',
    flag: '🇨🇷',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
];

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLocalization();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {t('language')}
      </Text>
      
      <View style={styles.optionsContainer}>
        {languageOptions.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={[
              styles.option,
              { backgroundColor: theme.colors.surface },
              language === option.code && { 
                backgroundColor: theme.colors.primary?.blue || '#1E3A8A',
                borderColor: theme.colors.primary?.blue || '#1E3A8A',
              }
            ]}
            onPress={() => setLanguage(option.code as any)}
          >
            <Text style={styles.flag}>{option.flag}</Text>
            <View style={styles.textContainer}>
              <Text style={[
                styles.languageName,
                { color: language === option.code ? 'white' : theme.colors.text.primary }
              ]}>
                {option.nativeName}
              </Text>
              <Text style={[
                styles.languageSubtitle,
                { color: language === option.code ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary }
              ]}>
                {option.name}
              </Text>
            </View>
            {language === option.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});


