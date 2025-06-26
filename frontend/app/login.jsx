import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  StyleSheet,
  Pressable,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { makeRedirectUri } from "expo-auth-session";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { useTranslation } from "react-i18next";
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { onLogin, onGoogleLogin } = useContext(AuthContext);
  const { theme, colorScheme } = useContext(ThemeContext);
  const router = useRouter();
  const styles = createStyles(theme);
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectUri = Platform.select({
    web: "http://localhost:8081/translation",
    default: makeRedirectUri({
      native: "com.lancom.flashlingo:/login",
      useProxy: false,
    }),
  });

  const [request, response, promptAsync] = useIdTokenAuthRequest(
    {
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_WEB_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ANDROID_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    },
    {
      useProxy: true,
    }
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      await onGoogleLogin(idToken);
      // Toast.show({ type: "success", text1: t("login.googleSuccess") });
      router.replace("/(tabs)/translation");
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t("login.googleAlreadyExists"));
      } else {
        setError(t("login.unknownError"));
      }

      console.error("Google login error:", err);
    }
  };

  const handleLogin = async () => {
    try {
      await onLogin(username, password);
      // Toast.show({ type: "success", text1: t("login.success") });
      router.replace("/(tabs)/translation");
    } catch (err) {
      if (err.response?.status === 401) {
        setError(t("login.error"));
      } else if (err.response?.status === 400) {
        setError(t("login.invalidCredentials"));
      } else {
        setError(t("login.unknownError"));
        console.error("Login error:", err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder={t("login.username")}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t("login.password")}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <Pressable
        onPress={() => router.push("/register")}
        style={styles.register}
      >
        <Text style={styles.registerText}>{t("login.createAccount")}</Text>
      </Pressable>
      <Pressable onPress={handleLogin} style={styles.button} testID="login-btn">
        <Text style={styles.buttonText}>{t("login.button")}</Text>
      </Pressable>
      <Pressable
        onPress={() => promptAsync()}
        style={[styles.button, !request && styles.buttonDisabled]}
        disabled={!request}
      >
        <Text style={styles.buttonText}>{t("login.googleButton")}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.d_gray,
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      color: theme.text,
    },
    input: {
      height: 40,
      borderColor: "gray",
      borderWidth: 1,
      backgroundColor: theme.torq,
      width: Platform.OS === "web" ? "50%" : "100%",
      marginBottom: 20,
      paddingLeft: 10,
      borderRadius: 5,
    },
    errorText: {
      color: "red",
      marginBottom: 10,
    },
    button: {
      backgroundColor: theme.mint,
      padding: 10,
      borderRadius: 5,
      width: "80%",
      alignItems: "center",
      marginVertical: 5,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: "black",
      fontSize: 16,
    },
    register: {
      marginVertical: 10,
    },
    registerText: {
      color: theme.text,
      fontSize: 16,
      textDecorationLine: "underline",
    },
  });
}
