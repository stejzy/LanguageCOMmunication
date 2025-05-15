import React, { useContext, useState, useRef, useEffect } from 'react';
import { Pressable, Alert, StyleSheet, Platform, Modal, View, Text, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '@/context/ThemeContext';
import { LanguageContext } from '@/context/LanguageContext';
import { AuthContext } from '@/context/AuthContext';
import api, { setAccessToken } from '@/api/config';
import { Ionicons } from '@expo/vector-icons';

export default function CameraButton({
    onPictureTaken,
    size = 25,
    color,
}) {
    const { theme } = useContext(ThemeContext);
    const { setTextToTranslate } = useContext(LanguageContext);
    const { authState } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;
    const styles = createStyles(theme);

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setModalVisible(false);
        });
    };

    useEffect(() => {
        if (modalVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [modalVisible]);

    const handleCameraPress = async () => {
        closeModal();
        console.log('Camera option selected');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission status:', status);
        if (status !== 'granted') {
            Alert.alert('Brak dostępu', 'Nie przyznano pozwolenia na użycie aparatu.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: false,
            allowsEditing: false,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        console.log('Camera result:', result);
        if (!result.canceled && result.assets && result.assets[0]) {
            const imageUri = result.assets[0].uri;
            console.log('Camera image URI:', imageUri);
            await sendImageToBackend(imageUri);
            if (typeof onPictureTaken === 'function') {
                onPictureTaken(imageUri);
            }
        }
    };

    const handleGalleryPress = async () => {
        closeModal();
        console.log('Gallery option selected');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Gallery permission status:', status);
        if (status !== 'granted') {
            Alert.alert('Brak dostępu', 'Nie przyznano pozwolenia do galerii.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            base64: false,
            allowsEditing: false,
        });
        console.log('Gallery result:', result);
        if (!result.canceled && result.assets && result.assets[0]) {
            const imageUri = result.assets[0].uri;
            console.log('Gallery image URI:', imageUri);
            await sendImageToBackend(imageUri);
            if (typeof onPictureTaken === 'function') {
                onPictureTaken(imageUri);
            }
        }
    };

    const sendImageToBackend = async (imageUri) => {
        try {
            console.log('Starting image processing...');
            console.log('Image URI:', imageUri);

            if (!authState.authenticated) {
                Alert.alert('Error', 'You must be logged in to use this feature');
                return;
            }

            // Create form data
            const formData = new FormData();

            // For web platform
            if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                formData.append('file', blob, 'image.jpg');
            } else {
                // For mobile platforms
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                console.log('Creating mobile FormData with:', {
                    uri: imageUri,
                    name: filename,
                    type: type
                });

                formData.append('file', {
                    uri: imageUri,
                    name: filename,
                    type: type
                });
            }

            console.log('FormData created with image');

            console.log('Sending request to backend...');
            // Send to backend using the api instance
            const response = await api.post('/detectText', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data, headers) => {
                    return data;
                },
            });

            console.log('Response data:', response.data);
            setTextToTranslate(response.data);
            console.log('Text set to translate:', response.data);
        } catch (error) {
            console.error('Error in sendImageToBackend:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            Alert.alert('Error', 'Failed to process image: ' + error.message);
        }
    };

    const handlePress = async () => {
        console.log('Camera button pressed');
        if (Platform.OS === 'web') {
            console.log('Web platform detected');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            const handleFileSelect = async (e) => {
                console.log('File selected');
                const file = e.target.files[0];
                if (file) {
                    console.log('File details:', {
                        name: file.name,
                        type: file.type,
                        size: file.size
                    });
                    const imageUri = URL.createObjectURL(file);
                    console.log('Created object URL:', imageUri);
                    await sendImageToBackend(imageUri);
                    if (typeof onPictureTaken === 'function') {
                        onPictureTaken(imageUri);
                    }
                }
                input.removeEventListener('change', handleFileSelect);
                document.body.removeChild(input);
            };

            input.addEventListener('change', handleFileSelect);
            document.body.appendChild(input);
            setTimeout(() => input.click(), 0);
        } else {
            console.log('Mobile platform detected');
            setModalVisible(true);
        }
    };

    return (
        <>
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                ]}
            >
                <FontAwesome name="camera" size={size} color={color ?? theme.text} />
            </Pressable>

            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <Animated.View 
                    style={[styles.modalOverlay, { opacity: fadeAnim }]}
                >
                    <Pressable 
                        style={styles.modalOverlay}
                        onPress={closeModal}
                    >
                        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Wybierz źródło</Text>
                                <Pressable onPress={closeModal}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </Pressable>
                            </View>
                            <View style={styles.optionsContainer}>
                                <Pressable 
                                    style={styles.optionButton} 
                                    onPress={handleCameraPress}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="camera" size={30} color={theme.text} />
                                    </View>
                                    <Text style={styles.optionText}>Aparat</Text>
                                </Pressable>
                                <Pressable 
                                    style={styles.optionButton} 
                                    onPress={handleGalleryPress}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="images" size={30} color={theme.text} />
                                    </View>
                                    <Text style={styles.optionText}>Galeria</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Modal>
        </>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        button: {
            backgroundColor: theme.torq,
            height: 50,
            width: 50,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 7,
            elevation: 5,
        },
        pressed: {
            opacity: 0.75,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.d_gray,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 40,
            maxHeight: '40%',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.torq + '40',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
        },
        optionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingHorizontal: 20,
            paddingVertical: 10,
        },
        optionButton: {
            alignItems: 'center',
            padding: 10,
        },
        iconContainer: {
            backgroundColor: theme.torq,
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        optionText: {
            color: theme.text,
            fontSize: 16,
            marginTop: 4,
        },
    });
}
