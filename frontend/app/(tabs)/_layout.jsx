import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '@/context/ThemeContext'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { Text } from 'react-native'
import TranslationScreen from '@/app/(tabs)/translation'
import PhrasesScreen from './phrases'
import FlashcardScreen from './flashcard'
import useKeyboard from "@/hooks/useKeyboard"

const { Navigator, Screen } = createMaterialTopTabNavigator();

export default function TabLayout() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboard();

  return (
      <SafeAreaView style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.d_gray }}>
        <Navigator
          screenOptions={{
            tabBarStyle: keyboardVisible
              ? { display: 'none' }
              : {
                  backgroundColor: theme.torq,
                  borderRadius: 20,
                  margin: 15,
                },
            tabBarIndicatorStyle: {
              backgroundColor: theme.tabBarActive,
              height: '100%',
              borderRadius: 20,
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: 'bold',
              color: theme.text,
            },
            tabBarPressColor: 'transparent',
          }}
        >
          <Screen name="translation" options={{ title: 'Translation' }} component={TranslationScreen} />
          <Screen name="phrases" options={{ title: 'Phrases' }} component={PhrasesScreen} />
          <Screen name="flashcard" options={{ title: 'Flashcard' }} component={FlashcardScreen} />
        </Navigator>
      </SafeAreaView>
  );
}