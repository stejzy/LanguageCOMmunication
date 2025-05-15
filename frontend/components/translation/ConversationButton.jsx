import { Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { AuthContext } from "@/context/AuthContext";

export default function ConversationButton() {
  const router = useRouter();

  const { theme } = useContext(ThemeContext);

  const styles = createStyles(theme);

  const handlePress = () => {
    router.push("/conversation");
  };

  return (
    <Pressable onPress={handlePress} style={styles.button}>
      <Ionicons name="people" size={25} color={theme.text} />
    </Pressable>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      backgroundColor: theme.torq,
      height: 50,
      width: 50,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.5,
      shadowRadius: 7,

      elevation: 5,
    },
  });
}
