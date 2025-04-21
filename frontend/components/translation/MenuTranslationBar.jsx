import { View, StyleSheet } from "react-native"; 
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";

export default function MenuTranslateBar()  {
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

    const styles = createStyles(colorScheme, setColorScheme, theme);

    return(
        <View style = {styles.background}>
        </View>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        background: {
            height: "25%",
            width: "100%"
        }
    });
}