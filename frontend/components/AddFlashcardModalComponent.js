import React, { useState, useEffect, useContext } from "react";
import Modal from "react-native-modal";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

export default function AddFlashcardModalComponent({
  visible,
  modalProps,
  onSuccessRef,
  closeModal,
}) {
  const { colorScheme, theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const windowHeight = Dimensions.get("window").height;
  const modalMaxHeight = windowHeight * 0.7;
  const styles = createStyles(theme);

  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hideFolderPicker, setHideFolderPicker] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");
  const [folderNameError, setFolderNameError] = useState("");

  useEffect(() => {
    if (visible) {
      setFrontContent(modalProps.frontContent || "");
      setBackContent(modalProps.backContent || "");
      setSaving(false);
      setHideFolderPicker(!!modalProps.hideFolderPicker);
      setLoadingFolders(true);
      setNewFolderName("");
      setFrontError("");
      setBackError("");
      setFolderNameError("");
      (async () => {
        try {
          const userFolders = await flashcardService.getFlashcardManyFolder();
          setFolders(userFolders);
          if (userFolders.length === 0) {
            setSelectedFolderId("__new__");
          } else if (
            modalProps.defaultFolderId &&
            userFolders.some((f) => f.id === modalProps.defaultFolderId)
          ) {
            setSelectedFolderId(modalProps.defaultFolderId);
          } else {
            setSelectedFolderId(userFolders[0].id);
          }
        } catch (e) {
          Toast.show({
            type: "error",
            text1: t("flashcardLoadFoldersError"),
          });
          setFolders([]);
          setSelectedFolderId("__new__");
        } finally {
          setLoadingFolders(false);
        }
      })();
    } else {
      setFrontContent("");
      setBackContent("");
      setSelectedFolderId(null);
      setFolders([]);
      setSaving(false);
      setHideFolderPicker(false);
      setLoadingFolders(false);
    }
  }, [visible]);

  const handleSave = async () => {
    let hasError = false;
    setFrontError("");
    setBackError("");
    setFolderNameError("");
    if (!frontContent.trim()) {
      setFrontError(t("flashcardFillFrontField"));
      hasError = true;
    }
    if (!backContent.trim()) {
      setBackError(t("flashcardFillBackField"));
      hasError = true;
    }
    if (selectedFolderId === "__new__" && !newFolderName.trim()) {
      setFolderNameError(t("flashcardFillFolderField"));
      hasError = true;
    }
    if (!selectedFolderId && selectedFolderId !== "__new__") {
      Toast.show({ type: "error", text1: t("flashcardFillAllFields") });
      return;
    }
    if (hasError) return;
    setSaving(true);
    try {
      if (selectedFolderId === "__new__") {
        if (!newFolderName.trim()) {
          setSaving(false);
          return;
        }

        const res = await flashcardService.createFlashcardFolder({
          name: newFolderName.trim(),
          flashcards: [
            {
              frontContent: frontContent.trim(),
              backContent: backContent.trim(),
              status: "ACTIVE",
            },
          ],
        });
        Toast.show({ type: "success", text1: t("flashcardAddSuccess") });
        if (onSuccessRef.current && res.flashcards && res.flashcards[0])
          onSuccessRef.current(res.flashcards[0]);
        closeModal();
        return;
      }

      const newFlashcard = await flashcardService.addFlashcard({
        frontContent: frontContent.trim(),
        backContent: backContent.trim(),
        status: "ACTIVE",
      });
      await flashcardService.addFlashcardToFolder(
        selectedFolderId,
        newFlashcard.id
      );
      Toast.show({ type: "success", text1: t("flashcardAddSuccess") });
      if (onSuccessRef.current) onSuccessRef.current(newFlashcard);
      closeModal();
    } catch (e) {
      Toast.show({ type: "error", text1: t("flashcardAddError") });
      setSaving(false);
      console.error(e);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      avoidKeyboard={true}
      propagateSwipe={true}
      useNativeDriver={false}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="always"
          style={[styles.scroll, { maxHeight: modalMaxHeight }]}
          scrollEnabled={true}
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>{t("flashcardAdd")}</Text>
            <Text style={styles.label}>{t("flashcardFrontContent")}</Text>
            <TextInput
              style={styles.input}
              value={frontContent}
              onChangeText={setFrontContent}
              placeholder={t("flashcardFrontContent")}
              placeholderTextColor={theme.text}
              editable={!saving}
              maxLength={200}
            />
            {frontError ? (
              <Text style={styles.error}>{frontError}</Text>
            ) : (
              <View style={styles.errorSpacer} />
            )}
            <Text style={styles.label}>{t("flashcardBackContent")}</Text>
            <TextInput
              style={styles.input}
              value={backContent}
              onChangeText={setBackContent}
              placeholder={t("flashcardBackContent")}
              placeholderTextColor={theme.text}
              editable={!saving}
              maxLength={200}
            />
            {backError ? (
              <Text style={styles.error}>{backError}</Text>
            ) : (
              <View style={styles.errorSpacer} />
            )}
            {!hideFolderPicker && folders.length > 0 && (
              <Text style={styles.label}>{t("flashcardFolderName")}</Text>
            )}
            {!hideFolderPicker && folders.length > 0 && (
              <Picker
                selectedValue={selectedFolderId}
                mode="dropdown"
                style={styles.picker}
                onValueChange={setSelectedFolderId}
                enabled={!loadingFolders && !saving}
                dropdownIconColor={theme.text}
              >
                {folders.map((folder) => (
                  <Picker.Item
                    style={{ backgroundColor: theme.dark_torq }}
                    color={theme.text}
                    key={folder.id}
                    label={folder.name}
                    value={folder.id}
                  />
                ))}
                <Picker.Item
                  style={{ backgroundColor: theme.dark_torq }}
                  color={theme.text}
                  label={
                    t("flashcardNewFolderOption") ||
                    "➕ " + t("flashcardFolderName")
                  }
                  value="__new__"
                />
              </Picker>
            )}
            {selectedFolderId === "__new__" && (
              <Text style={styles.label}>{t("flashcardFolderName")}</Text>
            )}
            {selectedFolderId === "__new__" && (
              <TextInput
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder={t("flashcardFolderName")}
                placeholderTextColor={theme.text}
                style={styles.input}
                editable={!saving}
                maxLength={40}
              />
            )}
            {selectedFolderId === "__new__" &&
              (folderNameError ? (
                <Text style={styles.error}>{folderNameError}</Text>
              ) : (
                <View style={styles.errorSpacer} />
              ))}
            <View style={styles.buttonRow}>
              <Pressable
                onPress={closeModal}
                style={styles.cancelButton}
                disabled={saving}
              >
                <Text style={styles.cancelText}>{t("flashcardCancel")}</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                disabled={saving}
              >
                <Text style={styles.saveText}>
                  {saving ? t("flashcardSaving") : t("flashcardSave")}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function createStyles(theme) {
  return {
    modal: {
      justifyContent: "center",
      alignItems: "center",
      margin: 0,
    },
    modalContainer: {
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    scroll: {},
    modalContent: {
      backgroundColor: theme.d_gray,
      padding: 28,
      borderRadius: 18,
      width: Platform.OS === "web" ? 400 : "95%",
      maxWidth: 500,
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    title: {
      color: theme.torq,
      fontSize: 24,
      marginBottom: 18,
      textAlign: "center",
      fontWeight: "bold",
    },
    label: {
      color: theme.text,
      fontSize: 15,
      marginBottom: 4,
      marginLeft: 2,
    },
    input: {
      backgroundColor: theme.dark_torq,
      color: theme.text,
      borderRadius: 10,
      padding: 12,
      marginBottom: 6,
      fontSize: 18,
      width: 280,
    },
    error: {
      color: "red",
      marginBottom: 12,
      fontSize: 13,
    },
    errorSpacer: {
      height: 12,
      marginBottom: 6,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    cancelButton: {
      padding: 12,
      backgroundColor: theme.dark_torq,
      borderRadius: 10,
      flex: 1,
      marginRight: 10,
    },
    cancelText: {
      color: theme.text,
      textAlign: "center",
      fontSize: 16,
    },
    saveButton: {
      padding: 12,
      backgroundColor: theme.torq,
      borderRadius: 10,
      flex: 1,
      marginLeft: 10,
    },
    saveText: {
      color: theme.d_gray,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    },
    picker: {
      color: theme.text,
      backgroundColor: theme.dark_torq,
      padding: 12,
      borderRadius: 18,
      borderWidth: 0,
      marginBottom: 6,
      fontSize: 18,
      width: 280,
      padding: 12,
      height: 60,
      marginVertical: 0,
      paddingVertical: 0,
    },
  };
}
