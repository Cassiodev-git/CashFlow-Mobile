import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

import i18n from '@/i18n';
import { type CurrencyCode, isCurrencyCode } from '@/features/settings/utils/currency';

const STORAGE_KEYS = {
    currency: '@cashflow:settings:currency',
} as const;

export const CURRENCY_CHANGED_EVENT = 'settings_currency_changed';

function getDefaultCurrencyByLanguage(): CurrencyCode {
    return i18n.language.startsWith('en') ? 'USD' : 'BRL';
}

export const settingsService = {
    async saveCurrency(currency: CurrencyCode): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.currency, currency);
        DeviceEventEmitter.emit(CURRENCY_CHANGED_EVENT, currency);
    },

    async getCurrency(): Promise<CurrencyCode> {
        const storedCurrency = await AsyncStorage.getItem(STORAGE_KEYS.currency);

        if (isCurrencyCode(storedCurrency)) {
            return storedCurrency;
        }

        return getDefaultCurrencyByLanguage();
    },
};
