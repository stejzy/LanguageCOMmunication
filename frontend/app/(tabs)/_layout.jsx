import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Platform, View, StyleSheet } from "react-native";
import TranslationScreen from "@/app/(tabs)/translation";
import PhrasesScreen from "./phrases";
import FlashcardScreen from "./flashcard";
import useKeyboard from "@/hooks/useKeyboard";
// import {useRecording} from "@/context/RecordingContext";
// import { AntDesign } from "@expo/vector-icons";

const { Navigator, Screen } = createMaterialTopTabNavigator();

export default function TabLayout() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboard();
  // const {isRecording, setIsRecording} = useRecording();

  // const styles = createStyles(theme);

  return (
   <SafeAreaView style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.d_gray }}>
      {/* {isRecording && (
        <View style={styles.topBar}>
          <AntDesign name="arrowleft" size={32} color={theme.torq} onPress={() => setIsRecording(false)} />
        </View>
      )} */}

      <Navigator
        screenOptions={{
          tabBarStyle: keyboardVisible
            ? { display: "none" }
            : {
                backgroundColor: theme.torq,
                borderRadius: 20,
                margin: 15,
              },
          tabBarIndicatorStyle: {
            backgroundColor: theme.tabBarActive,
            height: "100%",
            borderRadius: 20,
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "bold",
            color: theme.text,
          },
          tabBarPressColor: "transparent",
          swipeEnabled: Platform.OS === "web" ? false : true,
        }}
      >
        <Screen
          name="translation"
          options={{ title: "Translation" }}
          component={TranslationScreen}
        />
        <Screen
          name="phrases"
          options={{ title: "Phrases" }}
          component={PhrasesScreen}
        />
        <Screen
          name="flashcard"
          options={{ title: "Flashcard" }}
          component={FlashcardScreen}
        />
      </Navigator>
    </SafeAreaView>

  );
}

// function createStyles(theme) {
//   return StyleSheet.create({
//     topBar: {
//       height: 78,
//       width: "100%",
//       justifyContent: "center",
//       paddingLeft: 10,
//     }
//   });
// }
