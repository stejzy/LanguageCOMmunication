import api from './config';
import storage from '@/utils/storage';

const ACCESS_TOKEN_KEY = process.env.EXPO_PUBLIC_ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY;

export const register = async ({ username, email, password }) => {
  try {
    await api.post('/api/auth/register', { username, email, password });
  } catch (err) {
    console.error('Registration error:', err);
  }
}

export const login = async ({ username, password }) => {
  const { data } = await api.post('/api/auth/login', { username, password });
  storage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};

export const logout = async () => {
  try {
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
    await api.post('/api/auth/logout', { refreshToken });
    await storage.deleteItem(ACCESS_TOKEN_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Logout error:', error);
  }
};