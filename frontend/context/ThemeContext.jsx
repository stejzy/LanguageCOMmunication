import { createContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import {Colors} from '@/constans/Colors'

export const ThemeContext = createContext({});

export const ThemeProvider = ({children}) => {
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

    const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

    useEffect(() => {
        const subscribtion = Appearance.addChangeListener(({colorScheme}) => setColorScheme(colorScheme));

        return () => subscribtion.remove();
    }, []);

    return (
        <ThemeContext.Provider value = {{
            colorScheme, setColorScheme, theme
        }}>
            {children}
        </ThemeContext.Provider>
    )
} 