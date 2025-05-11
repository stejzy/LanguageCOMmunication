import { View, Text } from "react-native";
import React, { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { HelperText, PaperProvider, TextInput } from "react-native-paper";
import { ScrollView } from "react-native";
import { useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import * as flashcardService from "@/api/flashcardService";

const CreateFolder = () => {
  const { width } = useWindowDimensions();
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, width);
  const router = useRouter();

  const [touchedName, setTouchedName] = useState(false);
  const [flashcardName, setFlashcardName] = useState("");
  const [flashcards, setFlashcards] = useState([
    {
      frontContent: "",
      backContent: "",
      touchedFront: false,
      touchedBack: false,
    },
  ]);

  const isFormValid =
    flashcardName.trim().length > 0 &&
    flashcards.every(
      (c) => c.frontContent.trim().length > 0 && c.backContent.trim().length > 0
    );

  const handleCreate = async () => {
    setTouchedName(true);
    setFlashcards(
      flashcards.map((c) => ({
        ...c,
        touchedFront: true,
        touchedBack: true,
      }))
    );

    if (!isFormValid) {
      return;
    }
    try {
      const res = await flashcardService.createFlashcardFolder({
        name: flashcardName,
        flashcards,
      });
      Toast.show({
        type: "success",
        text1: "Successfully created Flashcard Folder!",
      });
      const didGoBack = router.back();
      if (!didGoBack) {
        router.replace("/(tabs)/flashcard");
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error! Try again later!" });
    }
  };

  const addFlashcard = () => {
    setFlashcards([
      ...flashcards,
      {
        frontContent: "",
        backContent: "",
        touchedFront: false,
        touchedBack: false,
      },
    ]);
  };

  const removeFlashcard = (index) => {
    if (flashcards.length <= 1) return;
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const updateFlashcard = (index, field, text) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = text;
    setFlashcards(newFlashcards);
  };

  const onBlurField = (index, field) => {
    const updated = [...flashcards];
    updated[index][field] = true;
    setFlashcards(updated);
  };

  const isNameError = touchedName && flashcardName.trim() === "";
  const isFrontError = (i) =>
    flashcards[i].touchedFront && flashcards[i].frontContent.trim() === "";
  const isBackError = (i) =>
    flashcards[i].touchedBack && flashcards[i].backContent.trim() === "";

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Create Flashcard Folder</Text>
        <TextInput
          mode="flat"
          label="Folder name"
          value={flashcardName}
          onChangeText={(text) => setFlashcardName(text)}
          onBlur={() => setTouchedName(true)}
          outlineColor={theme.text}
          underlineColor="transparent"
          activeOutlineColor="transparent"
          selectionColor={theme.l_mint}
          theme={{
            colors: {
              primary: theme.l_mint,
              placeholder: theme.l_mint,
              text: theme.l_mint,
            },
          }}
          style={styles.input}
        />
        <HelperText type="error" visible={isNameError}>
          This field cannot be empty.
        </HelperText>
        <ScrollView
          contentContainerStyle={styles.flashcardsContainer}
          style={{ width: "80%" }}
        >
          {flashcards.map((card, index) => (
            <View key={index} style={styles.flashcardsRow}>
              <Text style={styles.flashcardRowTitle}>
                Flashcard {index + 1}
              </Text>
              <View style={styles.inputGroup}>
                <TextInput
                  label="Front content"
                  style={styles.flashcardInput}
                  value={card.frontContent}
                  onChangeText={(text) =>
                    updateFlashcard(index, "frontContent", text)
                  }
                  onBlur={() => onBlurField(index, "touchedFront")}
                  outlineColor={theme.text}
                  underlineColor="transparent"
                  activeOutlineColor="transparent"
                  selectionColor={theme.l_mint}
                  theme={{
                    colors: {
                      primary: theme.l_mint,
                      placeholder: theme.l_mint,
                      text: theme.l_mint,
                    },
                  }}
                />
                <HelperText type="error" visible={isFrontError(index)}>
                  Fill in this field
                </HelperText>
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  label="Back content"
                  style={styles.flashcardInput}
                  value={card.backContent}
                  onChangeText={(text) =>
                    updateFlashcard(index, "backContent", text)
                  }
                  onBlur={() => onBlurField(index, "touchedBack")}
                  outlineColor={theme.text}
                  underlineColor="transparent"
                  activeOutlineColor="transparent"
                  selectionColor={theme.l_mint}
                  theme={{
                    colors: {
                      primary: theme.l_mint,
                      placeholder: theme.l_mint,
                      text: theme.l_mint,
                    },
                  }}
                />
                <HelperText type="error" visible={isBackError(index)}>
                  Fill in this field
                </HelperText>
              </View>
              <Pressable
                onPressIn={() => removeFlashcard(index)}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
                <></>
              </Pressable>
            </View>
          ))}
          <Pressable onPressIn={() => addFlashcard()} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={48} color={theme.mint} />
            <></>
          </Pressable>
        </ScrollView>
        <Pressable style={styles.createButton} onPress={() => handleCreate()}>
          <Text style={styles.createText}>Create Folder</Text>
        </Pressable>
      </View>
    </PaperProvider>
  );
};

const createStyles = (theme, screenWidth) => {
  const isWide = screenWidth > 600;
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.d_gray,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginVertical: 20,
    },
    input: {
      width: "80%",
      borderColor: theme.mint,
      borderWidth: 1,
      paddingHorizontal: 10,
      marginVertical: 10,
      backgroundColor: theme.d_gray,
      color: theme.text,
    },
    createButton: {
      marginVertical: 20,
    },
    createText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      padding: 10,
      backgroundColor: theme.mint,
      borderRadius: 10,
    },
    flashcardsRow: {
      flexDirection: isWide ? "row" : "column",
      alignItems: isWide ? "center" : "stretch",
      justifyContent: isWide ? "flex-start" : "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.l_mint,
      borderRadius: 10,
      padding: 25,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    },
    flashcardsContainer: {
      padding: 4,
      alignItems: "stretch",
    },
    flashcardInput: {
      flex: 1,
      margin: 5,
      borderColor: theme.mint,
      borderWidth: 1,
      paddingHorizontal: 10,
      marginVertical: 10,
      backgroundColor: theme.d_gray,
      color: theme.text,
      width: "100%",
    },
    flashcardRowTitle: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 20,
      color: theme.text,
    },
    iconButton: {
      padding: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    addButton: {
      alignSelf: "center",
      marginVertical: 16,
    },
    inputGroup: {
      flex: 1,
      flexDirection: "column",
      marginHorizontal: 5,
    },
  });
};

export default CreateFolder;
