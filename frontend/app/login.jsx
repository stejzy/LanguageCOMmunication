import { View, Text, TextInput, Button } from 'react-native'
import React, { useContext } from 'react'
import { useState } from 'react'
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AuthScreen({ navigation }) {
  const {onLogin} = useContext(AuthContext);
  const router = useRouter();

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      await onLogin(username, password);
      if (router.canGoBack()) {
        router.back()
      } else {
        router.push('/')
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Błędny login lub hasło')
      } else {
        setError('Wystąpił błąd. Spróbuj ponownie później.')
        console.error('Login error:', error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)}
        autoCapitalize="none"
        />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={text => setPassword(text)} 
        autoCapitalize="none"
        />
      <Button title="Login" onPress={handleLogin} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 20,
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
})
