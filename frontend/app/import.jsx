import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { AuthContext } from "@/context/AuthContext";

export default function ImportFlashcardFolder() {
  const { theme } = useContext(ThemeContext);
  const colorScheme = theme?.colorScheme || "light";
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { authState } = useContext(AuthContext);

  const [importCode, setImportCode] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  useEffect(() => {
    if (params.folder && !authState.loading && authState.authenticated) {
      setImportCode(params.folder.toString());
      handleImport(params.folder.toString());
    }
    // eslint-disable-next-line
  }, [params.folder, authState.loading, authState.authenticated]);

  const waitForAuth = async () => {
    let waited = 0;
    while (authState.loading && waited < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waited += 100;
    }
  };

  const handleImport = async (code) => {
    setImportLoading(true);
    setImportError("");
    setImportSuccess("");
    try {
      await waitForAuth();
      if (!authState.authenticated) {
        setImportError(t("flashcardImportError"));
        Toast.show({ type: "error", text1: t("flashcardImportError") });
        setTimeout(() => {
          router.replace("/translation");
        }, 1500);
        return;
      }
      const folder = await flashcardService.importFlashcardFolder(
        (code || importCode).trim()
      );
      if (folder && folder.id) {
        setImportSuccess(t("flashcardImportSuccess"));
        setImportCode("");
        Toast.show({ type: "success", text1: t("flashcardImportSuccess") });
        setTimeout(() => {
          router.replace(`/flashcard/${folder.id}`);
        }, 1000);
      } else {
        console.error(e);
        setImportError(t("flashcardImportError"));
        Toast.show({ type: "error", text1: t("flashcardImportError") });
        setTimeout(() => {
          router.replace("/translation");
        }, 1500);
      }
    } catch (e) {
      setImportError(t("flashcardImportError"));
      console.error(e);
      Toast.show({ type: "error", text1: t("flashcardImportError") });
      setTimeout(() => {
        router.replace("/translation");
      }, 1500);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 60 : 0}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.d_gray,
          padding: 16,
        }}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "black" : "white"}
        />
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
              style={{ color: "#FF5A5F", marginBottom: 8, textAlign: "center" }}
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
              onPress={() => router.back()}
              style={{
                padding: 12,
                backgroundColor: theme.dark_torq,
                borderRadius: 10,
                flex: 1,
                marginRight: 10,
              }}
            >
              <Text
                style={{ color: theme.text, textAlign: "center", fontSize: 16 }}
              >
                {t("flashcardCancel")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleImport()}
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
  );
}
