import api from './config';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = "jwt_key";

export const register = ({ username, email, password }) =>
  api.post('/api/auth/register', { username, email, password });

export const login = async ({ username, password }) => {
  const { data } = await api.post('/api/auth/login', { username, password });
  await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
  return data.accessToken;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};