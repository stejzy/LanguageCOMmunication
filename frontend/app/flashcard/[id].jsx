import { ThemeContext } from "@/context/ThemeContext";
import { useLocalSearchParams } from "expo-router";
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
} from "react-native";
import * as flashcardService from "@/api/flashcardService";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/AuthContext";
import { useAddFlashcardModal } from "@/hooks/useAddFlashcardModal";
import { useTranslation } from "react-i18next";

function FlashcardFolderDetail() {
  const { id } = useLocalSearchParams();
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
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

  const { openModal: openAddFlashcardModal, AddFlashcardModal } =
    useAddFlashcardModal();

  const handleAddFlashcardSuccess = useCallback(
    async (newFlashcard) => {
      await flashcardService.addFlashcardToFolder(id, newFlashcard.id);
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

  return (
    <View style={styles.container}>
      <View style={styles.folderNameRow}>
        <Text style={styles.folderName}>{folderName}</Text>
        <Pressable style={styles.folderEditIcon} onPress={openEditFolderModal}>
          <Ionicons name="create-outline" size={22} color={theme.torq} />
        </Pressable>
      </View>
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
            </View>
            <View style={styles.actions}>
              <Pressable
                style={styles.editButton}
                onPress={() => openEditModal(flashcard)}
              >
                <Ionicons name="create-outline" size={20} color={theme.torq} />
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(flashcard.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable
        style={styles.addButton}
        onPress={() =>
          openAddFlashcardModal({
            defaultFolderId: id,
            onSuccess: handleAddFlashcardSuccess,
            hideFolderPicker: true,
          })
        }
      >
        <Text style={styles.addButtonText}>{t("flashcardAdd")}</Text>
      </Pressable>
      <AddFlashcardModal />

      {/* Edit Flashcard Folder Modal */}
      <Modal
        visible={editFolderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditFolderModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "android" ? 60 : 0}
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
          keyboardVerticalOffset={Platform.OS === "android" ? 60 : 0}
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
    </View>
  );
}

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.d_gray,
      paddingTop: 24,
      paddingHorizontal: 16,
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
    },
    addButtonText: {
      color: theme.d_gray,
      fontWeight: "bold",
      fontSize: 18,
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
    },
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
      paddingBottom: 32,
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
      color: theme.l_mint,
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
  });
};

export default FlashcardFolderDetail;
