import {View, Text, StyleSheet} from "react-native"
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function ScreenSlider() {
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
    
    const styles = createStyles(colorScheme, setColorScheme, theme);

    return(
        <View style={styles.background}></View>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        background: {
            height: "10%",
            width: "75%",
            backgroundColor: "red"
        }
    });
}
