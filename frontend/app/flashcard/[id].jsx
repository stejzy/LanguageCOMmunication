import { ThemeContext } from "@/context/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as flashcardService from "@/api/flashcardService";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

function FlashcardFolderDetail() {
  const { id } = useLocalSearchParams();
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const [flashcards, setFlashcards] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const folder = await flashcardService.getFlashcardOneFolder(id);
        setFlashcards(folder.flashcards);
        setFolderName(folder.name);
        setCreatedAt(folder.createdAt);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to load flashcards. Try again later!",
        });
        console.error(error);
      }
    };
    if (id) {
      fetchFlashcards();
    }
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.folderName}>{folderName}</Text>
      <Text style={styles.createdAt}>
        Created at:{" "}
        {new Date(createdAt).toLocaleDateString("en-EN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <ScrollView style={styles.flashcardsContainer}>
        {flashcards.map((flashcard, index) => (
          <View key={index} style={styles.flashcardRow}>
            <View style={styles.flashcard}>
              <Text style={styles.flashcardFront}>
                {flashcard.frontContent}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.flashcardBack}>{flashcard.backContent}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.editButton}>
                <Ionicons name="create-outline" size={20} color={theme.torq} />
              </Pressable>
              <Pressable style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.d_gray,
      paddingTop: 24,
      paddingHorizontal: 16,
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    folderName: {
      fontSize: 30,
      fontWeight: "500",
      color: theme.torq,
      marginBottom: 5,
      textAlign: "center",
    },
    createdAt: {
      fontSize: 15,
      fontStyle: "italic",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
    },
    flashcardsContent: {
      paddingBottom: 32,
    },
    flashcard: {
      flex: 1,
      backgroundColor: theme.torq,
      borderRadius: 8,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
      justifyContent: "center",
    },
    textContainer: {
      alignItems: "center",
    },
    flashcardFront: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    separator: {
      height: 1,
      width: "80%",
      backgroundColor: theme.l_mint,
      marginVertical: 10,
    },
    flashcardBack: {
      fontSize: 18,
      fontWeight: "400",
      color: theme.l_mint,
      textAlign: "center",
    },
    actions: {
      flexDirection: "column",
      gap: 10,
      marginLeft: 12,
    },
    editButton: {
      backgroundColor: theme.d_gray,
      borderRadius: 20,
      padding: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButton: {
      backgroundColor: theme.d_gray,
      borderRadius: 20,
      padding: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    flashcardRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
      justifyContent: "space-between",
    },
  });
};

export default FlashcardFolderDetail;
