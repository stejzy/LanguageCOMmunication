import { View, Text, StyleSheet, Pressable, TouchableHighlight } from "react-native"; 
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import LanguageSelector from "./LanguageSelector";

export default function MenuTranslationBar()  {
    const { theme } = useContext(ThemeContext);
    const styles = createStyles(theme);

    return(
        <View style={styles.background}>
            <View style = {styles.languageButtonsRow}>
               <LanguageSelector type="source"></LanguageSelector>

                <Pressable
                    style={({ pressed }) => (
                        [styles.swapButton, pressed && {backgroundColor: 'rgba(224, 224, 224, 0.5)'}]
                    )}
                    >
                    <Entypo name="swap" size={30} color={theme.d_gray} />
                </Pressable>

                <LanguageSelector type="target"></LanguageSelector>
            </View>
            <View style={styles.optionButtonsRow}>
                <Pressable style={({ pressed }) => [styles.talkButton, pressed && { opacity: 0.75 }]}>
                    <Ionicons name="people" size={25} color={theme.d_gray} />
                </Pressable>

                <Pressable style={({ pressed }) => [styles.micButton, pressed && { opacity: 0.75 }]}>
                    <FontAwesome name="microphone" size={30} color={theme.d_gray} />
                </Pressable>

                <Pressable style={({ pressed }) => [styles.cameraButton, pressed && { opacity: 0.75 }]}>
                    <Entypo name="camera" size={25} color={theme.d_gray} />
                </Pressable>
            </View>
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
            height: "30%",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
        },
        languageButton: {
            backgroundColor: theme.mint,
            height: 40,
            width: 120,
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
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