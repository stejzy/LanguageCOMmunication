import { Text, View, StyleSheet } from "react-native";
import { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslationBar from "@/components/translation/MenuTranslationBar"; 
import { TextInput } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import {translate} from "@/api/translationService"
import { LanguageContext } from "@/context/LanguageContext";

export default function TranslationScreen() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const {sourceLanguage, targetLanguage} = useContext(LanguageContext);

  const styles = createStyles(theme);

  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  let hasText = textToTranslate.trim().length > 0;

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


  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <View style={styles.viewOuterStyle}>
        <View style = {[styles.viewInnerStyle,
         {flex: hasText ? 0.5 : 1, marginTop: !hasText ? 10 : 0}]}>
          {hasText && (
            <Text style={styles.upperIndexLanguageName}>{sourceLanguage.languageName}</Text>
          )}
          <TextInput style = {styles.textInputStyle}
          placeholder="Wpisz coś..."
          placeholderTextColor={theme.text}
          multiline
          onFocus={() => console.log("Focused!")}
          onBlur={() => console.log("Blurred!")}
          value={textToTranslate}
          onChangeText={setTextToTranslate}/>
          {hasText && (
            <Pressable onPress={handleTranslatePress} style = {styles.iconSendStyle}>
              <AntDesign name="rightcircleo" size={33} color={theme.torq}/>
            </Pressable>
          )}
        </View>


        {hasText && (
            <View style = {styles.lineStyle} />
          )
        }

        {
        hasText && (
            <View style = {[styles.viewInnerStyle, {flex: hasText ? 0.5 : 1}]}>
              {hasText && (
                <Text style={styles.upperIndexLanguageName}>{targetLanguage.languageName}</Text>
              )}
              <ScrollView style={{borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 20}}>
                <Text style = {[styles.textInputStyle]}>
                  {translatedText}
                </Text>
              </ScrollView>
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
      color: theme.text
    }, 
    lineStyle: {
      borderBottomWidth: 3,
      borderRadius: 50,
      borderBottomColor: theme.torq,
      width: "75%",
      marginLeft: "12.5%",
      marginBottom: 3
    },
    iconSendStyle: {
      position: "absolute",
      height: 40,
      width: 40,
      justifyContent: "center",
      alignItems: "center",
      bottom: 10,
      right: 25,
      borderRadius: 10,
      backgroundColor: "red"
    },
    upperIndexLanguageName: {
      color: theme.info,
      paddingLeft: 20,
      paddingTop: 10
    }
  });
}