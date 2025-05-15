import { View, Text, StyleSheet, Pressable } from "react-native"
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Switch } from "react-native-gesture-handler";
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {Colors} from "@/constans/Colors";
import {AppLangContext} from "@/context/AppLangContext"
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const {t} = useTranslation();

  const { theme, setColorScheme, colorScheme } = useContext(ThemeContext);
  const {language, setLanguage} = useContext(AppLangContext);
  
  const router = useRouter();

  const light = Colors.light
  const dark = Colors.dark

  const styles = createStyles(theme, dark);

  const progress = useSharedValue(colorScheme === "dark" ? 1 : 0);

  const d_grayAnimation = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
        progress.value,
        [0, 1],
        [light.d_gray, dark.d_gray]
      )

    return{
      backgroundColor,
    }
  });

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

  const torqColorAnimation = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [light.torq, dark.torq]
    );
    return {
      color,
    };
  });

  const torqBackColorAnimation = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [light.torq, dark.torq]
    );
    return {
      backgroundColor,
    };
  });

  const textAnimation = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [light.text, dark.text]
    );
    return {
      color,
    };
  });

   useEffect(() => {
    progress.value = withTiming(colorScheme === "dark" ? 1 : 0, { duration: 500 });
  }, [colorScheme]);


    const handleThemeChange = (toggle) => {
      if ((toggle && colorScheme !== "dark") || (!toggle && colorScheme !== "light")) {
        setColorScheme(toggle ? "dark" : "light");
        progress.value = withTiming(toggle ? 1 : 0, { duration: 500 });
      }
    };

    const visibilityPL = useSharedValue(language == "pl" ? 1 : 0);
    const visibilityEN = useSharedValue(language == "en" ? 1 : 0);

    const showChoosenButtonPL = useAnimatedStyle(() => {
      return {
        opacity: visibilityPL.value,
      };
    });

    const showChoosenButtonEN = useAnimatedStyle(() => {
      return {
        opacity: visibilityEN.value,
      };
    });

    const handleChangeLang = (lang) => {
      if (lang !== language) {
        setLanguage(lang);

        if (lang === "pl") {
          visibilityPL.value = withTiming(1, { duration: 300 }); 
          visibilityEN.value = withTiming(0, { duration: 300 }); 
        } else {
          visibilityPL.value = withTiming(0, { duration: 300 }); 
          visibilityEN.value = withTiming(1, { duration: 300 });
        }
      }
    };


  return (
    <Animated.View style={[styles.container, d_grayAnimation]}>
      <Animated.View style={[styles.header, dark_torqAnimation]}>
        <Pressable style={styles.arrow} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={theme.text} />
        </Pressable>
        <Animated.Text style={[styles.headerTitle, textAnimation]}>{t("settings")}</Animated.Text>
      </Animated.View>

      <View style={styles.themeContainer}>
        <View>
          <Animated.Text style={[styles.themeSwitchText, torqColorAnimation]}>{t("themeSwitch")}</Animated.Text>
        </View>
        <Animated.View style={[styles.themeSwitchBackground, torqBackColorAnimation]}>
          <Animated.Text style={[{ fontStyle: "italic", fontSize: 16, fontWeight: "500" }, textAnimation]}>
            {t("darkMode")}
          </Animated.Text>
          <Switch
            value={colorScheme === "dark"}
            onValueChange={(toggle) => {
              setColorScheme(toggle ? "dark" : "light")
              progress.value = withTiming(toggle ? 1 : 0, { duration: 500 });
            }}
            trackColor={{
              false: "#e0e0e0",
              true: "#444444",
            }}
          ></Switch>
        </Animated.View>

        <View>
          <View>
            <Animated.Text style={[styles.themeSwitchText, torqColorAnimation, {marginTop: 30}]}>{t("appLangOpt")}</Animated.Text>
          </View>
          
          <Animated.View style={[styles.themeSwitchBackground, torqBackColorAnimation]}>
             <Animated.Text style={[{ fontStyle: "italic", fontSize: 16, fontWeight: "500" }, textAnimation]}>
              {t("pl")}
            </Animated.Text>

            <Pressable style={[styles.radioButton]} onPress={() => handleChangeLang('pl')}>
              {language === 'pl' && <Animated.View style={[styles.checkedButton, showChoosenButtonPL]} />}
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.themeSwitchBackground, torqBackColorAnimation]}>
             <Animated.Text style={[{ fontStyle: "italic", fontSize: 16, fontWeight: "500" }, textAnimation]}>
              {t("en")}
            </Animated.Text>

            
              <Pressable style={styles.radioButton} onPress={() => handleChangeLang('en')}>
                {language === 'en' && <Animated.View style={[styles.checkedButton, showChoosenButtonEN]} />}
              </Pressable>
            
          </Animated.View>
        </View>

        <View>
            <Animated.Text style={[styles.themeSwitchText, torqColorAnimation, {marginTop: 30}]}>Translation History</Animated.Text>

            <View style={{alignItems: "center"}}>

              <Pressable style={{ width: "100%"}} onPress={() => router.push("/translationHistory")}>
                <Animated.View style={[styles.translationHistoryButton, torqBackColorAnimation]}>
                  <Animated.Text style={[{ fontStyle: "italic", fontSize: 16, fontWeight: "500" }, textAnimation]}>
                    Show
                  </Animated.Text>
                </Animated.View>
              </Pressable>


            </View>
        </View>

      </View>

    </Animated.View>
  );
}

function createStyles(theme, dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      paddingTop: 19, 
      paddingBottom: 19,
    },
    arrow: {
      position: "absolute",
      left: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    themeContainer: {
      margin: 25
    },
    themeSwitchText: {
      fontSize: 18,
      fontWeight: 700
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
      alignItems: "center"
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
    }
  });
}
