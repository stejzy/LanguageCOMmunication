import { Text, View, StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslationBar from "@/components/translation/MenuTranslationBar"; 
import { TextInput } from "react-native";

export default function TranslationScreen() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <View style={styles.viewStyle}>
        <TextInput style = {styles.textInputStyle}
         placeholder="Wpisz coś..."
         placeholderTextColor={theme.text}
         multiline
         onFocus={() => console.log("Focused!")}
         onBlur={() => console.log("Blurred!")
        
         }></TextInput>
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
    viewStyle: {
      flex: 1,
      backgroundColor: theme.d_gray,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      elevation: 8
    },
    textInputStyle: {
      flex: 1,
      width: "100%",
      textAlign: "left",
      textAlignVertical: "top",
      padding: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      fontSize: 32,
      color: theme.text,
    }
  });
}