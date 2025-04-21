import {View, StyleSheet} from "react-native";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function TopBar(){
    const {theme} = useContext(ThemeContext);

    const styles = createStyles(theme);

    return(
        <View style = {styles.background}/>
    )
}

function createStyles(theme) {
    return StyleSheet.create({
        background: {
            backgroundColor: "red",
            height: "9%",
            width: "100%"
        }
    });
}