import { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { Colors } from "@/constans/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [colorScheme, _setColorScheme] = useState(Appearance.getColorScheme());
  const [isLoading, setIsLoading] = useState(true);

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const setColorScheme = async (scheme) => {
    _setColorScheme(scheme);
    await AsyncStorage.setItem("theme", scheme);
  };

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        _setColorScheme(savedTheme);
      } else {
        _setColorScheme(Appearance.getColorScheme());
      }
      setIsLoading(false);
    })();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem("theme").then((saved) => {
        if (!saved) _setColorScheme(colorScheme);
      });
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider
      value={{ colorScheme, setColorScheme, theme, isLoading }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
