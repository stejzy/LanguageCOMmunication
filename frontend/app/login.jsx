import { View, Text, TextInput, Button, Platform } from "react-native";
import React, { useContext } from "react";
import { useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";

export default function AuthScreen({ navigation }) {
  const { onLogin } = useContext(AuthContext);
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  const router = useRouter();
  const styles = createStyles(theme);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await onLogin(username, password);
      Toast.show({ type: "success", text1: "Login successful!" });
      router.push("/(tabs)/translation");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("An error occurred. Please try again.");
        console.error("Login error:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
        autoCapitalize="none"
      />
      <Pressable
        style={styles.register}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.registerText}>Create new account.</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
      width: "20%",
      alignItems: "center",
    },
    buttonText: {
      color: "black",
      fontSize: 16,
    },
    register: {
      padding: 0,
    },
    registerText: {
      color: theme.text,
      fontSize: 16,
      marginBottom: 20,
      textDecorationLine: "underline",
      padding: 0,
    },
  });
}
