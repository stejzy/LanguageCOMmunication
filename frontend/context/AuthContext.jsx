import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import * as authService from "@/api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Config from 'react-native-config';

const TOKEN_KEY = "jwt_key";
export const API_URL = Config.REACT_APP_API_URL;

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

export const AuthContext = createContext({
  authState: {
    token: null,
    authenticated: null,
  },
  onRegister: () => {},
  onLogin: () => {},
  onLogout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await storage.getItem(TOKEN_KEY);
      if (token) {
        setAuthState({
          token,
          authenticated: true,
        });
      }
    };
    checkToken();
  }, []);

  const register = async (username, email, password) => {
    await authService.register({ username, email, password });
  }
  
  const login = async (username, password) => {
    const tkn = await authService.login({ username, password });
    setToken(tkn);
  };
  
  const logout = async () => {
    await authService.logout();
    setToken(null);
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState
  };

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}