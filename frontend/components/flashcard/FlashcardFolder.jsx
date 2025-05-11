import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import React, { useContext, useState, useRef } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Menu } from "react-native-paper";
import * as flashcardService from "@/api/flashcardService";
import Toast from "react-native-toast-message";

export default function FlashcardFolder({ folder, onDelete }) {
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = (e) => {
    if (Platform.OS === "web") e.preventDefault();
    setMenuVisible(true);
  };
  const closeMenu = () => setMenuVisible(false);

  const handleDelete = async () => {
    try {
      await flashcardService.deleteFlashcardFolder(folder.id);
      onDelete(folder.id);
      setMenuVisible(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to delete folder. Try again later!",
      });
      console.error(error);
    }
  };

  const handleOpen = async () => {
    console.log("open");
  };

  return (
    <>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        style={styles.menu}
        anchor={
          <Pressable
            style={styles.flashcardFolderContainer}
            onPress={handleOpen}
            onLongPress={openMenu}
            onContextMenu={Platform.OS === "web" ? openMenu : undefined}
          >
            <View style={styles.flashcardFolder}>
              <View style={[styles.tab, styles.tabTopLeft]}></View>
              <View style={[styles.tab, styles.tabBottom]}></View>
            </View>
            <Text style={styles.folderName}>{folder.name}</Text>
            <></>
          </Pressable>
        }
      >
        <Menu.Item onPress={handleDelete} title="Delete folder" />
      </Menu>
    </>
  );
}

const createStyles = (theme) => {
  const scaling = Platform.OS === "web" ? 1 : 0.7;
  return StyleSheet.create({
    flashcardFolder: {
      width: "100%",
      height: "80%",
      backgroundColor: theme.torq,
      borderRadius: 8 * scaling,
      position: "relative",
    },
    flashcardFolderContainer: {
      height: 140 * scaling,
      width: 180 * scaling,
      justifyContent: "center",
      alignItems: "center",
      margin: 15 * scaling,
    },
    folderName: {
      textAlign: "left",
      color: theme.l_mint,
      textAlign: "center",
      fontSize: 24 * scaling,
      marginTop: 5 * scaling,
    },
    tabTopLeft: {
      width: 70 * scaling,
      height: 65 * scaling,
      top: 0,
      left: 0,
      elevation: 1,
      boxShadow: "0px 4px 6px rgba(0,0,0,1)",
    },
    tabBottom: {
      width: 180 * scaling,
      height: 87 * scaling,
      top: 25 * scaling,
      left: 0,
    },
    tab: {
      borderRadius: 8 * scaling,
      position: "absolute",
      backgroundColor: theme.mint,
    },
    menu: {
      backgroundColor: theme.d_gray,
      borderRadius: 12,
      elevation: 8,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  });
};
