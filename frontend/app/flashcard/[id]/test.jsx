import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import * as flashcardService from "@/api/flashcardService";
import Toast from "react-native-toast-message";

function shuffle(array) {
  // Fisher-Yates shuffle
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FlashcardTestScreen() {
  const { id } = useLocalSearchParams();
  const { colorScheme, theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const styles = createStyles(theme, colorScheme);

  const [flashcards, setFlashcards] = useState([]);
  const [order, setOrder] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [results, setResults] = useState([]); // true/false
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const folder = await flashcardService.getFlashcardOneFolder(id);
        if (!folder.flashcards || folder.flashcards.length === 0) {
          Toast.show({ type: "error", text1: t("flashcardNoFolders") });
          router.back();
          return;
        }
        setFlashcards(folder.flashcards);
        setOrder(shuffle([...Array(folder.flashcards.length).keys()]));
        setCurrent(0);
        setShowBack(false);
        setResults([]);
        setFinished(false);
      } catch (e) {
        Toast.show({ type: "error", text1: t("flashcardLoadError") });
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, t]);

  const handleReview = useCallback(
    async (isCorrect) => {
      const idx = order[current];
      const card = flashcards[idx];
      setResults((prev) => [...prev, isCorrect]);
      try {
        await flashcardService.reviewFlashcard(card.id, isCorrect);
      } catch (e) {
        Toast.show({ type: "error", text1: t("flashcardReviewError") });
      }
      if (current + 1 < order.length) {
        setCurrent(current + 1);
        setShowBack(false);
      } else {
        setFinished(true);
      }
    },
    [current, order, flashcards]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.torq} />
      </View>
    );
  }

  if (finished) {
    const correct = results.filter(Boolean).length;
    return (
      <View style={styles.centered}>
        <Text style={styles.resultTitle}>
          {t("flashcardTestResult") || "Wynik testu"}
        </Text>
        <Text style={styles.resultScore}>
          {correct} / {results.length}
        </Text>
        <Pressable
          style={styles.returnButton}
          onPress={() => router.replace(`/flashcard/${id}`)}
        >
          <Text style={styles.returnButtonText}>
            {t("flashcardTestReturn") || "Powrót do folderu"}
          </Text>
        </Pressable>
      </View>
    );
  }

  const idx = order[current];
  const card = flashcards[idx];

  return (
    <View style={styles.centered}>
      <Text style={styles.counter}>
        {current + 1} / {order.length}
      </Text>
      <Pressable
        style={[styles.card, showBack ? styles.cardBack : styles.cardFront]}
        onPress={() => setShowBack((prev) => !prev)}
      >
        <Text style={styles.cardText}>
          {showBack ? card.backContent : card.frontContent}
        </Text>
      </Pressable>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.actionButton, styles.wrongButton]}
          onPress={() => handleReview(false)}
        >
          <Text style={styles.actionButtonText}>✗</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.correctButton]}
          onPress={() => handleReview(true)}
        >
          <Text style={styles.actionButtonText}>✓</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme, colorScheme) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.d_gray,
      padding: 16,
    },
    card: {
      minWidth: 260,
      minHeight: 120,
      maxWidth: 400,
      maxHeight: 300,
      backgroundColor: theme.dark_torq,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 30,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    cardFront: {
      borderWidth: 2,
      borderColor: theme.torq,
    },
    cardBack: {
      borderWidth: 2,
      borderColor: theme.mint,
    },
    cardText: {
      color: theme.text,
      fontSize: 22,
      textAlign: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 30,
    },
    actionButton: {
      borderRadius: 40,
      paddingVertical: 18,
      paddingHorizontal: 32,
      marginHorizontal: 16,
      backgroundColor: theme.d_gray,
      borderWidth: 2,
      borderColor: theme.l_mint,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    correctButton: {
      borderColor: theme.torq,
    },
    wrongButton: {
      borderColor: "#FF5A5F",
    },
    actionButtonText: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
    },
    counter: {
      color: theme.text,
      fontSize: 16,
      marginBottom: 8,
    },
    resultTitle: {
      color: theme.torq,
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 18,
    },
    resultScore: {
      color: theme.text,
      fontSize: 22,
      marginBottom: 24,
    },
    returnButton: {
      backgroundColor: theme.torq,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 32,
      marginTop: 10,
    },
    returnButtonText: {
      color: theme.d_gray,
      fontWeight: "bold",
      fontSize: 18,
    },
  });
