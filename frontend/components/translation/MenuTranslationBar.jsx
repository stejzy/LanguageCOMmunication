import { View, StyleSheet, Pressable, Keyboard } from "react-native"; 
import { ThemeContext } from "@/context/ThemeContext";
import { useContext, useEffect, useState } from "react";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { LanguageContext } from "@/context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import useKeyboard from "@/hooks/useKeyboard";



export default function MenuTranslationBar()  {
    console.log("RENDER MenuTranslationBar")
    const keyboardVisible = useKeyboard();

    const { sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage } = useContext(LanguageContext);

    const handleSwapLanguages = () => {
        if (sourceLanguage && targetLanguage) {
          setSourceLanguage(targetLanguage);
          setTargetLanguage(sourceLanguage);
        }
      };

    const { theme } = useContext(ThemeContext);
    const styles = createStyles(theme);

    const buttons = [
        { icon: <Ionicons name="people" size={25} color={theme.d_gray} />, style: styles.talkButton },
        { icon: <FontAwesome name="microphone" size={30} color={theme.d_gray} />, style: styles.micButton },
        { icon: <Entypo name="camera" size={25} color={theme.d_gray} />, style: styles.cameraButton },
      ];

    return(
        <View style={styles.background}>
            <View style = {styles.languageButtonsRow}>
               <LanguageSelector type="source"></LanguageSelector>

                <Pressable
                    onPress={handleSwapLanguages}
                    style={({ pressed }) => (
                        [styles.swapButton, pressed && {backgroundColor: 'rgba(224, 224, 224, 0.5)'}]
                    )}
                    >
                    <Entypo name="swap" size={30} color={theme.d_gray} />
                </Pressable>

                <LanguageSelector type="target"></LanguageSelector>
            </View>
            
            { !keyboardVisible && (
                <View style={styles.optionButtonsRow}>
                    {buttons.map((button, index) => (
                        <Pressable
                        key={index}
                        style={({ pressed }) => [button.style, pressed && { opacity: 0.75 }]}
                        >
                        {button.icon}
                        </Pressable>
                    ))}
                </View>
            )}

    </View>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        background: {
            height: "25%",
            width: "100%",
            justifyContent: "space-evenly",
        },
        languageButtonsRow: {
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center"
        },
        swapButton: {
            backgroundColor: "transparent",
            padding: 7,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
        },
        optionButtonsRow: {
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
            paddingHorizontal: 20
        },
        talkButton: {
            backgroundColor: theme.mint,
            height: 50,
            width: 50,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center"
        },
        micButton: {
            backgroundColor: theme.mint,
            height: 75,
            width: 75,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center"
        },
        cameraButton: {
            backgroundColor: theme.mint,
            height: 50,
            width: 50,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center"
        },

    });
}