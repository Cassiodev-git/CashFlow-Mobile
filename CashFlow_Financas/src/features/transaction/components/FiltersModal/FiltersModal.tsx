import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { Box, Text, type Theme } from '@/theme/unistyles';
import type { FilterOptions } from '@/hooks/useTransactionFilter';

interface CategoryOption { id: string; name: string; }
interface Props {
    visible: boolean;
    onClose: () => void;
    currentFilters: FilterOptions;
    onApply: (filters: Partial<FilterOptions>) => void;
    onReset: () => void;
    categories: CategoryOption[];
}

const isoToDisplay = (value: string | undefined, english: boolean) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return year && month && day ? (english ? `${month}/${day}/${year}` : `${day}/${month}/${year}`) : '';
};

const displayToIso = (value: string, english: boolean) => {
    if (!value) return undefined;
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [first, second, year] = parts;
    const month = english ? first : second;
    const day = english ? second : first;
    if (![day, month, year].every(Boolean)) return null;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const maskDate = (value: string) => value.replace(/\D/g, '').slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2');
const parseAmount = (value: string, english: boolean) => {
    if (!value.trim()) return null;
    const normalized = english ? value.replace(/,/g, '') : value.replace(/\./g, '').replace(',', '.');
    const amount = Number(normalized);
    return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

export function FiltersModal({ visible, onClose, currentFilters, onApply, onReset, categories }: Props) {
    const { t, i18n } = useTranslation();
    const theme = useTheme<Theme>();
    const english = i18n.language.startsWith('en');
    const [tempFilters, setTempFilters] = useState(currentFilters);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [errorKey, setErrorKey] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) return;
        setTempFilters(currentFilters);
        setStartDate(isoToDisplay(currentFilters.startDate, english));
        setEndDate(isoToDisplay(currentFilters.endDate, english));
        setMinAmount(currentFilters.minAmount == null ? '' : String(currentFilters.minAmount));
        setMaxAmount(currentFilters.maxAmount == null ? '' : String(currentFilters.maxAmount));
        setErrorKey(null);
    }, [currentFilters, english, visible]);

    const inputStyle = useMemo(() => ({ padding: theme.spacing.s, backgroundColor: theme.colors.inputBackground, borderRadius: theme.borderRadii.s, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.inputBorder }), [theme]);
    const datePlaceholder = english ? 'MM/DD/YYYY' : 'DD/MM/YYYY';

    const handleApply = () => {
        const normalizedStart = displayToIso(startDate, english);
        const normalizedEnd = displayToIso(endDate, english);
        const normalizedMin = parseAmount(minAmount, english);
        const normalizedMax = parseAmount(maxAmount, english);
        if (normalizedStart === null || normalizedEnd === null) return setErrorKey('invalidFormat');
        if (minAmount.trim() && normalizedMin === null || maxAmount.trim() && normalizedMax === null) return setErrorKey('invalidAmount');
        if (normalizedStart && normalizedEnd && normalizedStart > normalizedEnd) return setErrorKey('invalidDateRange');
        if (normalizedMin != null && normalizedMax != null && normalizedMin > normalizedMax) return setErrorKey('invalidAmountRange');
        onApply({ ...tempFilters, startDate: normalizedStart, endDate: normalizedEnd, minAmount: normalizedMin, maxAmount: normalizedMax });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Box flex={1} backgroundColor="modalOverlay" justifyContent="flex-end">
                <Box backgroundColor="card" borderTopLeftRadius="xl" borderTopRightRadius="xl" padding="l" maxHeight="90%">
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l"><Text variant="titleMedium">{t('report.titleModal')}</Text><TouchableOpacity onPress={onClose}><Feather name="x" size={24} color={theme.colors.icon} /></TouchableOpacity></Box>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text variant="body" fontWeight="600" marginBottom="s">{t('report.status')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.s }}>
                            {(['all', 'paid', 'pending', 'canceled'] as const).map((status) => <TouchableOpacity key={status} onPress={() => setTempFilters({ ...tempFilters, status })}><Box paddingHorizontal="m" paddingVertical="s" borderRadius="s" backgroundColor={tempFilters.status === status ? 'primary' : 'surface'} borderWidth={1} borderColor={tempFilters.status === status ? 'primary' : 'border'}><Text color={tempFilters.status === status ? 'textInverse' : 'textPrimary'}>{t(`report.filters.${status}`)}</Text></Box></TouchableOpacity>)}
                        </ScrollView>
                        <Text variant="body" fontWeight="600" marginTop="l" marginBottom="s">{t('report.filters.period')}</Text>
                        <Box flexDirection="row" gap="s"><Box flex={1}><Text variant="caption" marginBottom="xs">{t('report.filters.startDate')}</Text><TextInput style={inputStyle} placeholder={datePlaceholder} placeholderTextColor={theme.colors.placeholder} keyboardType="numeric" maxLength={10} value={startDate} onChangeText={(value) => setStartDate(maskDate(value))} /></Box><Box flex={1}><Text variant="caption" marginBottom="xs">{t('report.filters.endDate')}</Text><TextInput style={inputStyle} placeholder={datePlaceholder} placeholderTextColor={theme.colors.placeholder} keyboardType="numeric" maxLength={10} value={endDate} onChangeText={(value) => setEndDate(maskDate(value))} /></Box></Box>
                        <Text variant="body" fontWeight="600" marginTop="l" marginBottom="s">{t('report.filters.amountRange')}</Text>
                        <Box flexDirection="row" gap="s"><Box flex={1}><Text variant="caption" marginBottom="xs">{t('report.filters.min')}</Text><TextInput style={inputStyle} placeholder={t('report.filters.amountPlaceholder')} placeholderTextColor={theme.colors.placeholder} keyboardType="decimal-pad" value={minAmount} onChangeText={setMinAmount} /></Box><Box flex={1}><Text variant="caption" marginBottom="xs">{t('report.filters.max')}</Text><TextInput style={inputStyle} placeholder={t('report.filters.amountPlaceholder')} placeholderTextColor={theme.colors.placeholder} keyboardType="decimal-pad" value={maxAmount} onChangeText={setMaxAmount} /></Box></Box>
                        <Text variant="body" fontWeight="600" marginTop="l" marginBottom="s">{t('report.filters.categories')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.s }}><TouchableOpacity onPress={() => setTempFilters({ ...tempFilters, categoryId: 'all' })}><Box paddingHorizontal="m" paddingVertical="s" borderRadius="s" backgroundColor={tempFilters.categoryId === 'all' ? 'primary' : 'surface'} borderWidth={1} borderColor={tempFilters.categoryId === 'all' ? 'primary' : 'border'}><Text color={tempFilters.categoryId === 'all' ? 'textInverse' : 'textPrimary'}>{t('report.filters.all')}</Text></Box></TouchableOpacity>{categories.map((category) => <TouchableOpacity key={category.id} onPress={() => setTempFilters({ ...tempFilters, categoryId: category.id })}><Box paddingHorizontal="m" paddingVertical="s" borderRadius="s" backgroundColor={tempFilters.categoryId === category.id ? 'primary' : 'surface'} borderWidth={1} borderColor={tempFilters.categoryId === category.id ? 'primary' : 'border'}><Text color={tempFilters.categoryId === category.id ? 'textInverse' : 'textPrimary'}>{category.name}</Text></Box></TouchableOpacity>)}</ScrollView>
                        {errorKey && <Text variant="caption" color="danger" marginTop="m">{t(`report.filters.${errorKey}`)}</Text>}
                    </ScrollView>
                    <Box flexDirection="row" gap="m" marginTop="l"><TouchableOpacity onPress={() => { onReset(); onClose(); }} style={{ flex: 1 }}><Box padding="m" borderRadius="s" alignItems="center" borderWidth={1} borderColor="border"><Text color="textSecondary" fontWeight="700">{t('report.filters.reset')}</Text></Box></TouchableOpacity><TouchableOpacity onPress={handleApply} style={{ flex: 1 }}><Box backgroundColor="primary" padding="m" borderRadius="s" alignItems="center"><Text color="textInverse" fontWeight="700">{t('report.filters.apply')}</Text></Box></TouchableOpacity></Box>
                </Box>
            </Box>
        </Modal>
    );
}
