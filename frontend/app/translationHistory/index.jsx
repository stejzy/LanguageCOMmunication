import React, { useContext, useRef, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet, Pressable, SectionList, Platform } from "react-native";
import { TranslationHistoryContext } from "@/context/TranslationHistoryContext";
import { ThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

function AnimatedListItem({ item, onDelete, onDoubleTap, theme, styles }) {
  const height = useSharedValue(70);
  const opacity = useSharedValue(1);

  const lastTap = useRef(null);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: "hidden",
    marginBottom: height.value === 0 ? 0 : 15,
  }));

  const handleDelete = () => {
    height.value = withTiming(0, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onDelete)(item.id);
      }
    });
  };

  const handlePress = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      onDoubleTap(item);
    }
    lastTap.current = now;
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable style={styles.flatListElement} onPress={handlePress}>
        <View style={{ width: "90%"}}>
          <Text
            style={styles.flatListElementText}
            numberOfLines={1}
            ellipsizeMode="tail"
            selectable={false} 
          >
            {item.sourceText.replace(/^"+|"+$/g, "")}
          </Text>

          <Text
            style={styles.flatListElementText}
            numberOfLines={1}
            ellipsizeMode="tail"
            selectable={false} 
          >
            {item.translatedText?.replace(/^„+|”+$/g, "") ?? ""}
          </Text>
        </View>

        <Pressable style={styles.bin} onPress={handleDelete}>
          <Entypo name="trash" size={24} color={theme.text} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function TranslationHistoryScreen() {
  const { t } = useTranslation();

  const router = useRouter();
  const navigation = useNavigation();

  const { theme } = useContext(ThemeContext);
  const { history, deleteFunc } = useContext(TranslationHistoryContext);

  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString("pl-PL");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  console.log(groupedByDate)

  function parsePLDate(dateStr) {
    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}`);
  }

 const sections = Object.keys(groupedByDate)
  .sort((a, b) => parsePLDate(b) - parsePLDate(a))
  .map((date) => ({
    title: date,
    data: groupedByDate[date].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  }));

  console.log(sections)

  const styles = createStyles(theme);

  const handleDoubleTap = (item) => {
    router.push({
      pathname: "/translationHistoryDetails",
      params: { translation: JSON.stringify(item) },
    });
  };


  //  const sectionListRef = useRef(null);

  //   useEffect(() => {
  //     if (sections.length > 0 && sectionListRef.current) {
  //       const lastSectionIndex = sections.length - 1;
  //       const lastItemIndex = sections[lastSectionIndex].data.length - 1;

  //       setTimeout(() => {
  //         sectionListRef?.current?.scrollToLocation({
  //         sectionIndex: lastSectionIndex,
  //         itemIndex: lastItemIndex,
  //         animated: false,
  //         viewPosition: 1,
  //         viewOffset: -500,
  //         });
  //       }, 100);
  //     }
  //   }, [sections]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.arrow} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("history")}</Text>
        <Pressable style={styles.home} onPress={() => navigation.pop(2)}>
          <Entypo name="home" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.flatList}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AnimatedListItem
              item={item}
              onDelete={deleteFunc}
              onDoubleTap={handleDoubleTap}
              theme={theme}
              styles={styles}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
        />
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.d_gray,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      paddingTop: 19,
      paddingBottom: 19,
      backgroundColor: theme.dark_torq,
    },
    arrow: {
      position: "absolute",
      left: 15,
      top: 19
    },
    home: {
      position: "absolute",
      right: 15,
      top: 19
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    flatList: {
      margin: 15,
      flex: 1,
    },
    flatListElement: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.dark_torq,
      borderRadius: 50,
      padding: 10,
      paddingLeft: 30,
      paddingRight: 30,
      height: 70,
    },
    flatListElementText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 5,
      width: "100%",
    },
    bin: {
      padding: 10,
      borderRadius: 50,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10,
      marginBottom: 5,
    },
  });
}
