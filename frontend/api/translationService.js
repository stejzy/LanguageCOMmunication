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


  export const translate = async (text, sourceLang, targetLang, addAndRefresh) => {
    try {
      const { data } = await api.get('/translate', {
        params: {
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
        },
      });

      const newEntry = {
        id: data.id,
        sourceText: data.sourceText,
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        success: data.success,
        errorMessage: data.errorMessage,
        timestamp: data.timestamp,
      };

      await addAndRefresh(newEntry);

      return  data.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return "";
    }
  };

  export const textToSpeech = async (text, langCode) => {
    try {
      const response = await api.get('/text-to-speech', {
        params: {
          text: text,
          langCode: langCode
        },
        responseType: "arraybuffer"
      });
      return response.data;
    } catch(error) {
      console.error("Text to speech failed" + error)
      return ""
    }
  };

 export const translationHistory = async () => {
  try {
    const { data } = await api.get("/translations/successful");
    return data;
  } catch (error) {
    console.error("Fetching translation history failed: " + error);
    return "";
  }
};

export const deleteTranslationById = async (id, deleteAndRefresh) => {
  try {
    await api.delete(`/translations/delete/${id}`);
    console.log(`Translation with ID ${id} deleted successfully.`);

    if (deleteAndRefresh) {
      await deleteAndRefresh(id);
    }

    return true;
  } catch (error) {
    console.error(`Failed to delete translation with ID ${id}:`, error);
    return false;
  }
};


  export const detectLanguage = async (text) => {
  try {
    const { data } = await api.get('/detectLanguage', {
      params: { text }
    });
    return data;
  } catch (error) {
    console.error('Language detection failed:', error);
    return null;
  }
};