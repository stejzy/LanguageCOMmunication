import { View, Text, StyleSheet, Pressable } from "react-native";
import { ThemeContext } from "@/context/ThemeContext";
import { AppLangContext } from "@/context/AppLangContext";
import { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import { Switch } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { Colors } from "@/constans/Colors";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { setColorScheme, colorScheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(AppLangContext);
  const router = useRouter();

  const light = Colors.light;
  const dark = Colors.dark;

  const progress = useSharedValue(colorScheme === "dark" ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(colorScheme === "dark" ? 1 : 0, {
      duration: 500,
    });
  }, [colorScheme]);

  const animatedColors = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], [light.d_gray, dark.d_gray]),
    };
  });

  const getAnimatedColor = (lightColor, darkColor) => {
    return useAnimatedStyle(() => {
      return {
        color: interpolateColor(progress.value, [0, 1], [lightColor, darkColor]),
      };
    });
  };

  const getAnimatedBackground = (lightColor, darkColor) => {
    return useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(progress.value, [0, 1], [lightColor, darkColor]),
      };
    });
  };

  const torqColorAnimation = getAnimatedColor(light.torq, dark.torq);
  const torqBackColorAnimation = getAnimatedBackground(light.torq, dark.torq);
  const textAnimation = getAnimatedColor(light.text, dark.text);

  const visibilityPL = useSharedValue(language == "pl" ? 1 : 0);
  const visibilityEN = useSharedValue(language == "en" ? 1 : 0);

  const showChoosenButtonPL = useAnimatedStyle(() => ({ opacity: visibilityPL.value }));
  const showChoosenButtonEN = useAnimatedStyle(() => ({ opacity: visibilityEN.value }));

  const handleChangeLang = (lang) => {
    if (lang !== language) {
      setLanguage(lang);
      visibilityPL.value = withTiming(lang === "pl" ? 1 : 0, { duration: 300 });
      visibilityEN.value = withTiming(lang === "en" ? 1 : 0, { duration: 300 });
    }
  };

  const styles = createStyles(dark);

  return (
    <Animated.View style={[styles.container, animatedColors]}>
      <View style={styles.themeContainer}>
        <Animated.Text style={[styles.themeSwitchText, torqColorAnimation]}>
          {t("themeSwitch")}
        </Animated.Text>

        <Animated.View style={[styles.themeSwitchBackground, torqBackColorAnimation]}>
          <Animated.Text style={[styles.italicLabel, textAnimation]}>
            {t("darkMode")}
          </Animated.Text>

          <Switch
            value={colorScheme === "dark"}
            onValueChange={(toggle) => {
              setColorScheme(toggle ? "dark" : "light");
            }}
            trackColor={{ false: "#e0e0e0", true: "#444444" }}
          />
        </Animated.View>

        <Animated.Text style={[styles.themeSwitchText, torqColorAnimation, { marginTop: 30 }]}>  
          {t("appLangOpt")}
        </Animated.Text>

        {["pl", "en"].map((lang) => (
          <Animated.View key={lang} style={[styles.themeSwitchBackground, torqBackColorAnimation]}>
            <Animated.Text style={[styles.italicLabel, textAnimation]}>
              {t(lang)}
            </Animated.Text>

            <Pressable style={styles.radioButton} onPress={() => handleChangeLang(lang)}>
              {language === lang && (
                <Animated.View
                  style={[styles.checkedButton, lang === "pl" ? showChoosenButtonPL : showChoosenButtonEN]}
                />
              )}
            </Pressable>
          </Animated.View>
        ))}

        <Animated.Text style={[styles.themeSwitchText, torqColorAnimation, { marginTop: 30 }]}>  
          Translation History
        </Animated.Text>

        <View style={{ alignItems: "center" }}>
          <Pressable style={{ width: "100%" }} onPress={() => router.push("/translationHistory")}>
            <Animated.View style={[styles.translationHistoryButton, torqBackColorAnimation]}>
              <Animated.Text style={[styles.italicLabel, textAnimation]}>Show</Animated.Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function createStyles(dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    themeContainer: {
      marginTop: 100,
      margin: 25,
    },
    themeSwitchText: {
      fontSize: 18,
      fontWeight: "700",
    },
    italicLabel: {
      fontStyle: "italic",
      fontSize: 16,
      fontWeight: "500",
    },
    themeSwitchBackground: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 7,
      marginBottom: 3,
      borderRadius: 25,
      padding: 10,
      paddingLeft: 20,
      paddingRight: 20,
    },
    radioButton: {
      width: 22,
      height: 22,
      backgroundColor: dark.text,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    checkedButton: {
      width: 15,
      height: 15,
      backgroundColor: dark.dark_torq,
      borderRadius: 50,
    },
    translationHistoryButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 7,
      marginBottom: 3,
      borderRadius: 25,
      padding: 10,
    },
  });
}
