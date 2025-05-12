import { Text, View, StyleSheet, Platform } from "react-native";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslationBar from "@/components/translation/MenuTranslationBar"; 
import { TextInput } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import {translate, textToSpeech} from "@/api/translationService"
import { LanguageContext } from "@/context/LanguageContext";
import useKeyboard from "@/hooks/useKeyboard"
// import {useAudioPlayer} from "expo-audio";
import { Audio } from 'expo-av';
import * as FileSystem from "expo-file-system";
import { AuthContext } from "@/context/AuthContext";
import {useRecording} from "@/context/RecordingContext"


export default function TranslationScreen() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const {sourceLanguage, targetLanguage, textToTranslate, setTextToTranslate, translatedText, setTranslatedText} = useContext(LanguageContext);
  const {authState} = useContext(AuthContext)
  const {isRecording, setIsRecording} = useRecording();

  const [disableSrcSpeaker, setDisableSrcSpeaker] = useState(true);
  const [disableTrgtSpeaker, setDisableTrgtSpeaker] = useState(true);
 
  const keyboardVisible = useKeyboard();
  const styles = createStyles(theme);

  let hasText = textToTranslate.trim().length > 0;

  useEffect(() => {
    if(!hasText){
      setTranslatedText("");
    }
  }, [hasText])

  useEffect(() => {
    if (authState.authenticated) {
      const checkSpeakerAvailability = () => {
        setDisableSrcSpeaker(sourceLanguage?.voiceID === "none");
        setDisableTrgtSpeaker(targetLanguage?.voiceID === "none");
      };
  
      checkSpeakerAvailability();
    }
  }, [authState.authenticated, sourceLanguage, targetLanguage]);


  const handleTranslatePress = async () => {
    console.log("Parametry: " + textToTranslate + " " + sourceLanguage?.languageCode + " " + targetLanguage?.languageCode);
    try {
      const response = await translate(
        textToTranslate,
        sourceLanguage?.languageCode,
        targetLanguage?.languageCode
      );
      setTranslatedText(response);
    } catch (error) {
      console.error("Błąd podczas tłumaczenia:", error);
    }
  };

  const bufferToBase64 = (buffer) => {
    let binary="";
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    for(let i = 0; i < len; i++) {
      binary+=String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const handleSpeakerPress = async (text, langCode) => {

    if (Platform.OS === "web") {
      console.log("Webowka");

      try {
        const arrayBuffer = await textToSpeech(text, langCode);

        if (!arrayBuffer) {
          console.log("Brak danych");
          return;
        }

        const base64Audio = bufferToBase64(arrayBuffer);

        const AudioClass = window.Audio; 
        const audio = new AudioClass();
        audio.src = `data:audio/mp3;base64,${base64Audio}`;

        audio.play().catch((error) => {
          console.error("Błąd odtwarzania dźwięku:", error);
        });

      } catch (error) {
        console.error("Text to speech failed", error);
      }

    } else {
      console.log("Mobilki");

      try {
        const arrayBuffer = await textToSpeech(text, langCode);

        if (!arrayBuffer) {
          console.log("Brak danych");
          return;
        };

        const base64Audio = bufferToBase64(arrayBuffer);

        const filePath = FileSystem.cacheDirectory + "tts-audio.mp3";
        await FileSystem.writeAsStringAsync(filePath, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: filePath });

        await sound.playAsync();

      } catch (error) {
        console.error("Text to speech failed" + error);
      }
    }
  };



  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <View style={styles.viewOuterStyle}>
          
        <View style = {[styles.viewInnerStyle,
         {flex: hasText ? 0.5 : 1}]}>
          {hasText && !keyboardVisible && (
            <Text style={styles.upperIndexLanguageName}>{sourceLanguage.languageName}</Text>
          )}
          <TextInput style = {styles.textInputStyle}
          placeholder = {isRecording ? "Mów coś..." : "Wpisz coś..."}
          placeholderTextColor={theme.text}
          multiline
          value={textToTranslate}
          onChangeText={setTextToTranslate}/>
          {hasText && (
            <View style={{height: 50}}>
                <Pressable onPress={() => {handleSpeakerPress(textToTranslate, sourceLanguage.languageCode)}} style={[styles.iconSendStyle, {position: "absolute", left: 25}]} disabled={disableSrcSpeaker}>
                  <FontAwesome name="volume-up" size={33} color={disableSrcSpeaker ? theme.info : theme.torq}/>
                </Pressable>
                <Pressable onPress={handleTranslatePress} style = {[styles.iconSendStyle, {position: "absolute", right: 25}]}>
                  <AntDesign name="rightcircleo" size={33} color={theme.torq}/>
                </Pressable>
            </View>
          )}
        </View>


        {hasText && (
            <View style = {styles.lineStyle} />
          )
        }

        {
        hasText && (
            <View style = {[styles.viewInnerStyle, {flex: hasText ? 0.5 : 1}]}>
              {hasText && !keyboardVisible && (
                <Text style={styles.upperIndexLanguageName}>{targetLanguage.languageName}</Text>
              )}
              <ScrollView style={{borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 20}}>
                <Text style = {[styles.textInputStyle]}>
                  {translatedText}
                </Text>
              </ScrollView>
              <View style={{height: 50, alignItems: "flex-end", paddingRight: 25}}>
                {/* <Pressable onPress={handleTranslatePress} style = {styles.iconSendStyle}>
                  <AntDesign name="rightcircleo" size={33} color={theme.torq}/>
                </Pressable> */}
                <Pressable 
                  onPress={() => {handleSpeakerPress(translatedText, targetLanguage.languageCode)}}
                  style={[styles.iconSendStyle, {position: "absolute", left: 25}]}
                  disabled={disableTrgtSpeaker}>
                    <FontAwesome name="volume-up" size={33} color={disableTrgtSpeaker ? theme.info : theme.torq}/>
                </Pressable>
              </View>
            </View>
         )
        } 
      </View>

     

      <MenuTranslationBar/>
      
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: theme.torq,
    },
    viewOuterStyle: {
      flex: 1,
      backgroundColor: theme.d_gray,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      elevation: 8,
    },
    viewInnerStyle: {
      flex: 1,
      marginTop: 7
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
      zIndex: 1
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
      zIndex: 2
    },
    upperIndexLanguageName: {
      color: theme.info,
      paddingLeft: 20,
      paddingTop: 10
    }
  });
}