import { Platform, Text, Touchable, View } from "react-native";
import { ThemeProvider } from "@/context/ThemeContext";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import UserMenuButton from "@/components/UserMenuButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Toast from "react-native-toast-message";
import { RecordingProvider } from "@/context/RecordingContext";

export default function RootLayout() {
  const commonHeaderOptions = {
    headerTitle: () => (
      <Text style={{ color: "black", fontSize: 20, fontWeight: "bold" }}>
        Flashlingo
      </Text>
    ),
    headerStyle: {
      backgroundColor: "#169976",
    },
    headerTitleAlign: "center",
    headerRight: () => (
      <View style={{ paddingRight: Platform.OS === "web" ? 16 : 0 }}>
        <Ionicons name="settings-outline" size={24} color="black" />
      </View>
    ),
    headerLeft: () => <UserMenuButton />,
    headerShadowVisible: false,
  };

  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <RecordingProvider>
              <LanguageProvider>
                <SafeAreaView
                  style={{
                    flex: 1,
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                  }}
                >
                  <Stack>
                    <Stack.Screen name="(tabs)" options={commonHeaderOptions} />

                    <Stack.Screen
                      name="language/select"
                      options={commonHeaderOptions}
                    />
                    <Stack.Screen
                      name="login"
                      options={{
                        ...commonHeaderOptions,
                        headerLeft: null,
                        title: "Login",
                      }}
                    />
                    <Stack.Screen
                      name="register/index"
                      options={{
                        ...commonHeaderOptions,
                        headerLeft: undefined,
                        title: "Register",
                      }}
                    />
                    <Stack.Screen
                      name="register/verify"
                      options={{
                        ...commonHeaderOptions,
                        headerLeft: null,
                        title: "Verify",
                      }}
                    />
                  </Stack>
                </SafeAreaView>
                <Toast />
              </LanguageProvider>
            </RecordingProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
