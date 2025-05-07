import { createContext, useState, useContext, useEffect } from "react";
import * as authService from "@/api/authService";
import { refreshToken } from "@/api/config";
import { setupInterceptors } from "@/api/config";

export const AuthContext = createContext({
  authState: {
    authenticated: false,
    loading: true,
  },
  onRegister: () => {},
  onLogin: () => {},
  onLogout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    authenticated: false,
    loading: true,
  });

  useEffect(() => {
    const doRefresh = async () => {
      try {
        const tokens = await refreshToken();

        if (tokens?.accessToken) {
          setAuthState({
            authenticated: true,
            loading: false,
          });
        } else {
          setAuthState({ authenticated: false, loading: false });
        }
      } catch (error) {
        setAuthState({ authenticated: false, loading: false });
      }
    }
    doRefresh();  
  }, []);

  useEffect(() => {
    setupInterceptors(setAuthState);
  }, []);

  const register = async (username, email, password) => {
    await authService.register({ username, email, password });
  }
  
  const login = async (username, password) => {
    const tokens = await authService.login({ username, password });
    if(tokens?.accessToken) {
      setAuthState({authenticated: true});
    }
  };
  
  const logout = async () => {
    await authService.logout();
    setAuthState({authenticated: false});
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
    setAuthState
  };

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}