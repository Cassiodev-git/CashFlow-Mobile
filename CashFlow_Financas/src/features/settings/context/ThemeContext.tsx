import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as RestyleProvider } from '@shopify/restyle';
import { lightTheme, darkTheme } from '@/theme/unistyles'; // Ajuste o caminho do seu arquivo de tema
import {ThemeMode, ThemeService} from "../services/ThemeService"

type ThemeContextType = {
    themeMode: ThemeMode;
    changeTheme: (mode: ThemeMode) => Promise<void>;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');
    const systemColorScheme = useColorScheme(); // Captura o tema atual do celular ('light' ou 'dark')

    // Carrega a configuração salva ao abrir o app
    useEffect(() => {
        const loadTheme = async () => {
        const saved = await ThemeService.getTheme();
        setThemeMode(saved);
        };
        loadTheme();
    }, []);

    // Função para mudar o tema manualmente
    const changeTheme = async (mode: ThemeMode) => {
        setThemeMode(mode);
        await ThemeService.saveTheme(mode);
    };

    // Lógica crucial: Se for 'system', vê o que o celular está usando. Se não, usa o manual.
    const isDark = themeMode === 'system' 
        ? systemColorScheme === 'dark' 
        : themeMode === 'dark';

    const currentTheme = isDark ? darkTheme : lightTheme;

    return (
    <ThemeContext.Provider value={{ themeMode, changeTheme, isDark }}>
        <RestyleProvider theme={currentTheme}>
        {children}
        </RestyleProvider>
    </ThemeContext.Provider>
);
};


export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useAppTheme deve ser usado dentro de AppThemeProvider');
    return context;
};