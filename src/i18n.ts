import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko/translation.json';
import en from './locales/en/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof ko };
  }
}

const initialLng = localStorage.getItem('i18nextLng') ?? 'ko';
document.documentElement.lang = initialLng;

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: initialLng,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

export default i18n;
