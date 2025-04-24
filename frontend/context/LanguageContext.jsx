import { createContext, useState, useContext } from 'react';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [sourceLanguage, setSourceLanguage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(null);

  return (
    <LanguageContext.Provider value={{ sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
