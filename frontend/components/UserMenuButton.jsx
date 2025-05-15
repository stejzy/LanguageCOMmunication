import React, { useState, useContext } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "@/context/ThemeContext";

export default function UserMenuButton() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const [open, setOpen] = useState(false);
  const { authState, onLogin, onRegister, onLogout } = useContext(AuthContext);
  const username = authState?.username;

  const router = useRouter();

  const styles = createStyles(theme);

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      <Pressable onPressIn={toggleMenu} style={styles.trigger}>
        {authState?.authenticated && username ? (
          <View style={styles.userInfoRow}>
            <View style={[styles.avatar, { backgroundColor: theme.mint }]}>
              <Text style={styles.avatarText}>
                {username[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          </View>
        ) : (
          <Ionicons name="person-circle-outline" size={50} color={theme.text} />
        )}
      </Pressable>

      <Modal
        transparent
        visible={open}
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={() => setOpen(false)}
      >
        <View style={{ flex: 1 }}>
          <Pressable
            style={[styles.overlayTouchable]}
            onPress={() => setOpen(false)}
          />
          <View style={styles.menu}>
            {!authState?.authenticated ? (
              <>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/login");
                  }}
                  style={styles.menuItem}
                >
                  <Text style={styles.menuText}>{t("login.button")}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/register");
                  }}
                  style={styles.menuItem}
                >
                  <Text style={styles.menuText}>{t("register.button")}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.greeting}>
                  {t("helloMessage")}
                  {"\n"}
                  <Text style={styles.username}>{username}</Text>
                </Text>
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/login");
                    onLogout();
                  }}
                  style={styles.menuItem}
                >
                  <Text style={styles.menuText}>{t("logout")}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (theme) => {
  return StyleSheet.create({
    trigger: {
      zIndex: 1,
      elevation: 10,
      marginLeft: Platform.OS === "web" ? 16 : 0,
    },
    cursorDefault: {
      cursor: "default",
    },
    modalOverlay: {
      flex: 1,
    },
    overlayTouchable: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.25)",
      cursor: "default",
    },
    menu: {
      backgroundColor: theme.d_gray,
      position: "absolute",
      top: 55,
      left: 16,
      borderRadius: 6,
      padding: 10,
    },
    menuItem: {
      paddingVertical: 10,
    },
    menuText: {
      fontSize: 20,
      color: theme.text,
    },
    userInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#52C7A8",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    avatarText: {
      marginTop: Platform.OS === "web" ? -2 : 0,
      color: "#fff",
      fontWeight: "bold",
      fontSize: 20,
    },
    username: {
      fontSize: 18,
      fontWeight: "bold",
    },
    greeting: {
      fontSize: 16,
      color: theme.text,
    },
    username: {
      fontWeight: "bold",
      fontSize: 18,
      color: theme.torq,
    },
  });
};
