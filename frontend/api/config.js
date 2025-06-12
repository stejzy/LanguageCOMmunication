import axios from "axios";
import storage from "@/utils/storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const REFRESH_TOKEN_KEY = process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY;

let isRefreshing = false;
let queue = [];
let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

const processQueue = (error, token = null) => {
  queue.forEach((prom) => prom(token, error));
  queue = [];
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshToken = async () => {
  const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data } = await api.post("/api/auth/refresh", {
    refreshToken: refreshToken,
  });

  setAccessToken(data.accessToken);
  await storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};

api.interceptors.request.use(
  async (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupInterceptors = (setAuthState) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error?.response?.status === 401 &&
        originalRequest.url.includes("/api/auth/refresh")
      ) {
        //storage.deleteItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setAuthState({ authenticated: false });
      }

      if (
        error?.response?.status === 401 &&
        (originalRequest.url.includes("/api/auth/login") ||
          originalRequest.url.includes("/api/auth/register"))
      ) {
        return Promise.reject(error);
      }

      if (error?.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push((token, error) => {
              if (error) {
                reject(error);
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequest));
              }
            });
          });
        }

        isRefreshing = true;
        originalRequest._retry = true;
        try {
          const tokens = await refreshToken();
          processQueue(null, tokens.accessToken);
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          //storage.deleteItem(REFRESH_TOKEN_KEY);
          setAccessToken(null);
          setAuthState({ authenticated: false });
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
