import api, { setAccessToken } from "./config";
import storage from "@/utils/storage";

const REFRESH_TOKEN_KEY = process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY;

export const register = async ({ username, email, password }) => {
  await api.post("/api/auth/register", { username, email, password });
};

export const login = async ({ username, password }) => {
  const { data } = await api.post("/api/auth/login", { username, password });
  storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  setAccessToken(data.accessToken);
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};

export const logout = async () => {
  const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    await api.post("/api/auth/logout", { refreshToken });
    await storage.deleteItem(REFRESH_TOKEN_KEY);
  }
  setAccessToken(null);
};

export const verifyEmail = async ({ email, code }) => {
  await api.post("api/auth/verify", { email: email, code: code });
};

export const googleLogin = async (idToken) => {
  const { data } = await api.post("/api/auth/google", { idToken: idToken });
  storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  setAccessToken(data.accessToken);
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};
