import { Text, View, StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslateBar from "@/components/translation/MenuTranslationBar"; 
import TopBar from "@/components/TopBar";

export default function TranslationScreen() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  const styles = createStyles(theme, colorScheme, setColorScheme);

  return (
    <SafeAreaView style={styles.contentContainer}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />

      <TopBar/>

      <View style={styles.viewStyle}>
        <Text style = {styles.textStyle}>Siemano ziomeczki</Text>
      </View>

      <MenuTranslateBar/>
      
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme, setColorScheme) {
  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: theme.torq,
    },
    viewStyle: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.d_gray,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      elevation: 8
    },
    textStyle: {
      fontSize: 32,
      color: theme.text,
    }
  });
}