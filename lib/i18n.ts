import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import localizations from './localization';
// Polyfill Intl.PluralRules for Hermes/older RN
import 'intl-pluralrules';

// Transform our existing localizations to i18next resources
const resources = Object.entries(localizations).reduce<Record<string, { translation: any }>>(
  (acc, [lng, strings]) => {
    acc[lng] = { translation: { ...strings } };
    return acc;
  },
  {}
);

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    try {
      const locales = Localization.getLocales();
      const code = locales?.[0]?.languageTag || 'es-CR';
      callback(code.startsWith('es') ? 'es-CR' : code.startsWith('zh') ? 'zh' : 'en');
    } catch {
      callback('es-CR');
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

if (!i18n.isInitialized) {
  i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'es-CR',
      interpolation: { escapeValue: false },
    })
    .catch(() => {});
}

export default i18n;

