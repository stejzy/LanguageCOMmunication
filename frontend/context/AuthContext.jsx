import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/api/authService";
import { refreshToken } from "@/api/config";

export const AuthContext = createContext({
  authState: {
    accessToken: null,
    refreshToken: null,
    authenticated: null,
  },
  onRegister: () => {},
  onLogin: () => {},
  onLogout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: null,
    refreshToken: null,
    authenticated: null,
  });

  useEffect(() => {
    const doRefresh = async () => {
      const tokens = await refreshToken();

      if (tokens?.accessToken) {
        setAuthState({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          authenticated: true,
        });
      } else {
        setAuthState({
          accessToken: null,
          refreshToken: null,
          authenticated: false,
        });
      }
    };
    doRefresh();  
  }, []);

  const register = async (username, email, password) => {
    await authService.register({ username, email, password });
  }
  
  const login = async (username, password) => {
    const tokens = await authService.login({ username, password });
    if(tokens?.accessToken && tokens?.refreshToken) {
      setAuthState({accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, authenticated: true});
    }
  };
  
  const logout = async () => {
    await authService.logout();
    setAuthState({accessToken: null, refreshToken: null, authenticated: false});
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