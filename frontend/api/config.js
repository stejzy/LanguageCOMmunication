import axios from 'axios';
import storage from '@/utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const ACCESS_TOKEN_KEY = process.env.EXPO_PUBLIC_ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const refreshToken = async () => {
  const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    return null;
  }
  try {
    const { data } = await api.post('/api/auth/refresh', { refreshToken: refreshToken });

    await storage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch (err) {
    await storage.deleteItem(ACCESS_TOKEN_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
    console.error('Error refreshing token:', err);
  }
}

api.interceptors.request.use(async config => {
  const token = await storage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = await refreshToken();
      if (tokens?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
)

export default api;