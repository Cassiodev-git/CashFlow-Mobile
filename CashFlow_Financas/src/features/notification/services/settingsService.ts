import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    GENERAL: '@cashflow_notifications_enabled',
    REMINDERS: '@cashflow_reminders_enabled',
    REPORTS: '@cashflow_reports_enabled',
};

export const SettingsService = {
    async areRemindersEnabled(): Promise<boolean> {
        const [general, reminders] = await Promise.all([
            AsyncStorage.getItem(KEYS.GENERAL),
            AsyncStorage.getItem(KEYS.REMINDERS)
        ]);
        return general === 'true' && reminders === 'true';
    },

    async areReportsEnabled(): Promise<boolean> {
        const [general, reports] = await Promise.all([
            AsyncStorage.getItem(KEYS.GENERAL),
            AsyncStorage.getItem(KEYS.REPORTS)
        ]);
        return general === 'true' && reports === 'true';
    },
    
    async setConfig(key: keyof typeof KEYS, value: boolean) {
        await AsyncStorage.setItem(KEYS[key], value.toString());
    }
};