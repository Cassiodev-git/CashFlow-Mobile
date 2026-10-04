import i18n from '@/i18n';

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CHF' | 'CAD' | 'CNY' | 'ARS';

export const currencyCodes: readonly CurrencyCode[] = [
    'BRL',
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'AUD',
    'CHF',
    'CAD',
    'CNY',
    'ARS',
] as const;

export const availableCurrencies: { code: CurrencyCode; label: string }[] = currencyCodes.map((code) => ({
    code,
    label: i18n.t(`currencies.${code}`),
}));

const currencyLocaleMap: Record<CurrencyCode, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    AUD: 'en-AU',
    CHF: 'de-CH',
    CAD: 'en-CA',
    CNY: 'zh-CN',
    ARS: 'es-AR',
};

export function isCurrencyCode(value: string | null): value is CurrencyCode {
    return currencyCodes.includes(value as CurrencyCode);
}

export function formatCurrency(value: number, currency: CurrencyCode): string {
    return value.toLocaleString(currencyLocaleMap[currency], {
        style: 'currency',
        currency,
    });
}
