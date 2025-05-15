import { View, StyleSheet, Pressable } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { useContext, useEffect, useState } from "react";
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { LanguageContext } from "@/context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import useKeyboard from "@/hooks/useKeyboard";
import MicrophoneButton from "./MicrophoneButton";
import { useRecording } from "@/context/RecordingContext";
import ConversationButton from "./ConversationButton";
import CameraButton from "@/components/translation/CameraButton";

export default function MenuTranslationBar() {
  const keyboardVisible = useKeyboard();

  const {
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    textToTranslate,
    setTextToTranslate,
    translatedText,
    setTranslatedText,
  } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  // const [isRecording, setIsRecording] = useState(false);

  const { isRecording, setIsRecording } = useRecording();

  const handleSwapLanguages = () => {
    if (sourceLanguage && targetLanguage) {
      const tempSource = sourceLanguage;
      const tempTarget = targetLanguage;
      const tempText = textToTranslate;
      const tempTranslated = translatedText;

      setSourceLanguage(tempTarget);
      setTargetLanguage(tempSource);
      setTextToTranslate(tempTranslated);
      setTranslatedText(tempText);
    }
  };

  const styles = createStyles(theme, isRecording);

  const buttons = [
    { icon: <ConversationButton /> },
    {
      icon: (
        <MicrophoneButton
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
      ),
    },
    !isRecording && {
      icon: <Entypo name="camera" size={25} color={theme.text} />,
      style: styles.cameraButton,
    },
  ];
  // const buttons = [
  //   !isRecording && {
  //     icon: <ConversationButton />,
  //     style: styles.talkButton,
  //   },
  //   {
  //     icon: (
  //       <MicrophoneButton
  //         isRecording={isRecording}
  //         setIsRecording={setIsRecording}
  //       />
  //     ),
  //   },
  //   !isRecording && { icon: <CameraButton size={25} color={theme.text} /> },
  // ];

  return (
    <View
      style={[styles.background, { height: keyboardVisible ? "15%" : "25%" }]}
    >
      <View style={styles.languageButtonsRow}>
        <LanguageSelector type="source"></LanguageSelector>

        <Pressable
          onPress={handleSwapLanguages}
          style={({ pressed }) => [
            styles.swapButton,
            pressed && { backgroundColor: "rgba(224, 224, 224, 0.5)" },
          ]}
        >
          <Entypo
            name={isRecording ? "arrow-long-right" : "swap"}
            size={30}
            color={theme.text}
          />
        </Pressable>

        <LanguageSelector type="target"></LanguageSelector>
      </View>

      {!keyboardVisible && (
        <View style={styles.optionButtonsRow}>
          {buttons.map((button, index) => {
            if (!button?.icon) return null;
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  button.style,
                  pressed && { opacity: 0.75 },
                ]}
              >
                {button.icon}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function createStyles(theme, isRecording) {
  return StyleSheet.create({
    background: {
      height: "25%",
      width: "100%",
      justifyContent: "space-evenly",
    },
    languageButtonsRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    swapButton: {
      backgroundColor: "transparent",
      padding: 7,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    optionButtonsRow: {
      height: "25%",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 20,
    },
    talkButton: {
      backgroundColor: theme.torq,
      height: 50,
      width: 50,
      borderRadius: 50,
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
    // micButton: {
    //     backgroundColor: theme.mint,
    //     height: 75,
    //     width: 75,
    //     borderRadius: 50,
    //     justifyContent: "center",
    //     alignItems: "center"
    // },
    cameraButton: {
      backgroundColor: theme.torq,
      height: 50,
      width: 50,
      borderRadius: 50,
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
  });
}
