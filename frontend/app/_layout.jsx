import { Platform, Text, Touchable, View } from 'react-native'
import {ThemeProvider} from  "@/context/ThemeContext"
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import UserMenuButton from '@/components/UserMenuButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {

  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }} >
                <Stack>
                  <Stack.Screen 
                    name="(tabs)"
                    options={{
                      headerTitle: () => (
                          <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>Flashlingo</Text>
                      ),
                      headerStyle: {
                        backgroundColor: '#1DCD9F',
                      },
                      headerTitleAlign: 'center',
                      headerRight: () => (
                        <View style={{ paddingRight: Platform.OS === 'web' ? 16 : 0 }}>

                            <Ionicons name="settings-outline" size={24} color="black" />

                        </View>
                    ),
                      headerLeft: () => <UserMenuButton />,
                    headerShadowVisible: false
                    }}
                  />
                </Stack>
            </SafeAreaView>
          </ThemeProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}