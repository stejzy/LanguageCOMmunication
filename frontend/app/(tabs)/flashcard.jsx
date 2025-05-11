import { View, Text, Pressable, Platform } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import { Link } from "expo-router";
import FlashcardFolder from "@/components/flashcard/FlashcardFolder";

export default function FlashcardScreen() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const [flashcardFolder, setFlashcardFolder] = useState([]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const flashcardsFolder = await flashcardService.getFlashcardsFolder();
        setFlashcardFolder(flashcardsFolder);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };
    fetchFlashcards();
  }, []);

  return (
    <View style={styles.container}>
      {flashcardFolder.map((folder, index) => (
        <FlashcardFolder key={index} folder={folder} />
      ))}
      <Link href="/flashcard/create-folder" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </Link>
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
      textC: theme.l_mint,
    },
    addButton: {
      position: "absolute",
      right: 24,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.mint,
      justifyContent: "center",
      alignItems: "center",
      shadowRadius: 4,
      elevation: 6,
    },
    addText: {
      fontSize: 40,
      color: theme.d_gray,
      textAlign: "center",
      justifyContent: "center",
      textAlignVertical: "center",
      marginTop: Platform.OS === "web" ? -10 : -3,
    },
  });
};
