import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import AddFlashcardModalComponent from "@/components/AddFlashcardModalComponent";

const AddFlashcardModalContext = createContext();

export function AddFlashcardModalProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const onSuccessRef = useRef(null);

  const openModal = useCallback((props = {}) => {
    setModalProps(props);
    onSuccessRef.current = props.onSuccess || null;
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    setModalProps({});
    onSuccessRef.current = null;
  }, []);

  return (
    <AddFlashcardModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AddFlashcardModalComponent
        visible={visible}
        modalProps={modalProps}
        onSuccessRef={onSuccessRef}
        closeModal={closeModal}
      />
    </AddFlashcardModalContext.Provider>
  );
}

export function useGlobalAddFlashcardModal() {
  return useContext(AddFlashcardModalContext);
}
