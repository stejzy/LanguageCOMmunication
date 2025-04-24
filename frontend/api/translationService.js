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