import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import tr from './locales/tr.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', countryCode: 'fr', dir: 'ltr' },
  { code: 'en', label: 'English',  flag: '🇬🇧', countryCode: 'gb', dir: 'ltr' },
  { code: 'ar', label: 'العربية',  flag: '🇹🇳', countryCode: 'tn', dir: 'rtl' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪', countryCode: 'de', dir: 'ltr' },
  { code: 'es', label: 'Español',  flag: '🇪🇸', countryCode: 'es', dir: 'ltr' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', countryCode: 'it', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe',   flag: '🇹🇷', countryCode: 'tr', dir: 'ltr' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
      de: { translation: de },
      es: { translation: es },
      it: { translation: it },
      tr: { translation: tr },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'ar', 'de', 'es', 'it', 'tr'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'aidaa_language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Apply RTL direction when Arabic is selected
i18n.on('languageChanged', (lng) => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === lng);
  if (lang) {
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lng;
  }
});

export default i18n;

