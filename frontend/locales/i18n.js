import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from "./en";
import pl from "./pl"


const locales = Localization.getLocales();

const userLang = locales[0]?.languageCode || 'en';
// const userLang = "en";


i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    lng: userLang,
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
