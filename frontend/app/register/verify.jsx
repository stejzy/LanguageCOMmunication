import { View, TextInput, Text } from "react-native";
import React, { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { verifyEmail } from "@/api/authService";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function verify() {
  const router = useRouter();
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme);
  const { email } = useLocalSearchParams();

  const [code, setCode] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const allFilled = async () => {
      if (code.every((char) => char !== "")) {
        const fullCode = code.join("");
        try {
          await verifyEmail({ email, code: fullCode });
          setError("");
          Toast.show({
            type: "success",
            text1: "Email verified successfully!",
          });
          router.push("/login");
        } catch (error) {
          console.error("Verification error:", error);
          if (error.response?.status === 400) {
            setError("Invalid verification code. Please try again.");
          } else if (error.response?.status === 409) {
            setError("Email already verified.");
          } else {
            setError("An error occurred. Please try again.");
          }
        }
      }
    };
    allFilled();
  }, [code]);

  const focusNext = (index) => {
    if (index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const onChangeText = (text, index) => {
    console.log(text);
    if (text.length > 1) {
      console.log(text);
      const pasteChars = text.slice(0, 6 - index).split("");
      const newCode = [...code];
      pasteChars.forEach((char, i) => {
        if (/^[a-zA-Z0-9]$/.test(char)) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      const lastIndex = index + pasteChars.length - 1;
      inputsRef.current[lastIndex]?.focus();
      return;
    }

    const char = text.slice(-1);
    if (/^[a-zA-Z0-9]$/.test(char) || text === "") {
      const newCode = [...code];
      newCode[index] = char;
      setCode(newCode);

      if (char) {
        focusNext(index);
      }
    }
  };

  const onKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Enter the verification code sent to your email address.
        </Text>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.innerContainer}>
        {code.map((char, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref)}
            value={char}
            onChangeText={(text) => onChangeText(text, index)}
            onKeyPress={(e) => onKeyPress(e, index)}
            autoCapitalize="characters"
            style={styles.box}
            maxLength={6}
            returnKeyType="done"
            tedxtAlign="center"
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme) => {
  return StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: theme.d_gray,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      color: theme.l_mint,
      textAlign: "center",
    },
    titleContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 25,
      paddingHorizontal: 20,
    },
    innerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    box: {
      textAlignVertical: "center",
      borderWidth: 1,
      borderColor: theme.l_mint,
      borderRadius: 8,
      width: 40,
      height: 50,
      fontSize: 20,
      marginHorizontal: 5,
      color: theme.text,
      textAlign: "center",
    },
    errorText: {
      color: "red",
      marginBottom: 25,
    },
  });
};
