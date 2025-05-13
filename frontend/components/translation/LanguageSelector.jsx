import { useEffect, useState, useContext } from "react";
import { useRouter } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";
import {useRecording} from "@/context/RecordingContext";
import { useTranslation } from "react-i18next";


export default function LanguageSelector({ type }) {
  const router = useRouter();
  const {t} = useTranslation()
  
  const { supportedLanguages ,sourceLanguage, targetLanguage } = useContext(LanguageContext);
  const {isRecording, setIsRecording} = useRecording();

  const language = type === 'source' ? sourceLanguage : targetLanguage

  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme, isRecording);

  const handleOpenLanguageSelect = () => {
    router.push({
      pathname: "language/select",
      params: {
        languages: JSON.stringify(supportedLanguages),
        type: type,
      },
    });
  };

  return (
    <View>
      <Pressable
        onPress={handleOpenLanguageSelect}
        disabled={isRecording}
        style={({ pressed }) => [
          styles.languageButton,
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text style={styles.languageText}>
          {language
            ? t(`${language.languageCode}`)
            : "Wybierz język"}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme, isRecording) {
  return {
    languageButton: {
      backgroundColor: isRecording ? theme.transcribeDisable : theme.torq,
      height: 40,
      width: 140,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.5,
            shadowRadius: 7,

            elevation: 5,
    },
    languageText: {
      color: theme.text,
      fontSize: 16,
    },
  };
}
