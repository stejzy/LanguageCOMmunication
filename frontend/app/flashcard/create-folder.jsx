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
import { useTranslation } from "react-i18next";
import { Colors } from "@/constans/Colors";

import * as flashcardService from "@/api/flashcardService";

const CreateFolder = () => {
  const { width } = useWindowDimensions();
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme, width);
  const router = useRouter();
  const { t } = useTranslation();

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
    setFlashcards((prev) =>
      prev.map((c) => ({ ...c, touchedFront: true, touchedBack: true }))
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
        text1: t("flashcardCreateFolderSuccess"),
      });
      setTouchedName(false);
      setFlashcardName("");
      setFlashcards([
        {
          frontContent: "",
          backContent: "",
          touchedFront: false,
          touchedBack: false,
        },
      ]);
      const didGoBack = router.back();
      if (!didGoBack) {
        router.replace("/(tabs)/flashcard");
      }
    } catch (error) {
      Toast.show({ type: "error", text1: t("flashcardCreateFolderError") });
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

  const isNameError = touchedName && flashcardName.trim() === "";
  const isFrontError = (i) =>
    flashcards[i].touchedFront && flashcards[i].frontContent.trim() === "";
  const isBackError = (i) =>
    flashcards[i].touchedBack && flashcards[i].backContent.trim() === "";

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>{t("flashcardCreateFolder")}</Text>
        <Text style={styles.description}>{t("flashcardCreateFolderDesc")}</Text>
        <TextInput
          mode="flat"
          label={t("flashcardFolderName")}
          placeholder={t("flashcardFolderNamePlaceholder")}
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
        <HelperText
          type="error"
          visible={touchedName && isNameError}
          style={styles.helperText}
        >
          {t("flashcardFieldRequired")}
        </HelperText>
        <ScrollView
          contentContainerStyle={styles.flashcardsContainer}
          style={{ width: "100%" }}
        >
          {flashcards.map((card, index) => (
            <View key={index} style={styles.cardBox}>
              <View style={styles.cardHeader}>
                <Text style={styles.flashcardRowTitle}>
                  {t("flashcardAddCard")} {index + 1}
                </Text>
                {flashcards.length > 1 && (
                  <Pressable
                    onPressIn={() => removeFlashcard(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={22} color="#FF5A5F" />
                  </Pressable>
                )}
              </View>
              <TextInput
                label={t("flashcardFrontContent")}
                placeholder={t("flashcardFrontContentPlaceholder")}
                style={styles.flashcardInput}
                value={card.frontContent}
                onChangeText={(text) =>
                  updateFlashcard(index, "frontContent", text)
                }
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
              <HelperText
                type="error"
                visible={card.touchedFront && isFrontError(index)}
                style={styles.helperText}
              >
                {t("flashcardFieldRequired")}
              </HelperText>
              <TextInput
                label={t("flashcardBackContent")}
                placeholder={t("flashcardBackContentPlaceholder")}
                style={styles.flashcardInput}
                value={card.backContent}
                onChangeText={(text) =>
                  updateFlashcard(index, "backContent", text)
                }
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
              <HelperText
                type="error"
                visible={card.touchedBack && isBackError(index)}
                style={styles.helperText}
              >
                {t("flashcardFieldRequired")}
              </HelperText>
            </View>
          ))}
        </ScrollView>
        <Pressable onPressIn={addFlashcard} style={styles.addButton}>
          <Ionicons
            name="add-circle"
            size={28}
            color={Colors[colorScheme].torq}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.addButtonText}>
            {t("flashcardAddCardButton")}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.createButton,
            !isFormValid && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
        >
          <Text style={styles.createText}>{t("flashcardCreate")}</Text>
        </Pressable>
      </View>
    </PaperProvider>
  );
};

const createStyles = (theme, colorScheme, screenWidth) => {
  const isWide = screenWidth > 600;
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.d_gray,
      paddingHorizontal: isWide ? 0 : 10,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: theme.torq,
      marginVertical: 18,
      textAlign: "center",
    },
    description: {
      fontSize: 15,
      color: theme.text,
      marginBottom: 14,
      textAlign: "center",
      opacity: 0.8,
      maxWidth: 420,
      alignSelf: "center",
    },
    input: {
      width: isWide ? 400 : "100%",
      borderColor: theme.mint,
      borderWidth: 1,
      paddingHorizontal: 14,
      marginVertical: 10,
      backgroundColor: theme.dark_torq,
      color: theme.text,
      borderRadius: 12,
      fontSize: 17,
      alignSelf: "center",
    },
    createButton: {
      marginVertical: 20,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 40,
      alignItems: "center",
      backgroundColor: theme.torq,
      shadowColor: theme.torq,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
      minWidth: 220,
      alignSelf: "center",
      transform: [{ scale: 1 }],
    },
    createButtonDisabled: {
      backgroundColor: theme.l_mint,
      opacity: 0.6,
    },
    createText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.d_gray,
      letterSpacing: 0.5,
    },
    cardBox: {
      backgroundColor: theme.dark_torq,
      borderRadius: 16,
      padding: 18,
      marginBottom: 18,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.l_mint,
      maxWidth: 500,
      alignSelf: "center",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    removeButton: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: theme.torq,
    },
    flashcardsContainer: {
      padding: 4,
      alignItems: "stretch",
      maxWidth: 520,
      alignSelf: "center",
    },
    flashcardInput: {
      flex: 1,
      margin: 5,
      borderColor: theme.mint,
      borderWidth: 1,
      paddingHorizontal: 12,
      marginVertical: 8,
      backgroundColor: theme.d_gray,
      color: theme.text,
      width: "100%",
      borderRadius: 10,
      fontSize: 16,
    },
    flashcardRowTitle: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 18,
      color: theme.torq,
      letterSpacing: 0.2,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      marginVertical: 10,
      backgroundColor: theme.mint,
      borderRadius: 20,
      paddingHorizontal: 22,
      paddingVertical: 10,
      shadowColor: theme.mint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.13,
      shadowRadius: 6,
      elevation: 2,
      minWidth: 180,
    },
    addButtonText: {
      color: theme.d_gray,
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
      letterSpacing: 0.2,
    },
    helperText: {
      marginTop: 2,
      marginBottom: 6,
      fontSize: 14,
    },
  });
};

export default CreateFolder;
