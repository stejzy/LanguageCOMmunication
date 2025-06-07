import { ThemeContext } from "@/context/ThemeContext";
import { useLocalSearchParams, router } from "expo-router";
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import * as flashcardService from "@/api/flashcardService";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/AuthContext";
import { useGlobalAddFlashcardModal } from "@/context/AddFlashcardModalContext";
import { useTranslation } from "react-i18next";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

function FlashcardFolderDetail() {
  const { id } = useLocalSearchParams();
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();

  const [flashcards, setFlashcards] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    frontContent: "",
    backContent: "",
    status: "ACTIVE",
  });
  const [editFolderModalVisible, setEditFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const folderNameInputRef = useRef(null);
  const frontContentInputRef = useRef(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { openModal } = useGlobalAddFlashcardModal();

  const handleAddFlashcardSuccess = useCallback(
    async (newFlashcard) => {
      const folder = await flashcardService.getFlashcardOneFolder(id);
      setFlashcards(folder.flashcards);
    },
    [id]
  );

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const folder = await flashcardService.getFlashcardOneFolder(id);
        setFlashcards(folder.flashcards);
        setFolderName(folder.name);
        setCreatedAt(folder.createdAt);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: t("flashcardLoadError"),
        });
        console.error(error);
      }
    };
    if (!authState.loading && authState.authenticated && id) {
      fetchFlashcards();
    }
  }, [id, authState.loading, authState.authenticated, t]);

  const handleDelete = async (flashcardId) => {
    try {
      await flashcardService.deleteFlashcard(flashcardId);
      setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
      Toast.show({ type: "success", text1: t("flashcardDeleteSuccess") });
    } catch (error) {
      Toast.show({ type: "error", text1: t("flashcardDeleteError") });
    }
  };

  const openEditModal = (flashcard) => {
    setEditData({
      id: flashcard.id,
      frontContent: flashcard.frontContent,
      backContent: flashcard.backContent,
      status: flashcard.status || "ACTIVE",
    });
    setTimeout(() => frontContentInputRef.current?.focus(), 100);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditData({
      id: null,
      frontContent: "",
      backContent: "",
      status: "ACTIVE",
    });
  };

  const handleEditSave = async () => {
    try {
      await flashcardService.updateFlashcard(editData.id, {
        frontContent: editData.frontContent,
        backContent: editData.backContent,
        status: "ACTIVE",
      });
      const folder = await flashcardService.getFlashcardOneFolder(id);
      setFlashcards(folder.flashcards);
      Toast.show({ type: "success", text1: t("flashcardUpdateSuccess") });
      closeEditModal();
    } catch (error) {
      Toast.show({ type: "error", text1: t("flashcardUpdateError") });
    }
  };

  const openEditFolderModal = () => {
    setNewFolderName(folderName);
    setEditFolderModalVisible(true);
    setTimeout(() => folderNameInputRef.current?.focus(), 100);
  };

  const closeEditFolderModal = () => {
    setEditFolderModalVisible(false);
    setNewFolderName("");
  };

  const handleEditFolderSave = async () => {
    try {
      await flashcardService.editFolderName(id, newFolderName);
      setFolderName(newFolderName);
      Toast.show({ type: "success", text1: t("flashcardFolderUpdateSuccess") });
      closeEditFolderModal();
    } catch (error) {
      Toast.show({ type: "error", text1: t("flashcardFolderUpdateError") });
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "black" : "white"}
      />
      <View style={styles.folderNameRow}>
        <Text style={styles.folderName}>{folderName}</Text>
        <Pressable style={styles.folderEditIcon} onPress={openEditFolderModal}>
          <Ionicons name="create-outline" size={22} color={theme.torq} />
        </Pressable>
      </View>
      <Pressable
        style={[
          styles.addButton,
          {
            marginBottom: 10,
            backgroundColor: theme.mint,
            alignSelf: "center",
          },
        ]}
        onPress={() => {
          router.push(`/flashcard/${id}/test`);
        }}
      >
        <Text style={[styles.addButtonText, { color: theme.d_gray }]}>
          {t("flashcardTestButton") || "Testuj fiszki"}
        </Text>
      </Pressable>
      <Text style={styles.createdAt}>
        {t("flashcardCreatedAt")} {new Date(createdAt).toLocaleDateString()}
      </Text>
      <ScrollView style={styles.flashcardsContainer}>
        {flashcards.map((flashcard, index) => (
          <View key={index} style={styles.flashcardRow}>
            <View style={styles.flashcard}>
              <Text style={styles.flashcardFront}>
                {flashcard.frontContent}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.flashcardBack}>{flashcard.backContent}</Text>
              <View style={styles.statsRow}>
                <View style={[styles.statBadge, styles.statCorrect]}>
                  <Text style={styles.statIcon}>✓</Text>
                  <Text style={styles.statText}>
                    {flashcard.correctResponses || 0}
                  </Text>
                </View>
                <View style={[styles.statBadge, styles.statWrong]}>
                  <Text style={styles.statIcon}>✗</Text>
                  <Text style={styles.statText}>
                    {flashcard.incorrectResponses || 0}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable
                style={styles.editButton}
                onPress={() => openEditModal(flashcard)}
                testID={`edit-flashcard-${flashcard.id}`}
              >
                <Ionicons name="create-outline" size={20} color={theme.torq} />
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(flashcard.id)}
                testID={`delete-flashcard-${flashcard.id}`}
              >
                <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.addButton}
          onPress={() =>
            openModal({
              defaultFolderId: id,
              onSuccess: handleAddFlashcardSuccess,
              hideFolderPicker: true,
            })
          }
          testID="add-flashcard-button"
        >
          <Text style={styles.addButtonText}>{t("flashcardAdd")}</Text>
        </Pressable>
        <Pressable
          style={[styles.addButton]}
          onPress={() => setExportModalVisible(true)}
          testID="export-folder-modal"
        >
          <Text style={styles.addButtonText}>{t("flashcardExport")}</Text>
        </Pressable>
      </View>

      {/* Edit Flashcard Folder Modal */}
      <Modal
        visible={editFolderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditFolderModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          style={styles.modalAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t("flashcardEditFolderName")}
              </Text>
              <TextInput
                ref={folderNameInputRef}
                style={styles.modalTextInput}
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder={t("flashcardFolderName")}
                placeholderTextColor={theme.text}
                maxLength={40}
              />
              <View style={styles.modalButtonRow}>
                <Pressable
                  onPress={closeEditFolderModal}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>
                    {t("flashcardCancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleEditFolderSave}
                  style={styles.modalSaveButton}
                >
                  <Text style={styles.modalSaveText}>{t("flashcardSave")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Flashcard Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "android" ? 0 : 0}
          style={styles.modalAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[styles.modalContent, { backgroundColor: theme.d_gray }]}
              >
                <Text style={[styles.modalTitle, { color: theme.torq }]}>
                  {t("flashcardEdit")}
                </Text>
                <TextInput
                  ref={frontContentInputRef}
                  style={[
                    styles.modalTextInput,
                    { backgroundColor: theme.dark_torq, color: theme.text },
                  ]}
                  value={editData.frontContent}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, frontContent: text }))
                  }
                  placeholder={t("flashcardFrontContent")}
                  placeholderTextColor={theme.text}
                />
                <TextInput
                  style={[
                    styles.modalTextInput,
                    { backgroundColor: theme.dark_torq, color: theme.text },
                  ]}
                  value={editData.backContent}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, backContent: text }))
                  }
                  placeholder={t("flashcardBackContent")}
                  placeholderTextColor={theme.text}
                />
                <View style={styles.modalButtonRow}>
                  <Pressable
                    onPress={closeEditModal}
                    style={[
                      styles.modalCancelButton,
                      { backgroundColor: theme.dark_torq },
                    ]}
                  >
                    <Text
                      style={[styles.modalCancelText, { color: theme.text }]}
                    >
                      {t("flashcardCancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleEditSave}
                    style={[
                      styles.modalSaveButton,
                      { backgroundColor: theme.torq },
                    ]}
                  >
                    <Text
                      style={[styles.modalSaveText, { color: theme.d_gray }]}
                    >
                      {t("flashcardSave")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Export Folder Modal */}
      <Modal
        visible={exportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "android" ? 60 : 0}
          style={styles.modalAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t("flashcardExport")}</Text>
              <Text style={[styles.modalDesc, { color: theme.text }]}>
                {t("flashcardExportDesc")}
              </Text>
              <View style={{ alignItems: "center", marginVertical: 18 }}>
                <QRCode
                  value={`com.lancom.flashlingo://import?folder=${id}`}
                  size={180}
                  color={theme.text}
                  backgroundColor={theme.d_gray}
                />
                <Text
                  style={{
                    color: theme.text,
                    marginTop: 10,
                    fontSize: 15,
                    fontStyle: "italic",
                  }}
                >
                  {t("flashcardExportQrLabel")}
                </Text>
                {/* Export link for copy */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    backgroundColor: theme.dark_torq,
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 15,
                      fontWeight: "bold",
                      marginRight: 8,
                    }}
                  >
                    {t("flashcardExportCopy")}:
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: theme.text,
                      fontSize: 15,
                      marginRight: 8,
                      maxWidth: 180,
                      padding: 10,
                    }}
                    numberOfLines={2}
                    ellipsizeMode="middle"
                    testID="export-folder-code"
                  >
                    {`${id}`}
                  </Text>
                  <Pressable
                    onPress={async () => {
                      await Clipboard.setStringAsync(`${id}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }}
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      backgroundColor: theme.torq,
                    }}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={theme.d_gray}
                    />
                  </Pressable>
                  {copied && Platform.OS == "web" && (
                    <Text
                      style={{
                        color: theme.torq,
                        marginLeft: 8,
                        fontWeight: "bold",
                      }}
                    >
                      {t("flashcardExportCopied")}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.modalButtonRow}>
                <Pressable
                  onPress={() => setExportModalVisible(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>
                    {t("flashcardCancel")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (theme, colorScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.d_gray,
      paddingTop: 24,
    },
    folderNameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 5,
    },
    folderName: {
      fontSize: 30,
      fontWeight: "500",
      color: theme.torq,
      textAlign: "center",
    },
    folderEditIcon: {
      marginLeft: 8,
      padding: 4,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    addButton: {
      backgroundColor: theme.torq,
      padding: 14,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      marginBottom: 20,
      width: "46%",
    },
    addButtonText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    modalAvoidingView: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 16,
      width: "100%",
    },
    modalContent: {
      backgroundColor: theme.d_gray,
      padding: 28,
      borderRadius: 18,
      width:
        Platform.OS === "android"
          ? "100%"
          : Platform.OS === "web"
          ? 400
          : "95%",
      maxWidth: Platform.OS === "android" ? "100%" : 500,
      left: Platform.OS === "android" ? 0 : undefined,
      margin: Platform.OS === "android" ? 0 : undefined,
      alignSelf: Platform.OS === "android" ? undefined : "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    modalTitle: {
      color: theme.torq,
      fontSize: 24,
      marginBottom: 18,
      textAlign: "center",
      fontWeight: "bold",
    },
    modalTextInput: {
      backgroundColor: theme.dark_torq,
      color: theme.text,
      borderRadius: 10,
      padding: 12,
      marginBottom: 18,
      fontSize: 18,
      width: 280,
    },
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    modalCancelButton: {
      padding: 12,
      backgroundColor: theme.dark_torq,
      borderRadius: 10,
      flex: 1,
      marginRight: 10,
    },
    modalCancelText: {
      color: theme.text,
      textAlign: "center",
      fontSize: 16,
    },
    modalSaveButton: {
      padding: 12,
      backgroundColor: theme.torq,
      borderRadius: 10,
      flex: 1,
      marginLeft: 10,
    },
    modalSaveText: {
      color: theme.d_gray,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    },
    createdAt: {
      fontSize: 15,
      fontStyle: "italic",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
    },
    flashcardsContainer: {
      paddingHorizontal: 16,
    },
    flashcard: {
      flex: 1,
      backgroundColor: theme.torq,
      borderRadius: 8,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
      justifyContent: "center",
    },
    textContainer: {
      alignItems: "center",
    },
    flashcardFront: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    separator: {
      height: 1,
      width: "80%",
      backgroundColor: theme.l_mint,
      marginVertical: 10,
    },
    flashcardBack: {
      fontSize: 18,
      fontWeight: "400",
      fontStyle: "italic",
      color: colorScheme === "light" ? theme.text : theme.text,
      textAlign: "center",
    },
    actions: {
      flexDirection: "column",
      gap: 10,
      marginLeft: 12,
    },
    editButton: {
      backgroundColor: theme.d_gray,
      borderRadius: 20,
      padding: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButton: {
      backgroundColor: theme.d_gray,
      borderRadius: 20,
      padding: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    flashcardRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
      justifyContent: "space-between",
    },
    modalScroll: {
      flexGrow: 1,
      justifyContent: "center",
    },
    modalPicker: {
      color: theme.text,
      backgroundColor: theme.dark_torq,
      borderRadius: 10,
      marginBottom: 18,
      fontSize: 18,
    },
    modalDesc: {
      color: "#888",
      fontSize: 15,
      marginBottom: 10,
      textAlign: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.dark_torq,
      paddingHorizontal: 20,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      gap: 12,
    },
    statBadge: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginHorizontal: 2,
      minWidth: 38,
      justifyContent: "center",
    },
    statCorrect: {
      backgroundColor: theme.l_mint,
    },
    statWrong: {
      backgroundColor: "#FF5A5F",
    },
    statIcon: {
      color: theme.d_gray,
      fontWeight: "bold",
      fontSize: 16,
      marginRight: 4,
    },
    statText: {
      color: theme.d_gray,
      fontWeight: "bold",
      fontSize: 16,
    },
  });
};

export default FlashcardFolderDetail;
