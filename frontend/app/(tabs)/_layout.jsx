import React, { useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform } from 'react-native'
import { withLayoutContext } from 'expo-router'

export default function TabLayout() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  const { Navigator } = createMaterialTopTabNavigator();
  const Tabs = withLayoutContext(Navigator);

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.d_gray}}>
      <Tabs

      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.torq,
          borderRadius: 20,
          margin: 15,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.tabBarActive,
          height: '100%',
          borderRadius: 20
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: theme.text
        },
        tabBarPressColor: 'transparent',
        swipeEnabled: Platform.OS === 'web' ? false : true, 
      }}
      >
        <Tabs.Screen name="translation" options={{ title: 'Translation' }} />
        <Tabs.Screen name="phrases" options={{ title: 'Phrases' }} />
        <Tabs.Screen name="flashcard" options={{ title: 'Flashcard' }} />
      </Tabs>
    </SafeAreaView>
  )
}