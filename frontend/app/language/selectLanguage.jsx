import { View, Text, Pressable, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { LanguageContext } from '@/context/LanguageContext';
import { AntDesign } from '@expo/vector-icons';

export default function SelectLanguage() {
  const router = useRouter();
  const { sourceLanguage, targetLanguage, setSourceLanguage, setTargetLanguage } = useContext(LanguageContext);
  const { languages, type } = useLocalSearchParams();
  const parsedLanguages = JSON.parse(languages || '[]');

  const language = type === 'source' ? sourceLanguage : targetLanguage;
  const secondLanguage = type === 'source' ? targetLanguage : sourceLanguage;


  console.log(sourceLanguage);
  console.log(targetLanguage);


  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const handleSelect = (language) => {
    if (type === 'source') {
      setSourceLanguage(language);
    } else {
      setTargetLanguage(language);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz język</Text>
      <FlatList
        data={parsedLanguages}
        keyExtractor={(item) => item.languageCode}
        renderItem={({ item }) => {
          const isSelected = language?.languageCode === item.languageCode;
          const isDisabled = secondLanguage?.languageCode === item.languageCode;
          
          return (
            <Pressable
              onPress={() => !isDisabled && handleSelect(item)}
              disabled={isDisabled}
              style={[
                styles.languageButton,
                isSelected && styles.selectedButton,
                isDisabled && styles.disabledButton
              ]}
            >
              <Text style={[styles.languageText, isDisabled && styles.disabledText]}>
                {item.languageName}
              </Text>
              {isSelected && (
                <AntDesign name="checkcircle" size={16} color={theme.d_gray} />
              )}
              {isDisabled && (
                <AntDesign name="closecircle" size={16} color={theme.d_gray} />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

function createStyles(theme) {
  return {
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.d_gray,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.torq,
    },
    languageButton: {
      padding: 15,
      backgroundColor: theme.torq,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    selectedButton: {
      backgroundColor: theme.mint,
    },
    disabledButton: {
      backgroundColor: theme.disabled || '#ccc', // lub własny kolor
      opacity: 0.5,
    },
    disabledText: {
      color: '#999',
    },
  };
}
