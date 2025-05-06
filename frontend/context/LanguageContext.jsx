import { createContext, useState, useContext, useEffect } from 'react';
import { getSupportedLanguages } from "@/api/translationService";
import { AuthContext } from "@/context/AuthContext";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [supportedLanguages, setSupportedLanguages] = useState([])
  const [sourceLanguage, setSourceLanguage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(null);

  const {authState} = useContext(AuthContext)

  useEffect(() => {
    if(authState.authenticated){
      const fetchSupportedLanguages = async () => {
        try{
          const languages = await getSupportedLanguages();
          setSupportedLanguages(languages);
        } catch (error){
          console.error("Failed to fetch languages:", err);
        }
      };
      fetchSupportedLanguages();
    }
  }, [authState.authenticated])

  return (
    <LanguageContext.Provider value={{ supportedLanguages ,sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
