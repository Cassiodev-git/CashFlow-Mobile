import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

import { CURRENCY_CHANGED_EVENT, settingsService } from '@/features/settings/services/settingsService';
import { formatCurrency as formatCurrencyValue, type CurrencyCode } from '@/features/settings/utils/currency';

export function useCurrency() {
    const [currency, setCurrency] = useState<CurrencyCode>('BRL');
    const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);

    useEffect(() => {
        let isMounted = true;

        settingsService
            .getCurrency()
            .then((storedCurrency) => {
                if (isMounted) {
                    setCurrency(storedCurrency);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingCurrency(false);
                }
            });

        const subscription = DeviceEventEmitter.addListener(
            CURRENCY_CHANGED_EVENT,
            (newCurrency: CurrencyCode) => setCurrency(newCurrency)
        );

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, []);

    const saveCurrency = useCallback(async (newCurrency: CurrencyCode): Promise<void> => {
        await settingsService.saveCurrency(newCurrency);
        setCurrency(newCurrency);
    }, []);

    const formatCurrency = useCallback((value: number): string => (
        formatCurrencyValue(value, currency)
    ), [currency]);

    return {
        currency,
        isLoadingCurrency,
        saveCurrency,
        formatCurrency,
    };
}
