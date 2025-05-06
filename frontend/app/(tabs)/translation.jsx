import { Text, View, StyleSheet } from "react-native";
import { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslationBar from "@/components/translation/MenuTranslationBar"; 
import { TextInput } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function TranslationScreen() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  const styles = createStyles(theme);

  const [textToTranslate, setTextToTranslate] = useState("");
  let hasText = textToTranslate.trim().length > 0;


  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <View style={styles.viewOuterStyle}>
        <View style = {[styles.viewInnerStyle,
         {flex: hasText ? 0.55 : 1}]}>
          <TextInput style = {styles.textInputStyle}
          placeholder="Wpisz coś..."
          placeholderTextColor={theme.text}
          multiline
          onFocus={() => console.log("Focused!")}
          onBlur={() => console.log("Blurred!")}
          value={textToTranslate}
          onChangeText={setTextToTranslate}/>
          {hasText && (
            <View style = {styles.iconSendStyle}>
              <AntDesign name="rightcircleo" size={33} color={theme.torq}
             />
            </View>
          )}
        </View>


        {hasText && (
            <View style = {styles.lineStyle} />
          )
        }

        {
        hasText && (
            <View style = {[styles.viewInnerStyle, {flex: hasText ? 0.45 : 1}]}>
              <Text style = {styles.textInputStyle}>
                Przetłuamczony text
              </Text>
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
      elevation: 8
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
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      fontSize: 20,
      color: theme.text,
    }, 
    lineStyle: {
      borderBottomWidth: 3,
      borderRadius: 50,
      borderBottomColor: theme.torq,
      width: "75%",
      marginLeft: "12.5%"
    },
    iconSendStyle: {
      justifyContent: "center",
      alignItems: "flex-end",
      paddingEnd: 25,
      marginTop: 10,
      marginBottom: 15
    }
  });
}