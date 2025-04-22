import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from 'react-native-config';

const BASE_URL = Config.REACT_APP_API_URL;
const TOKEN_KEY = Config.REACT_APP_TOKEN_KEY;
const REFRESH_TOKEN_KEY = Config.REACT_APP_REFRESH_TOKEN_KEY;

console.log(BASE_URL);

const isWeb = Platform.OS === 'web';

const storage = {
  getItem: (key) =>
    isWeb
      ? AsyncStorage.getItem(key)
      : SecureStore.getItemAsync(key),
  setItem: (key, value) =>
    isWeb
      ? AsyncStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value),
  deleteItem: (key) =>
    isWeb
      ? AsyncStorage.removeItem(key)
      : SecureStore.deleteItemAsync(key),
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

const refreshToken = async () => {
  const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await api.post('/api/auth/refresh');
    const { token } = response.data;
  
    await storage.setItem(TOKEN_KEY, token);
  
    return token;
  } catch (err) {
    console.error('Error refreshing token:', err);
    return null;
  }
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
)

export default api;