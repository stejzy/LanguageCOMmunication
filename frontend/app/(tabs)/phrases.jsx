import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { translate, getSupportedLanguages } from "@/api/translationService";
import { ThemeContext } from "@/context/ThemeContext";
import { AuthContext } from "@/context/AuthContext";
import { generatePhrase } from "@/api/phraseService";

import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/translation/LanguageSelector";
import useKeyboard from "@/hooks/useKeyboard";
import { LanguageContext } from "@/context/LanguageContext";
import { TranslationHistoryContext } from "@/context/TranslationHistoryContext";
import { useGlobalAddFlashcardModal } from "@/context/AddFlashcardModalContext";
import { KeyboardAvoidingView } from "react-native";

export default function PhrasesScreen() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const { authState } = useContext(AuthContext);
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();

  const [inputPhrase, setInputPhrase] = useState("");
  const [generatedPhrases, setGeneratedPhrases] = useState([]);
  const [translatedPhrases, setTranslatedPhrases] = useState([]);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const { history, addAndRefresh, refreshHistory } = useContext(
    TranslationHistoryContext
  );

  const { openModal } = useGlobalAddFlashcardModal();

  const { targetLanguage } = useContext(LanguageContext);

  const hasText = inputPhrase.trim().length > 0;

  const { t } = useTranslation();
  const keyboardVisible = useKeyboard();

  const inputRef = useRef(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      if (authState?.authenticated) {
        const langs = await getSupportedLanguages();
        setSupportedLanguages(langs);
      }
    };
    fetchLanguages();
  }, [authState?.authenticated]);

  const handleGenerate = async () => {
    try {
      const res = await generatePhrase(inputPhrase);
      setGeneratedPhrases([
        { text: inputPhrase, response: res },
        ...generatedPhrases,
      ]);
      setTranslatedPhrases(["", ...translatedPhrases]);
      setInputPhrase("");
    } catch (err) {
      console.error("Generation error:", err);
    }
  };

  const handleTranslate = async (text, idx) => {
    try {
      // const lang = selectedTargetLanguage;
      const result = await translate(
        text,
        "auto",
        targetLanguage?.languageCode,
        addAndRefresh
      );
      const updated = [...translatedPhrases];
      updated[idx] = result;
      setTranslatedPhrases(updated);
      setTranslatedPhrases((prev) => [...prev, result]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (original, translated) => {
    Clipboard.setStringAsync(`${original}\n${translated}`);
  };

  const handleAddToFlashcard = (original, translated) => {
    openModal({
      frontContent: original,
      backContent: translated,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <ScrollView contentContainerStyle={styles.phraseList}>
        {generatedPhrases.map((item, idx) => {
          const orig = item.response.choices[0].message.content || "";
          const trans = translatedPhrases[idx] || "";

          const dynamicWidth =
            width > 768
              ? { width: Math.min(width * 0.5, 450) }
              : { width: "100%" };

          return (
            <View key={idx} style={[styles.phraseBlock, dynamicWidth]}>
              <View style={styles.originalTextBox}>
                <Text style={styles.originalText}>{orig}</Text>
              </View>
              {!!trans && <Text style={styles.translatedText}>{trans}</Text>}
              <View style={styles.iconRow}>
                <Pressable
                  style={styles.circleButton}
                  onPress={() => handleTranslate(orig, idx)}
                >
                  <Feather name="globe" size={20} color={theme.d_gray} />
                </Pressable>
                <Pressable
                  style={styles.circleButton}
                  onPress={() => handleAddToFlashcard(orig, trans)}
                >
                  <FontAwesome
                    name="bookmark-o"
                    size={20}
                    color={theme.d_gray}
                  />
                </Pressable>
                <Pressable
                  style={styles.circleButton}
                  onPress={() => handleCopy(orig, trans)}
                >
                  <Feather name="copy" size={20} color={theme.d_gray} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/*<View style={styles.languageRow}>*/}
      {/*  <Pressable style={styles.langButton}>*/}
      {/*    <Text style={styles.langButtonText}>Auto</Text>*/}
      {/*  </Pressable>*/}
      {/*  <Pressable style={styles.langButton}>*/}
      {/*    <Text style={styles.langButtonText}>Angielski</Text>*/}
      {/*  </Pressable>*/}
      {/*</View>*/}

      <View
        style={[
          styles.background,
          { height: keyboardVisible ? "15%" : "16%", marginBottom: 20 },
        ]}
      >
        <View style={styles.languageButtonsRow}>
          <LanguageSelector type="target" />
        </View>

        {!keyboardVisible && <View style={{ height: 0 }} />}
      </View>
      <View
        style={[
          styles.inputRow,
          width > 768
            ? { width: Math.min(width * 0.5, 450) }
            : { width: "100%" },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={t("genPhrase")} //"Wygeneruj frazę..."
          placeholderTextColor={theme.text}
          value={inputPhrase}
          onChangeText={setInputPhrase}
        />
        <Pressable
          style={styles.sendButton}
          onPress={handleGenerate}
          disabled={!hasText}
        >
          <AntDesign name="arrowright" size={28} color={theme.d_gray} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.d_gray,
      alignItems: "center",
      paddingTop: 10,
    },
    phraseList: {
      alignItems: "center",
      paddingBottom: 140,
    },
    phraseBlock: {
      marginBottom: 20,
    },
    originalTextBox: {
      backgroundColor: theme.torq,
      padding: 12,
      borderRadius: 12,
    },
    originalText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.d_gray,
    },
    translatedText: {
      fontSize: 14,
      fontStyle: "italic",
      color: theme.text,
      marginTop: 10,
      marginLeft: 10,
    },
    iconRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 12,
    },
    circleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.torq,
      alignItems: "center",
      justifyContent: "center",
    },
    languageRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 100,
      gap: 15,
    },
    langButton: {
      backgroundColor: theme.torq,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    langButtonText: {
      color: theme.d_gray,
      fontWeight: "bold",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      position: "absolute",
      bottom: 10,
      backgroundColor: theme.torq,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    input: {
      flex: 1,
      color: theme.d_gray,
      fontSize: 16,
      paddingRight: 10,
      outlineStyle: "none",
    },
    sendButton: {
      padding: 6,
    },
    languagePicker: {
      width: 120,
      height: 40,
      color: "white",
      backgroundColor: theme.d_gray,
      borderRadius: 8,
      padding: 5,
      marginBottom: 100,
    },
  });
}
