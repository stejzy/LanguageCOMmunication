import { View, Text, Pressable, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { useTranslation } from "react-i18next";

export default function Select() {
  const { t } = useTranslation();

  const router = useRouter();
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
  } = useContext(LanguageContext);
  const { languages, type } = useLocalSearchParams();
  const parsedLanguages = JSON.parse(languages || "[]");
  const [filteredLanguages, setFilteredLanguages] = useState(parsedLanguages);
  const [noResults, setNoResults] = useState(false);

  const language = type === "source" ? sourceLanguage : targetLanguage;
  const secondLanguage = type === "source" ? targetLanguage : sourceLanguage;

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { theme } = useContext(ThemeContext);
  const styles = createStyles(theme);

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleSelect = (language) => {
    if (type === "source") {
      setSourceLanguage(language);
    } else {
      setTargetLanguage(language);
    }
    router.back();
  };

  useEffect(() => {
    if (searchText === "") {
      setFilteredLanguages(parsedLanguages);
      setNoResults(false);
    } else {
      const filtered = parsedLanguages.filter((language) =>
        language.languageName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLanguages(filtered);

      setNoResults(filtered.length === 0);
    }
  }, [searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.upperBar}>
        <View style={styles.titleWrapper}>
          <AntDesign
            name="arrowleft"
            size={24}
            color={theme.torq}
            onPress={() => router.back()}
          />
          <Text style={styles.title}>{t("chooseLanguage")}</Text>
        </View>
        {isSearchActive ? (
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Wpisz język..."
              placeholderTextColor={theme.info}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
            <Pressable
              onPress={() => {
                setSearchText("");
                setIsSearchActive(false);
              }}
            >
              <AntDesign
                name="close"
                size={20}
                color={theme.torq}
                style={styles.clearIcon}
              />
            </Pressable>
          </View>
        ) : (
          <FontAwesome
            name="search"
            size={24}
            color={theme.torq}
            onPress={handleSearchPress}
          />
        )}
      </View>

      {/* If no results found, show the message */}
      {noResults && (
        <View style={styles.noResultsView}>
          <AntDesign name="questioncircleo" size={30} color={theme.info} />
          <Text style={styles.noResultsText}>
            {t("notValidChosenLang")} '{searchText}'
          </Text>
        </View>
      )}

      <FlatList
        data={filteredLanguages}
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
                isDisabled && styles.disabledButton,
              ]}
            >
              <Text
                style={[styles.languageText, isDisabled && styles.disabledText]}
              >
                {t(`${item.languageCode}`)}
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
    upperBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    titleWrapper: {
      flexDirection: "row",
      alignItems: "center",
      width: "50%",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.torq,
      marginLeft: 5,
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
      width: "50%",
    },
    searchInput: {
      borderBottomWidth: 2,
      borderColor: theme.torq,
      padding: 5,
      width: "85%",
      fontSize: 16,
      color: theme.textv2,
    },
    languageButton: {
      padding: 15,
      backgroundColor: theme.dark_torq,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    selectedButton: {
      backgroundColor: theme.mint,
    },
    languageText: {
      color: theme.text,
    },
    disabledButton: {
      backgroundColor: theme.disable,
      opacity: 0.7,
    },
    disabledText: {
      color: theme.info,
    },
    noResultsView: {
      marginTop: 20,
      flexDirection: "column",
      alignItems: "center",
    },
    noResultsText: {
      fontSize: 16,
      color: theme.info,
    },
  };
}
