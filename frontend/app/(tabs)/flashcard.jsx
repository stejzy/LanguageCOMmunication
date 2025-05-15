import {
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import React, { useCallback, useContext, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import { Link, useFocusEffect } from "expo-router";
import FlashcardFolder from "@/components/flashcard/FlashcardFolder";
import { AuthContext } from "@/context/AuthContext";
import { PaperProvider } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function FlashcardScreen() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const { authState } = useContext(AuthContext);
  const styles = createStyles(theme, width);
  const { t } = useTranslation();

  const [flashcardFolder, setFlashcardFolder] = useState([]);
  const [error, setError] = useState("");
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchFlashcards = async () => {
        try {
          const flashcardsFolder =
            await flashcardService.getFlashcardManyFolder();
          setFlashcardFolder(flashcardsFolder);
        } catch (error) {
          console.error("Error fetching flashcards:", error);
          setError(t("flashcardFolderDownloadError"));
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

  const closeImportModal = () => {
    setImportModalVisible(false);
    setImportCode("");
    setImportError("");
    setImportSuccess("");
  };

  const handleImport = async () => {
    setImportLoading(true);
    setImportError("");
    setImportSuccess("");
    try {
      const folder = await flashcardService.importFlashcardFolder(
        importCode.trim()
      );
      if (folder && folder.id) {
        setFlashcardFolder((prev) => [
          folder,
          ...prev.filter((f) => f.id !== folder.id),
        ]);
        setImportSuccess(t("flashcardImportSuccess"));
        setImportCode("");
        setTimeout(() => {
          closeImportModal();
        }, 400);
      } else {
        setImportError(t("flashcardImportError"));
      }
    } catch (e) {
      setImportError(t("flashcardImportError"));
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ScrollView contentContainerStyle={[styles.flashcardGrid]}>
          {flashcardFolder.length == 0 ? (
            <Text style={styles.emptyText}>
              {t("flashcardNoFoldersMessage")}
            </Text>
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
        <Pressable
          style={[
            styles.addButton,
            { left: 24, right: undefined, backgroundColor: theme.torq },
          ]}
          onPress={() => {
            setImportModalVisible(true);
            setImportCode("");
            setImportError("");
            setImportSuccess("");
          }}
        >
          <Text style={[styles.addText, { color: theme.d_gray }]}>↓</Text>
        </Pressable>
        <Link href="/flashcard/create-folder" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addText}>+</Text>
          </Pressable>
        </Link>
        {/* Import Folder Modal */}
        <Modal
          visible={importModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeImportModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 0 : 0}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.d_gray,
                  padding: 28,
                  borderRadius: 18,
                  width: Platform.OS === "web" ? 400 : "95%",
                  maxWidth: 500,
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.torq,
                    fontSize: 24,
                    marginBottom: 18,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {t("flashcardImport")}
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {t("flashcardImportDesc")}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.dark_torq,
                    color: theme.text,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 18,
                    fontSize: 18,
                  }}
                  value={importCode}
                  onChangeText={setImportCode}
                  placeholder={t("flashcardImportPlaceholder")}
                  placeholderTextColor={theme.text}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {importError ? (
                  <Text
                    style={{
                      color: "#FF5A5F",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {importError}
                  </Text>
                ) : null}
                {importSuccess ? (
                  <Text
                    style={{
                      color: theme.torq,
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {importSuccess}
                  </Text>
                ) : null}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Pressable
                    onPress={closeImportModal}
                    style={{
                      padding: 12,
                      backgroundColor: theme.dark_torq,
                      borderRadius: 10,
                      flex: 1,
                      marginRight: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        textAlign: "center",
                        fontSize: 16,
                      }}
                    >
                      {t("flashcardCancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleImport}
                    style={{
                      padding: 12,
                      backgroundColor: theme.torq,
                      borderRadius: 10,
                      flex: 1,
                      marginLeft: 10,
                      opacity: importLoading ? 0.7 : 1,
                    }}
                    disabled={importLoading}
                  >
                    <Text
                      style={{
                        color: theme.d_gray,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {t("flashcardImportButton")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
