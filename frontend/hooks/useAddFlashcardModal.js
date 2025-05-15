import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import { useTranslation } from "react-i18next";

export function useAddFlashcardModal() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const onSuccessRef = useRef(null);

  const openModal = useCallback(
    ({
      frontContent = "",
      backContent = "",
      defaultFolderId = null,
      onSuccess = null,
      hideFolderPicker = false,
    } = {}) => {
      setModalProps({
        frontContent,
        backContent,
        defaultFolderId,
        hideFolderPicker,
      });
      onSuccessRef.current = onSuccess;
      setVisible(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setVisible(false);
    setModalProps({});
    onSuccessRef.current = null;
  }, []);

  function AddFlashcardModal() {
    const { t } = useTranslation();
    const [frontContent, setFrontContent] = useState("");
    const [backContent, setBackContent] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [folders, setFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hideFolderPicker, setHideFolderPicker] = useState(false);

    useEffect(() => {
      if (visible) {
        setFrontContent(modalProps.frontContent || "");
        setBackContent(modalProps.backContent || "");
        setSaving(false);
        setHideFolderPicker(!!modalProps.hideFolderPicker);
        setLoadingFolders(true);
        (async () => {
          try {
            const userFolders = await flashcardService.getFlashcardManyFolder();
            setFolders(userFolders);
            if (
              modalProps.defaultFolderId &&
              userFolders.some((f) => f.id === modalProps.defaultFolderId)
            ) {
              setSelectedFolderId(modalProps.defaultFolderId);
            } else if (userFolders.length > 0) {
              setSelectedFolderId(userFolders[0].id);
            } else {
              setSelectedFolderId(null);
            }
          } catch (e) {
            Toast.show({
              type: "error",
              text1: t("flashcardLoadFoldersError"),
            });
            setFolders([]);
            setSelectedFolderId(null);
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
      if (!frontContent.trim() || !backContent.trim() || !selectedFolderId) {
        Toast.show({ type: "error", text1: t("flashcardFillAllFields") });
        return;
      }
      setSaving(true);
      try {
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
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "android" ? 60 : 0}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 16,
            }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={{
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
                }}
              >
                <Text
                  style={{
                    color: theme.torq,
                    fontSize: 24,
                    marginBottom: 18,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {t("flashcardAdd")}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.dark_torq,
                    color: theme.text,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 18,
                    fontSize: 18,
                    width: 280,
                  }}
                  value={frontContent}
                  onChangeText={setFrontContent}
                  placeholder={t("flashcardFrontContent")}
                  placeholderTextColor={theme.text}
                  editable={!saving}
                  maxLength={200}
                />
                <TextInput
                  style={{
                    backgroundColor: theme.dark_torq,
                    color: theme.text,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 18,
                    fontSize: 18,
                    width: 280,
                  }}
                  value={backContent}
                  onChangeText={setBackContent}
                  placeholder={t("flashcardBackContent")}
                  placeholderTextColor={theme.text}
                  editable={!saving}
                  maxLength={200}
                />
                {!hideFolderPicker && (
                  <Picker
                    selectedValue={selectedFolderId}
                    style={{
                      color: theme.text,
                      backgroundColor: theme.l_mint,
                      borderRadius: 10,
                      marginBottom: 18,
                      fontSize: 18,
                    }}
                    onValueChange={setSelectedFolderId}
                    enabled={!loadingFolders && !saving}
                  >
                    {folders.length === 0 ? (
                      <Picker.Item
                        label={t("flashcardNoFolders")}
                        value={null}
                      />
                    ) : (
                      folders.map((folder) => (
                        <Picker.Item
                          key={folder.id}
                          label={folder.name}
                          value={folder.id}
                        />
                      ))
                    )}
                  </Picker>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Pressable
                    onPress={closeModal}
                    style={{
                      padding: 12,
                      backgroundColor: theme.dark_torq,
                      borderRadius: 10,
                      flex: 1,
                      marginRight: 10,
                    }}
                    disabled={saving}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        textAlign: "center",
                        fontSize: 16,
                      }}
                    >
                      {t("flashcardCancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    style={{
                      padding: 12,
                      backgroundColor: theme.torq,
                      borderRadius: 10,
                      flex: 1,
                      marginLeft: 10,
                      opacity: saving ? 0.7 : 1,
                    }}
                    disabled={saving}
                  >
                    <Text
                      style={{
                        color: theme.d_gray,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {saving ? t("flashcardSaving") : t("flashcardSave")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  return { openModal, AddFlashcardModal };
}
