import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from "./en";
import pl from "./pl";

const fallbackLang = 'en';
const systemLang = Localization.getLocales()[0]?.languageCode || fallbackLang;

// Inicjalizacja tylko raz przy starcie — potem można zmieniać przez kontekst
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    lng: systemLang,
    fallbackLng: fallbackLang,
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
