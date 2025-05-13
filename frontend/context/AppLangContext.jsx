import React, { createContext, useState, useEffect } from "react";
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/locales/i18n';

export const AppLangContext = createContext();

export const AppLangProvider = ({ children }) => {
  const systemLang = Localization.getLocales()[0]?.languageCode || 'en';
  const [language, setLanguageState] = useState(systemLang);

  useEffect(() => {
    (async () => {
      const storedLang = await AsyncStorage.getItem('language');
      const initialLang = storedLang || systemLang;
      setLanguageState(initialLang);
      i18n.changeLanguage(initialLang);
    })();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <AppLangContext.Provider value={{ language, setLanguage }}>
      {children}
    </AppLangContext.Provider>
  );
};
