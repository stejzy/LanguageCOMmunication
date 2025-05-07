import api from './config';

export const getSupportedLanguages = async () => {
    try {
      const { data } = await api.get('/supportedLanguages');
      return data;
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      return [];
    }
  };


  export const translate = async (text, sourceLang, targetLang) => {
    try {
      const { data } = await api.get('/translate', {
        params: {
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
        }
      });
      return data;
    } catch (error) {
      console.error('Translation failed:', error);
      return "";
    }
  };
  