import { useEffect, useState, useContext } from "react";
import { useRouter } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";

export default function LanguageSelector({ type }) {
  const router = useRouter();
  
  const { supportedLanguages ,sourceLanguage, targetLanguage } = useContext(LanguageContext);
  const language = type === 'source' ? sourceLanguage : targetLanguage

  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

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
        style={({ pressed }) => [
          styles.languageButton,
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text style={styles.languageText}>
          {language
            ? language.languageName
            : "Wybierz język"}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme) {
  return {
    languageButton: {
      backgroundColor: theme.mint,
      height: 40,
      width: 140,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    languageText: {
      color: theme.d_gray,
      fontSize: 16,
    },
  };
}
