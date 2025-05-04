import api from './config';

export const generatePhrase = async (phrase) => {
    try {
        const response = await api.post('api/phrases/generate', {phrase:phrase});
        return response.data
    } catch (error) {
        console.error('Errow przy generowaniu frazy: ', error);
        throw error;
    }
};