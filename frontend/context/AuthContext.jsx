import { createContext, useState, useContext, useEffect } from "react";
import * as authService from "@/api/authService";
import { refreshToken } from "@/api/config";
import { setupInterceptors } from "@/api/config";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext({
  authState: {
    authenticated: false,
    loading: true,
  },
  onRegister: () => {},
  onLogin: () => {},
  onLogout: () => {},
});

const getUsernameFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.sub || decoded.username || null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    authenticated: false,
    loading: true,
    username: null,
  });

  useEffect(() => {
    const doRefresh = async () => {
      try {
        const tokens = await refreshToken();

        if (tokens?.accessToken) {
          const username = getUsernameFromToken(tokens.accessToken);
          setAuthState({
            authenticated: true,
            loading: false,
            username,
          });
        } else {
          setAuthState({
            authenticated: false,
            loading: false,
            username: null,
          });
        }
      } catch (error) {
        setAuthState({ authenticated: false, loading: false, username: null });
      }
    };
    doRefresh();
  }, []);

  useEffect(() => {
    setupInterceptors(setAuthState);
  }, []);

  const register = async (username, email, password) => {
    await authService.register({ username, email, password });
  };

  const login = async (username, password) => {
    const tokens = await authService.login({ username, password });
    if (tokens?.accessToken) {
      const uname = getUsernameFromToken(tokens.accessToken);
      setAuthState({ authenticated: true, username: uname });
    }
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({ authenticated: false, username: null });
  };

  const googleLogin = async (idToken) => {
    const tokens = await authService.googleLogin(idToken);
    if (tokens?.accessToken) {
      const uname = getUsernameFromToken(tokens.accessToken);
      setAuthState({ authenticated: true, username: uname });
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    onGoogleLogin: googleLogin,
    authState,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
