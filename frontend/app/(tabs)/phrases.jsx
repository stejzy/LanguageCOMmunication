import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
// import Clipboard from "@react-native-clipboard/clipboard";

import { Picker } from "@react-native-picker/picker";
import { getSupportedLanguages, translate } from "@/api/translationService";
import { ThemeContext } from "@/context/ThemeContext";
import { generatePhrase } from "../../api/phraseService";
import { AuthContext } from "@/context/AuthContext";

export default function PhrasesScreen() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const { authState } = useContext(AuthContext);
  const styles = createStyles(theme);

  const [inputPhrase, setInputPhrase] = useState("");
  const [generatedPhrases, setGeneratedPhrases] = useState([]);

  const [translatedPhrases, setTranslatedPhrases] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [supportedLanguages, setSupportedLanguages] = useState([]);

  const hasText = inputPhrase.trim().length > 0;

  useEffect(() => {
    const fetchLanguages = async () => {
      if (!authState?.loading && authState?.authenticated) {
        const languages = await getSupportedLanguages();
        setSupportedLanguages(languages);
      }
    };
    fetchLanguages();
  }, [authState?.loading, authState?.authenticated]);

  const handleGenerate = async () => {
    try {
      const response = await generatePhrase(inputPhrase);
      setGeneratedPhrases([response, ...generatedPhrases]);

      setTranslatedPhrases(["", ...translatedPhrases]);
      setSelectedLanguages(["en", ...selectedLanguages]);

      setInputPhrase("");
    } catch (error) {
      console.error("Błąd przy generowaniu frazy:", error);
    }
  };

  const handleTranslate = async (text, index) => {
    try {
      const targetLang = selectedLanguages[index] || "en";
      const result = await translate(text, "auto", targetLang);
      const updated = [...translatedPhrases];
      updated[index] = result || "Translation error";
      setTranslatedPhrases(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <View style={styles.viewOuterStyle}>
        <View style={[styles.viewInnerStyle, { flex: hasText ? 0.5 : 1 }]}>
          <TextInput
            style={styles.textInputStyle}
            placeholder="Wpisz słowo do wygenerowania frazy..."
            placeholderTextColor={theme.text}
            multiline
            value={inputPhrase}
            onChangeText={setInputPhrase}
          />
          {hasText && (
            <View style={styles.generateButtonContainer}>
              <Pressable
                onPress={handleGenerate}
                style={styles.iconGenerateButton}
              >
                <Text style={styles.iconGenerateText}>Generate</Text>
              </Pressable>
            </View>
          )}
        </View>

        {hasText && <View style={styles.lineStyle} />}

        <View style={[styles.viewInnerStyle, { flex: 1 }]}>
          <ScrollView style={styles.generatedContainer}>
            {generatedPhrases.map((item, index) => {
              const phraseText = item.choices?.[0]?.message?.content || item;
              const translated = translatedPhrases[index];

              return (
                <View key={index} style={styles.generatedPhraseWrapper}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.generatedText}>{phraseText}</Text>
                    {translated ? (
                      <Text style={styles.translatedText}>{translated}</Text>
                    ) : null}
                  </View>

                  <View style={styles.actionColumn}>
                    <Picker
                      selectedValue={selectedLanguages[index] || "en"}
                      onValueChange={(lang) => {
                        const updated = [...selectedLanguages];
                        updated[index] = lang;
                        setSelectedLanguages(updated);
                      }}
                      style={styles.languagePicker}
                      mode="dropdown"
                    >
                      {supportedLanguages.map((lang, i) => (
                        <Picker.Item
                          key={i}
                          label={
                            lang.languageName.charAt(0) +
                            lang.languageName.slice(1).toLowerCase()
                          }
                          value={lang.languageCode}
                        />
                      ))}
                    </Picker>

                    <View style={styles.buttonRow}>
                      <Pressable
                        onPress={() => handleTranslate(phraseText, index)}
                        style={styles.iconButton}
                      >
                        <Feather name="globe" size={20} color="black" />
                      </Pressable>
                      {/* <Pressable
                        onPress={() => Clipboard.setString(phraseText)}
                        style={styles.iconButton}
                      >
                        <Feather name="copy" size={20} color="black" />
                      </Pressable> */}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      backgroundColor: theme.torq,
    },
    viewOuterStyle: {
      flex: 1,
      backgroundColor: theme.torq,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      elevation: 8,
    },
    viewInnerStyle: {
      flex: 1,
    },
    textInputStyle: {
      flex: 1,
      width: "100%",
      textAlign: "left",
      textAlignVertical: "top",
      padding: 20,
      paddingTop: 5,
      borderBottomLeftRadius: 25,
      fontSize: 20,
      color: theme.text,
      backgroundColor: theme.d_gray,
    },
    generateButtonContainer: {
      alignItems: "flex-end",
    },
    generatedContainer: {
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    generatedText: {
      fontSize: 20,
      marginBottom: 10,
      padding: 10,
      backgroundColor: theme.light_gray,
      borderRadius: 10,
      color: "black",
    },
    translatedText: {
      fontSize: 15,
      marginTop: 5,
      fontStyle: "italic",
      color: "black",
    },
    lineStyle: {
      borderBottomWidth: 3,
      borderRadius: 50,
      borderBottomColor: theme.torq,
      width: "75%",
      marginLeft: "12.5%",
      marginBottom: 3,
    },
    iconGenerateButton: {
      backgroundColor: theme.d_gray,
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      width: Platform.OS === "web" ? "20%" : "40%",
    },
    iconGenerateText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    generatedPhraseWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
      padding: 10,
      backgroundColor: theme.light_gray,
      borderRadius: 10,
      gap: 10,
    },
    actionColumn: {
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 5,
    },
    buttonRow: {
      flexDirection: "row",
      marginTop: 5,
      gap: 5,
    },
    iconButton: {
      marginLeft: 5,
      padding: 5,
      backgroundColor: theme.torq,
      borderRadius: 5,
    },
    languagePicker: {
      width: 200,
      height: 80,
      color: "white",
      backgroundColor: theme.d_gray,
      borderRadius: 8,
      padding: 5,
    },
  });
}
