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
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { makeRedirectUri } from "expo-auth-session";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { onLogin, onGoogleLogin } = useContext(AuthContext);
  const { theme, colorScheme } = useContext(ThemeContext);
  const router = useRouter();
  const styles = createStyles(theme);

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
    } else if (response?.type === "error") {
      Toast.show({ type: "error", text1: "Google sign-in failed." });
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      await onGoogleLogin(idToken);
      Toast.show({ type: "success", text1: "Logged in with Google!" });
      router.replace("/(tabs)/translation");
    } catch (err) {
      console.error("Google login error:", err);
      Toast.show({ type: "error", text1: "Backend Google login failed." });
    }
  };

  const handleLogin = async () => {
    try {
      await onLogin(username, password);
      Toast.show({ type: "success", text1: "Login successful!" });
      router.replace("/(tabs)/translation");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("An error occurred. Please try again.");
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
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <Pressable
        onPress={() => router.push("/register")}
        style={styles.register}
      >
        <Text style={styles.registerText}>Create new account.</Text>
      </Pressable>
      <Pressable onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable
        onPress={() => promptAsync()}
        style={[styles.button, !request && styles.buttonDisabled]}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
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
