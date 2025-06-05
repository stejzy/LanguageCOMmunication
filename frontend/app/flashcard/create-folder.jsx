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
import { Keyboard, Animated } from "react-native";
import { Platform } from "react-native";

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

  const footerBottom = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(footerBottom, {
        toValue: e.endCoordinates.height,
        duration: 0,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(footerBottom, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [footerBottom]);

  return (
    <PaperProvider
      theme={{
        colors: {
          primary: colorScheme === "light" ? theme.mint : theme.mint,
          onSurface: colorScheme === "light" ? theme.text : theme.l_mint,
          onSurfaceVariant:
            colorScheme === "light" ? theme.l_mint : theme.l_mint,
          background: theme.d_gray,
          elevation: {
            level1: theme.shadow,
          },
        },
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("flashcardCreateFolder")}</Text>
          <Text style={styles.description}>
            {t("flashcardCreateFolderDesc")}
          </Text>
          <TextInput
            testID="flashcard-folder-name-input"
            mode="flat"
            label={t("flashcardFolderName")}
            placeholder={t("flashcardFolderNamePlaceholder")}
            value={flashcardName}
            theme={{
              colors: {
                onSurfaceVariant:
                  colorScheme === "light" ? theme.torq : theme.l_mint,
              },
            }}
            onChangeText={setFlashcardName}
            onBlur={() => setTouchedName(true)}
            style={[styles.input]}
          />
          <HelperText
            type="error"
            visible={touchedName && isNameError}
            style={styles.helperText}
          >
            {t("flashcardFieldRequired")}
          </HelperText>
          <ScrollView
            contentContainerStyle={[
              styles.flashcardsContainer,
              { paddingBottom: 120 },
            ]}
            style={{ width: "100%" }}
            keyboardShouldPersistTaps="handled"
          >
            {flashcards.map((card, index) => (
              <View key={index} style={styles.cardBox}>
                <View style={styles.cardHeader}>
                  <Text style={styles.flashcardRowTitle}>
                    {t("flashcardAddCard")} {index + 1}
                  </Text>
                  {flashcards.length > 1 && (
                    <Pressable
                      onPress={() => removeFlashcard(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#FF5A5F"
                      />
                    </Pressable>
                  )}
                </View>
                <TextInput
                  testID={`flashcard-front-content-${index}`}
                  label={t("flashcardFrontContent")}
                  placeholder={t("flashcardFrontContentPlaceholder")}
                  value={card.frontContent}
                  onChangeText={(text) =>
                    updateFlashcard(index, "frontContent", text)
                  }
                  style={[styles.flashcardInput]}
                />
                <HelperText
                  type="error"
                  visible={card.touchedFront && isFrontError(index)}
                  style={styles.helperText}
                >
                  {t("flashcardFieldRequired")}
                </HelperText>
                <TextInput
                  testID={`flashcard-back-content-${index}`}
                  label={t("flashcardBackContent")}
                  placeholder={t("flashcardBackContentPlaceholder")}
                  value={card.backContent}
                  onChangeText={(text) =>
                    updateFlashcard(index, "backContent", text)
                  }
                  style={[styles.flashcardInput]}
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
        </View>
        <Animated.View style={[styles.footer, { bottom: footerBottom }]}>
          <Pressable
            onPress={addFlashcard}
            style={styles.addButton}
            testID="add-flashcard-button"
          >
            <Ionicons
              name="add-circle"
              size={28}
              color={Colors[colorScheme].d_gray}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addButtonText}>
              {t("flashcardAddCardButton")}
            </Text>
          </Pressable>
          <Pressable
            testID="create-folder-button"
            style={[
              styles.createButton,
              !isFormValid && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
          >
            <Text style={styles.createText}>{t("flashcardCreate")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </PaperProvider>
  );
};

const createStyles = (theme, colorScheme, screenWidth) => {
  const isWide = screenWidth > 600;
  return StyleSheet.create({
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.dark_torq,
      borderTopWidth: 1,
      borderBottomWidth: Platform.OS === "web" ? 0 : 1,
      borderTopColor: theme.l_mint,
      borderBottomColor: theme.l_mint,
      zIndex: 10,
    },
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
      borderRadius: 12,
      fontSize: 17,
      alignSelf: "center",
      minWidth: 220,
    },
    createButton: {
      flex: 1,
      marginLeft: 8,
      borderRadius: 16,
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: theme.torq,
      minWidth: 0,
      justifyContent: "center",
    },
    createButtonDisabled: {
      backgroundColor: colorScheme === "light" ? theme.disable : theme.l_mint,
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
      width: "100%",
      borderRadius: 10,
      fontSize: 16,
      minWidth: 220,
      maxHeight: 60,
    },
    flashcardRowTitle: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 18,
      color: colorScheme === "light" ? theme.text : theme.l_mint,
      letterSpacing: 0.2,
    },
    addButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
      backgroundColor: theme.mint,
      borderRadius: 20,
      paddingHorizontal: 0,
      paddingVertical: 10,
      minWidth: 0,
      justifyContent: "center",
    },
    addButtonText: {
      color: theme.d_gray,
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
      letterSpacing: 0.2,
    },
    helperText: {
      marginTop: 0,
      marginBottom: 4,
      fontSize: 14,
      color: "red",
    },
  });
};

export default CreateFolder;
