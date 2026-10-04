import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
const THEME_KEY = '@cashflow:theme';

export const ThemeService = {
    async saveTheme(mode: ThemeMode): Promise<void> {
        await AsyncStorage.setItem(THEME_KEY, mode);
    },

    async getTheme(): Promise<ThemeMode> {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        return (savedTheme as ThemeMode) || 'system'; // Padrão é seguir o sistema
    }
};