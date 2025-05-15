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
import { Pressable } from "react-native";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Toast from "react-native-toast-message";
import { RecordingProvider } from "@/context/RecordingContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";
import { useRouter } from "expo-router";
import { AppLangProvider } from "@/context/AppLangContext";
import { TranslationHistoryProvider } from "@/context/TranslationHistoryContext";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { useAnimatedStyle, interpolateColor } from "react-native-reanimated";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { Colors } from "@/constans/Colors";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <RecordingProvider>
            <AppLangProvider>
              <TranslationHistoryProvider>
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
              </TranslationHistoryProvider>
            </AppLangProvider>
          </RecordingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function InnerStack() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const router = useRouter();
  const { t } = useTranslation();
  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      height: 60,
    },
    arrow: {
      position: "absolute",
      left: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
  });
  const light = Colors.light;
  const dark = Colors.dark;

  const progress = useSharedValue(colorScheme === "dark" ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(colorScheme === "dark" ? 1 : 0, {
      duration: 500,
    });
  }, [colorScheme]);

  const dark_torqAnimation = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [light.dark_torq, dark.dark_torq]
    );
    return {
      backgroundColor,
    };
  });

  const textAnimation = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [light.text, dark.text]),
  }));

  const commonHeaderOptions = {
    headerTitle: () => (
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "bold" }}>
        Flashlingo
      </Text>
    ),
    headerStyle: {
      backgroundColor: theme.dark_torq,
    },
    headerTitleAlign: "center",
    headerRight: () => (
      <Pressable
        onPressIn={() => {
          router.push({
            pathname: "settings",
          });
        }}
      >
        <View style={{ paddingRight: Platform.OS === "web" ? 16 : 0 }}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </View>
        <></>
      </Pressable>
    ),
    headerLeft: () => <UserMenuButton />,
    headerShadowVisible: false,
  };

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={commonHeaderOptions} />
      <Stack.Screen name="language/select" options={commonHeaderOptions} />
      <Stack.Screen
        name="login"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.push("/(tabs)/translation")}
              style={{ paddingLeft: Platform.OS === "web" ? 16 : 0 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Login",
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.push("/login")}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Register",
        }}
      />
      <Stack.Screen
        name="register/verify"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.push("/login")}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Verify",
        }}
      />
      <Stack.Screen
        name="flashcard/create-folder"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.push("/flashcard")}
              style={{ paddingLeft: Platform.OS === "web" ? 16 : 0 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Create Flashcard Folder",
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.push("/(tabs)/translation")}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Import Flashcard Folder",
        }}
      />
      <Stack.Screen
        name="flashcard/[id]"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.push("/flashcard")}
              style={{ paddingLeft: Platform.OS === "web" ? 16 : 0 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Flashcard Folder",
        }}
      />
      <Stack.Screen
        name="flashcard/[id]/test"
        options={{
          ...commonHeaderOptions,
          headerLeft: () => (
            <Pressable
              onPressIn={() => router.back() || router.push("/flashcard")}
              style={{ paddingLeft: Platform.OS === "web" ? 16 : 0 }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={24}
                color={theme.text}
              />
            </Pressable>
          ),
          title: "Flashcard Test",
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          header: ({ navigation }) => (
            <Animated.View style={[styles.header, dark_torqAnimation]}>
              <Pressable
                style={styles.arrow}
                onPressIn={() => navigation.goBack()}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={24}
                  color={theme.text}
                />
              </Pressable>
              <Animated.Text style={[styles.headerTitle, textAnimation]}>
                {t("settings")}
              </Animated.Text>
            </Animated.View>
          ),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="translationHistory/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="translationHistoryDetails/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="conversation/index"
        options={{
          ...commonHeaderOptions,
          headerLeft: undefined,
          title: "Conversation",
        }}
      />
    </Stack>
  );
}
