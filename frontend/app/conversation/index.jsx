import { View, Text, StyleSheet } from "react-native";
import { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";
import MicrophoneButton from "../../components/translation/MicrophoneButton";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { translate } from "@/api/translationService";
import { TranslationHistoryContext } from "@/context/TranslationHistoryContext";

export default function ConversationScreen() {
  const { theme } = useContext(ThemeContext);
  const {
    sourceLanguage,
    targetLanguage,
    textToTranslate,
    setTextToTranslate,
    translatedText,
    setTranslatedText,
  } = useContext(LanguageContext);
  const { addAndRefresh } = useContext(TranslationHistoryContext);
  const [isRecording, setIsRecording] = useState(false);

  const [translatedToSource, setTranslatedToSource] = useState("");
  const [translatedToTarget, setTranslatedToTarget] = useState("");

  const styles = createStyles(theme);
  const { t } = useTranslation();

  useEffect(() => {
    const translateText = async () => {
      if (!textToTranslate) return;

      try {
        const translatedSrc = await translate(
          textToTranslate,
          "auto",
          sourceLanguage.languageCode,
          addAndRefresh
        );
        const translatedTrg = await translate(
          textToTranslate,
          "auto",
          targetLanguage.languageCode,
          addAndRefresh
        );

        setTranslatedToSource(translatedSrc);
        setTranslatedToTarget(translatedTrg);
      } catch (error) {
        console.error("Błąd w tłumaczeniu konwersacji: ", error);
      }
    };

    translateText();
  }, [textToTranslate]);

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { transform: [{ rotate: "180deg" }] }]}>
        <Text style={styles.langLabel}>
          {t(targetLanguage?.languageCode).toUpperCase()}
        </Text>
        <Text
            style={[
              styles.textInput,
              !translatedToTarget && { color: theme.info },
            ]}
        >
          {translatedToTarget || ("Try clicking the microphone :)")}
        </Text>
      </View>

      <View style={styles.micWrapper}>
        <MicrophoneButton
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
      </View>

      <View style={styles.bubble}>
        <Text style={styles.langLabel}>
          {t(sourceLanguage?.languageCode).toUpperCase()}
        </Text>

        <Text
            style={[
              styles.textInput,
              !translatedToTarget && { color: theme.info },
            ]}
        >
          {translatedToSource || ("Try clicking the microphone :)")}
        </Text>

      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.d_gray,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 20,
    },
    bubble: {
      width: "90%",
      minHeight: "45%",
      backgroundColor: theme.bg,
      borderRadius: 15,
      padding: 15,
      borderWidth: 1,
      borderColor: theme.torq,
    },
    langLabel: {
      fontSize: 12,
      color: theme.info,
      alignSelf: "flex-end",
      marginBottom: 10,
    },
    textInput: {
      fontSize: 18,
      color: theme.text,
      textAlignVertical: "top",
      flex: 1,
    },
    micWrapper: {
      marginVertical: 10,
    },
  });
}
