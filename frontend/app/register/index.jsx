import { View, StyleSheet, TextInput, Text } from "react-native";
import React from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { useContext, useState } from "react";
import { Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/AuthContext";

export default function register() {
  const router = useRouter();
  const { onRegister } = useContext(AuthContext);
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>\/?]).{8,}$/;

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleRegister = async () => {
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and include letters, numbers and a special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid email address.");
      return;
    }

    setError("");

    try {
      await onRegister(username, email, password);
      router.push(`/register/verify?email=${encodeURIComponent(email)}`);
      console.log("Registered with:", { email, username, password });
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Username or email already exists.");
        return;
      }
      console.error("Registration error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
      />
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
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry={true}
        autoCapitalize="none"
      />
      <Pressable style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    registerButton: {
      backgroundColor: theme.mint,
      padding: 10,
      borderRadius: 5,
      width: "20%",
      alignItems: "center",
    },
    registerText: {
      color: "black",
      fontSize: 16,
    },
    errorText: {
      color: "red",
      marginBottom: 10,
      marginLeft: 10,
    },
  });
};
