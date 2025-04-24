import { Text, View, StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuTranslationBar from "@/components/translation/MenuTranslationBar"; 

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
        <Text style = {styles.textStyle}>Siemano ziomeczki</Text>
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