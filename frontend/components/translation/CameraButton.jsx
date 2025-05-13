import React, { useContext } from 'react';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '@/context/ThemeContext';

export default function CameraButton({
                                 onPictureTaken,
                                 size = 25,
                                 color,
                             }) {
    const { theme } = useContext(ThemeContext);
    const styles = createStyles(theme);

    const handlePress = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Brak dostępu', 'Nie przyznano pozwolenia na użycie aparatu.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: false,
            allowsEditing: false,
        });
        if (!result.cancelled && typeof onPictureTaken === 'function') {
            onPictureTaken(result);
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
