import React, { useState, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function UserMenuButton() {
  const [open, setOpen] = useState(false);
  const {authState, onLogin, onRegister, onLogout} = useContext(AuthContext);

  const router = useRouter();

  const toggleMenu = () => {
    setOpen(prev => !prev);
  };

  return (
    <>
      <Pressable onPressIn={toggleMenu} style={styles.trigger}>
        <Ionicons name="person-circle-outline" size={50} color="black" />
        <></>
      </Pressable>

      <Modal
        transparent
        visible={open}
        hardwareAccelerated
        presentationStyle='overFullScreen'
        onRequestClose={() => setOpen(false)}
      >
          <View style={{ flex: 1 }}>
            <Pressable
              style={[
                styles.overlayTouchable
              ]}
              onPress={() => setOpen(false)}
            />
            <View style={styles.menu}>
              {!authState?.authenticated ? (
                <>
                  <Pressable
                    onPress={() => {
                      setOpen(false);
                      router.push('/login');
                    }}
                    style={styles.menuItem}
                  >
                    <Text style={styles.menuText}>Zaloguj</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setOpen(false);
                      router.push('/register');
                    }}
                    style={styles.menuItem}
                  >
                    <Text style={styles.menuText}>Zarejestruj</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  style={styles.menuItem}
                >
                  <Text style={styles.menuText}>Wyloguj</Text>
                </Pressable>
              )}
            </View>
          </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    zIndex: 1,
    elevation: 10,
    marginLeft: Platform.OS === 'web' ? 16 : 0,
  },
  cursorDefault: {
    cursor: 'default',
  },
  modalOverlay: {
    flex: 1,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    cursor: 'default',
  },
  menu: {
    position: 'absolute',
    top: 55,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 4,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
  },
});