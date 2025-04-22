import { View, Text, TextInput, Button } from 'react-native'
import React, { useContext } from 'react'
import { useState } from 'react'
import { AuthContext } from '@/context/AuthContext';

export default function AuthScreen() {
  const {authState, onLogin, onRegister, onLogout} = useContext(AuthContext);

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      await onLogin(username, password);
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '80%', marginBottom: 20, paddingLeft: 10 }}
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)} 
        />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '80%', marginBottom: 20, paddingLeft: 10 }}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={text => setPassword(text)} 
        />
      <Button title="Login" onPress={handleLogin} />
    </View>
  )
}