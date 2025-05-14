import React, { useContext } from 'react';
import { Pressable, Alert, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '@/context/ThemeContext';
import { LanguageContext } from '@/context/LanguageContext';
import { AuthContext } from '@/context/AuthContext';
import api, { setAccessToken } from '@/api/config';

export default function CameraButton({
                                 onPictureTaken,
                                 size = 25,
                                 color,
                             }) {
    const { theme } = useContext(ThemeContext);
    const { setTextToTranslate } = useContext(LanguageContext);
    const { authState } = useContext(AuthContext);
    const styles = createStyles(theme);

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
            });
            
            console.log('Response data:', response.data);
            setTextToTranslate(response.data);
            console.log('Text set to translate:', response.data);
        } catch (error) {
            console.error('Error in sendImageToBackend:', error);
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
            // For mobile platforms
            Alert.alert(
                'Wybierz źródło',
                'Skąd chcesz wybrać zdjęcie?',
                [
                    {
                        text: 'Aparat',
                        onPress: async () => {
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
                            });
                            console.log('Camera result:', result);
                            if (!result.cancelled) {
                                await sendImageToBackend(result.uri);
                                if (typeof onPictureTaken === 'function') {
                                    onPictureTaken(result.uri);
                                }
                            }
                        }
                    },
                    {
                        text: 'Galeria',
                        onPress: async () => {
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
                            if (!result.cancelled) {
                                await sendImageToBackend(result.uri);
                                if (typeof onPictureTaken === 'function') {
                                    onPictureTaken(result.uri);
                                }
                            }
                        }
                    },
                    {
                        text: 'Anuluj',
                        style: 'cancel'
                    }
                ]
            );
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
            ]}
        >
            <FontAwesome name="camera" size={size} color={color ?? theme.text} />
        </Pressable>
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
    });
}
