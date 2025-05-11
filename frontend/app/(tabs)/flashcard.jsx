import { View, Text, Pressable, Platform, ScrollView } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import { Link, useFocusEffect } from "expo-router";
import FlashcardFolder from "@/components/flashcard/FlashcardFolder";
import { AuthContext } from "@/context/AuthContext";
import { Provider as PaperProvider } from "react-native-paper";

export default function FlashcardScreen() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const { authState } = useContext(AuthContext);
  const styles = createStyles(theme, width);

  const [flashcardFolder, setFlashcardFolder] = useState([]);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchFlashcards = async () => {
        try {
          const flashcardsFolder = await flashcardService.getFlashcardsFolder();
          setFlashcardFolder(flashcardsFolder);
        } catch (error) {
          console.error("Error fetching flashcards:", error);
          setError("Error while downloading flashcard folders.");
        }
      };
      if (!authState.loading && authState.authenticated) {
        fetchFlashcards();
      }
    }, [authState.loading, authState.authenticated])
  );

  const removeFolderFromState = async (id) => {
    setFlashcardFolder((current) =>
      current.filter((folder) => folder.id !== id)
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ScrollView contentContainerStyle={[styles.flashcardGrid]}>
          {flashcardFolder.length == 0 ? (
            <Text style={styles.emptyText}>You have no flashcard folders.</Text>
          ) : undefined}
          {flashcardFolder.map((folder, index) => (
            <FlashcardFolder
              key={index}
              folder={folder}
              style={styles.flashcardFolder}
              onDelete={removeFolderFromState}
            />
          ))}
        </ScrollView>
        <Link href="/flashcard/create-folder" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addText}>+</Text>
          </Pressable>
        </Link>
      </View>
    </PaperProvider>
  );
}

const createStyles = (theme, screenWidth) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.d_gray,
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
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.d_gray,
    },
    addText: {
      fontSize: 40,
      color: theme.d_gray,
      textAlign: "center",
      justifyContent: "center",
      textAlignVertical: "center",
      marginTop: Platform.OS === "web" ? -10 : -3,
    },
    flashcardGrid: {
      flexWrap: "wrap",
      justifyContent: "flex-start",
      flexDirection: "row",
      rowGap: 16,
      columnGap: 16,
      margin: 0,
    },
    errorText: {
      color: "red",
    },
    emptyText: {
      fontSize: 20,
      color: theme.text,
    },
  });
};
