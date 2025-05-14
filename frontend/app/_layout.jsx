import { Platform, Text, Touchable, View } from "react-native";
import { ThemeProvider } from "@/context/ThemeContext";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import UserMenuButton from "@/components/UserMenuButton";
import { GestureHandlerRootView, Pressable } from "react-native-gesture-handler";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Toast from "react-native-toast-message";
import { RecordingProvider } from "@/context/RecordingContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";
import { useRouter } from "expo-router"; 
import {AppLangProvider} from "@/context/AppLangContext"

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <RecordingProvider>
              <AppLangProvider>
                <LanguageProvider>
                  <SafeAreaView
                    style={{
                      flex: 1,
                      paddingTop: insets.top,
                      paddingBottom: insets.bottom,
                    }}
                  >
                    <InnerStack />
                  </SafeAreaView>
                  <Toast />
                </LanguageProvider>
              </AppLangProvider>
            </RecordingProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function InnerStack() {
  
  const { theme } = useContext(ThemeContext);
  const router = useRouter();

  const commonHeaderOptions = {
    headerTitle: () => (
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "bold", }}>
        Flashlingo
      </Text>
    ),
    headerStyle: {
      backgroundColor: theme.dark_torq,
    },
    headerTitleAlign: "center",
    headerRight: () => (
      <Pressable 
        onPress={() => {
          router.push({
          pathname: "settings",
        });
      }}>
        <View style={{ paddingRight: Platform.OS === "web" ? 16 : 0 }}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </View>
      </Pressable>
    ),
    headerLeft: () => <UserMenuButton />,
    headerShadowVisible: false,
  };

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={commonHeaderOptions} />
      <Stack.Screen name="language/select" options={commonHeaderOptions} />
      <Stack.Screen name="login" options={{ ...commonHeaderOptions, headerLeft: null, title: "Login" }} />
      <Stack.Screen name="register/index" options={{ ...commonHeaderOptions, headerLeft: undefined, title: "Register" }} />
      <Stack.Screen name="register/verify" options={{ ...commonHeaderOptions, headerLeft: null, title: "Verify" }} />
      <Stack.Screen name="flashcard/create-folder" options={{ ...commonHeaderOptions, headerLeft: undefined, title: "Create Flashcard Folder" }} />
      <Stack.Screen name="flashcard/[id]" options={{ ...commonHeaderOptions, headerLeft: undefined, title: "Flashcard Folder" }} />
      <Stack.Screen name="settings/index"  options={{ headerShown: false }}/>
      <Stack.Screen name="conversation/index"  options={{ ...commonHeaderOptions, headerLeft: undefined, title: "Conversation" }} />
    </Stack>
  );
}
