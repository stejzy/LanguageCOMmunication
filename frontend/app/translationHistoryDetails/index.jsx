import { Text, View, StyleSheet, Platform } from "react-native";
import { useContext, useRef, useState, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslationBar from "@/components/translation/MenuTranslationBar";
import { TextInput } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, ScrollView } from "react-native";
import { translate, textToSpeech } from "@/api/translationService";
import { LanguageContext } from "@/context/LanguageContext";
// import {useAudioPlayer} from "expo-audio";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useGlobalAddFlashcardModal } from "@/context/AddFlashcardModalContext";

export default function TranslationHistoryDetailsScreen() {
  const { translation } = useLocalSearchParams();
  const router = useRouter();
  const { openModal } = useGlobalAddFlashcardModal();

  const cleanQuotes = (text) =>
    text?.replace(/^"+|"+$/g, "").replace(/^„+|”+$/g, "") ?? "";

  const parsed = translation ? JSON.parse(translation) : null;

  const source = cleanQuotes(parsed?.sourceText);
  const translated = cleanQuotes(parsed?.translatedText);

  
  const mobileSoundRef = useRef(null);
  const webAudioRef = useRef(null);

  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const {
    sourceLanguage,
    targetLanguage,
    textToTranslate,
    setTextToTranslate,
    translatedText,
    setTranslatedText,
  } = useContext(LanguageContext);
  const { authState } = useContext(AuthContext);

  const styles = createStyles(theme);

  const bufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

   const [isPlaying, setIsPlaying] = useState(false);  
  
   const handleSpeakerPress = async (text, langCode) => {
    if (!text) return;
    if (isPlaying) return;
  
    setIsPlaying(true);
  
    if (Platform.OS === "web") {
      try {
        if (webAudioRef.current) {
          webAudioRef.current.pause();
          webAudioRef.current.currentTime = 0;
          webAudioRef.current = null;
        }
        const arrayBuffer = await textToSpeech(text, langCode);
        if (!arrayBuffer) {
          console.log("Brak danych");
          setIsPlaying(false);
          return;
        }
  
        const base64Audio = bufferToBase64(arrayBuffer);
        const audio = new window.Audio(`data:audio/mp3;base64,${base64Audio}`);
        webAudioRef.current = audio;
  
        audio.play().catch((error) => {
          console.error("Błąd odtwarzania dźwięku (web):", error);
          setIsPlaying(false);
        });
  
        audio.onended = () => {
          setIsPlaying(false);
          webAudioRef.current = null;
        };
  
      } catch (error) {
        console.error("Text to speech failed (web):", error);
        setIsPlaying(false);
      }
    } else {
      try {
        if (mobileSoundRef.current) {
          await mobileSoundRef.current.stopAsync();
          await mobileSoundRef.current.unloadAsync();
          mobileSoundRef.current = null;
        }
  
        const arrayBuffer = await textToSpeech(text, langCode);
        if (!arrayBuffer) {
          console.log("Brak danych");
          setIsPlaying(false);
          return;
        }
  
        const base64Audio = bufferToBase64(arrayBuffer);
        const filePath = FileSystem.cacheDirectory + "tts-audio.mp3";
        await FileSystem.writeAsStringAsync(filePath, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        const { sound } = await Audio.Sound.createAsync({ uri: filePath });
        mobileSoundRef.current = sound;
  
        await sound.playAsync();
  
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isPlaying) {
            setIsPlaying(false);
            sound.setOnPlaybackStatusUpdate(null);
          }
        });
      } catch (error) {
        console.error("Text to speech failed (mobile):", error);
        setIsPlaying(false);
      }
    }
  };
  

  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <View style={styles.header}>
        <Pressable style={styles.arrow} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Translation Details</Text>
      </View>

      <View></View>

      <View style={styles.viewOuterStyle}>
        <View style={[styles.viewInnerStyle, { flex: 0.5 }]}>
          <Text style={styles.upperIndexLanguageName}>
            {parsed.sourceLanguage}
          </Text>
          <ScrollView
            style={{
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 25,
              marginBottom: 20,
            }}
          >
            <Text style={[styles.textInputStyle]}>{source}</Text>
          </ScrollView>
          <View
            style={{ height: 50, alignItems: "flex-end", paddingRight: 25 }}
          >
            <Pressable
              onPress={() => {
                handleSpeakerPress(parsed.sourceText, parsed.sourceLanguage);
              }}
              style={[styles.iconSendStyle, { position: "absolute", left: 25 }]}
            >
              <FontAwesome name="volume-up" size={33} color={theme.torq} />
            </Pressable>

            <Pressable
              onPress={() => {
                openModal({
                  frontContent: parsed.sourceText,
                  backContent: parsed.translatedText,
                });
              }}
              style={[
                styles.iconSendStyle,
                { position: "absolute", right: 25 },
              ]}
            >
              <FontAwesome name="bookmark-o" size={33} color={theme.torq} />
            </Pressable>
          </View>
        </View>

        <View style={styles.lineStyle} />

        <View style={[styles.viewInnerStyle, { flex: 0.5 }]}>
          <Text style={styles.upperIndexLanguageName}>
            {parsed.targetLanguage}
          </Text>

          <ScrollView
            style={{
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 25,
              marginBottom: 20,
            }}
          >
            <Text style={styles.textInputStyle}>{translated}</Text>
          </ScrollView>

          <View
            style={{ height: 50, alignItems: "flex-end", paddingRight: 25 }}
          >
            <Pressable
              onPress={() =>
                handleSpeakerPress(parsed.translatedText, parsed.targetLanguage)
              }
              style={[styles.iconSendStyle, { position: "absolute", left: 25 }]}
            >
              <FontAwesome name="volume-up" size={33} color={theme.torq} />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: theme.dark_torq,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      paddingTop: 19,
      paddingBottom: 19,
      backgroundColor: theme.dark_torq,
    },
    arrow: {
      position: "absolute",
      left: 15,
      top: 19,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    viewOuterStyle: {
      flex: 1,
      backgroundColor: theme.d_gray,
      elevation: 8,
    },
    viewInnerStyle: {
      flex: 1,
      marginTop: 7,
      // backgroundColor: "yellow"
    },
    textInputStyle: {
      flex: 1,
      width: "100%",
      textAlign: "left",
      textAlignVertical: "top",
      padding: 20,
      paddingTop: 5,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      fontSize: 20,
      color: theme.text,
      // backgroundColor: "blue",
      zIndex: 1,
    },
    lineStyle: {
      borderBottomWidth: 3,
      borderRadius: 50,
      borderBottomColor: theme.torq,
      width: "75%",
      marginLeft: "12.5%",
    },
    iconSendStyle: {
      height: 40,
      width: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      // backgroundColor: "red",
      zIndex: 2,
    },
    upperIndexLanguageName: {
      color: theme.info,
      paddingLeft: 20,
      paddingTop: 10,
    },
  });
}
