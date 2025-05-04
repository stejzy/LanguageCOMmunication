import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, ScrollView} from 'react-native';
import { generatePhrase } from '../../api/phraseService';

export default function PhrasesScreen() {
    const [phrase, setPhrase] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedPhrases, setGeneratedPhrases] = useState([]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await generatePhrase(phrase);
            setGeneratedPhrases([response, ...generatedPhrases]);
            setPhrase('');
        } catch (error) {
            console.error('Błąd przy generowaniu frazy', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Wygeneruj Frazę</Text>

            <TextInput
                style={styles.input}
                value={phrase}
                onChangeText={setPhrase}
                placeholder={"Wpisz dowolne słowo"}
            />

            <Button title="Generuj" onPress={handleGenerate} disabled={loading} />
            {loading && <ActivityIndicator size="large" />}
            <ScrollView style={styles.generatedContainer}>
                {generatedPhrases.map((generatedPhrase, index) => (
                    <Text key={index} style={styles.generatedText}>{generatedPhrase.choices[0].message.content}</Text>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
    },
    generatedContainer: {
        marginTop: 20,
    },
    generatedText: {
        fontSize: 16,
        marginBottom: 10,
        padding: 5,
        backgroundColor: '#f0f0f0',
    },
});