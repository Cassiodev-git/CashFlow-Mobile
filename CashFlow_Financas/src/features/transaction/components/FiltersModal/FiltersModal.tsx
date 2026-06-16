import React, { useState, useEffect, useMemo } from 'react';
import { Modal, TouchableOpacity, ScrollView, TextInput, NativeModules, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box, Text, type Theme } from '@/theme/unistyles';
import { FilterOptions } from '@/hooks/useTransactionFilter';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useTranslation } from 'react-i18next';

interface Props {
    visible: boolean;
    onClose: () => void;
    currentFilters: FilterOptions;
    onApply: (filters: Partial<FilterOptions>) => void;
    onReset: () => void;
    loading?: boolean;
}

export function FiltersModal({ visible, onClose, currentFilters, onApply, onReset, loading = false }: Props) {
    const theme = useTheme<Theme>();
    const { t } = useTranslation();
    const [tempFilters, setTempFilters] = useState(currentFilters);
    const [startDateError, setStartDateError] = useState(false);
    const [endDateError, setEndDateError] = useState(false);

    const deviceLocale = useMemo(() => {
        if (Platform.OS === 'android') {
            return NativeModules.I18nManager.localeIdentifier || 'pt-BR';
        } else {
            return NativeModules.SettingsManager.settings.AppleLocale || 
                NativeModules.SettingsManager.settings.AppleLanguages[0] || 'pt-BR';
        }
    }, []);

    const isEnUS = deviceLocale.includes('en');
    const placeholderFormat = isEnUS ? 'MM/DD/YYYY' : 'DD/MM/YYYY';

    useEffect(() => {
        if (visible) {
            setTempFilters(currentFilters);
            setStartDateError(false);
            setEndDateError(false);
        }
    }, [visible, currentFilters]);

    const maskDate = (value: string) => {
        return value
            .replace(/\D/g, '') 
            .replace(/(\d{2})(\d)/, '$1/$2') 
            .replace(/(\d{2})(\d)/, '$1/$2') 
            .replace(/(\d{4})(\d)/, '$1'); 
    };

    const isValidDate = (dateStr: string) => {
        if (!dateStr) return true; 
        if (dateStr.length !== 10) return false;

        const parts = dateStr.split('/').map(Number);
        const day = isEnUS ? parts[1] : parts[0];
        const month = isEnUS ? parts[0] : parts[1];
        const year = parts[2];

        if (!day || !month || !year) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1900 || year > 2100) return false;

        const dateCheck = new Date(year, month - 1, day);
        return (
            dateCheck.getFullYear() === year &&
            dateCheck.getMonth() === month - 1 &&
            dateCheck.getDate() === day
        );
    };

    const handleApply = () => {
        const isStartValid = isValidDate(tempFilters.startDate || '');
        const isEndValid = isValidDate(tempFilters.endDate || '');

        setStartDateError(!isStartValid);
        setEndDateError(!isEndValid);

        if (isStartValid && isEndValid) {
            onApply(tempFilters);
            onClose();
        }
    };

    const handleReset = () => {
        setStartDateError(false);
        setEndDateError(false);
        onReset();
        onClose();
    };

    const baseInputStyle = { 
        padding: 12, 
        backgroundColor: theme.colors.inputBackground, 
        borderRadius: 8, 
        color: theme.colors.textPrimary,
        borderWidth: 1,
    };

    const isButtonDisabled = startDateError || endDateError;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Box flex={1} backgroundColor="modalOverlay" justifyContent="flex-end">
                <Box backgroundColor="card" borderTopLeftRadius="xl" borderTopRightRadius="xl" padding="l" maxHeight="90%">
                    
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="l">
                        <Text variant="titleMedium">{t("report.titleModal")}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </Box>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Box marginBottom="l">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">{t("report.status")}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <Box flexDirection="row" style={{ gap: 8 }}>
                                    {loading ? (
                                        <>
                                            <Skeleton width={65} height={36} borderRadius={6} />
                                            <Skeleton width={60} height={36} borderRadius={6} />
                                            <Skeleton width={85} height={36} borderRadius={6} />
                                            <Skeleton width={90} height={36} borderRadius={6} />
                                        </>
                                    ) : (
                                        (['all', 'paid', 'pending', 'canceled'] as const).map((s) => {
                                            const isActive = tempFilters.status === s;
                                            return (
                                                <TouchableOpacity key={s} onPress={() => setTempFilters({ ...tempFilters, status: s })}>
                                                    <Box 
                                                        paddingHorizontal="m" 
                                                        height={36} 
                                                        borderRadius="s" 
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        borderWidth={isActive ? 0 : 1}
                                                        borderColor="border"
                                                        backgroundColor={isActive ? 'primary' : 'card'}
                                                    >
                                                        <Text color={isActive ? 'textInverse' : 'textPrimary'} style={{ fontSize: 14, fontWeight: '500' }}>
                                                            {t(`report.filters.${s}`)}
                                                        </Text>
                                                    </Box>
                                                </TouchableOpacity>
                                            );
                                        })
                                    )}
                                </Box>
                            </ScrollView>
                        </Box>

                        <Box marginBottom="l">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">{t("report.filters.period")}</Text>
                            <Box flexDirection="row" style={{ gap: 16 }}>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs" color={startDateError ? "expense" : "textSecondary"}>{t("report.filters.startDate")}</Text>
                                    {loading ? (
                                        <Skeleton width="100%" height={45} borderRadius={8} />
                                    ) : (
                                        <>
                                            <TextInput 
                                                style={[baseInputStyle, { borderColor: startDateError ? theme.colors.expense : 'transparent' }]} 
                                                placeholder={placeholderFormat}
                                                placeholderTextColor={theme.colors.textSecondary} 
                                                keyboardType="numeric"
                                                maxLength={10}
                                                value={tempFilters.startDate || ''} 
                                                onChangeText={(v) => {
                                                    const masked = maskDate(v);
                                                    setTempFilters({...tempFilters, startDate: masked});
                                                    if (startDateError && (masked.length === 10 || masked.length === 0)) {
                                                        setStartDateError(!isValidDate(masked));
                                                    }
                                                }} 
                                            />
                                            {startDateError && (
                                                <Text variant="caption" color="expense" style={{ marginTop: 4, fontSize: 11 }}>{t("report.filters.invalidFormat")}</Text>
                                            )}
                                        </>
                                    )}
                                </Box>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs" color={endDateError ? "expense" : "textSecondary"}>{t("report.filters.endDate")}</Text>
                                    {loading ? (
                                        <Skeleton width="100%" height={45} borderRadius={8} />
                                    ) : (
                                        <>
                                            <TextInput 
                                                style={[baseInputStyle, { borderColor: endDateError ? theme.colors.expense : 'transparent' }]} 
                                                placeholder={placeholderFormat} 
                                                placeholderTextColor={theme.colors.textSecondary} 
                                                keyboardType="numeric"
                                                maxLength={10}
                                                value={tempFilters.endDate || ''} 
                                                onChangeText={(v) => {
                                                    const masked = maskDate(v);
                                                    setTempFilters({...tempFilters, endDate: masked});
                                                    if (endDateError && (masked.length === 10 || masked.length === 0)) {
                                                        setEndDateError(!isValidDate(masked));
                                                    }
                                                }} 
                                            />
                                            {endDateError && (
                                                <Text variant="caption" color="expense" style={{ marginTop: 4, fontSize: 11 }}>{t("report.filters.invalidFormat")}</Text>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Box marginBottom="l">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">{t("report.filters.amountRange")}</Text>
                            <Box flexDirection="row" style={{ gap: 16 }}>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs">{t("report.filters.min")}</Text>
                                    {loading ? (
                                        <Skeleton width="100%" height={45} borderRadius={8} />
                                    ) : (
                                        <TextInput 
                                            style={[baseInputStyle, { borderColor: 'transparent' }]} 
                                            placeholder={t("report.filters.amountPlaceholder")}
                                            placeholderTextColor={theme.colors.textSecondary} 
                                            keyboardType="numeric" 
                                            value={tempFilters.minAmount?.toString() || ''} 
                                            onChangeText={(v) => setTempFilters({...tempFilters, minAmount: v ? Number(v) : undefined})} 
                                        />
                                    )}
                                </Box>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs">{t("report.filters.max")}</Text>
                                    {loading ? (
                                        <Skeleton width="100%" height={45} borderRadius={8} />
                                    ) : (
                                        <TextInput 
                                            style={[baseInputStyle, { borderColor: 'transparent' }]} 
                                            placeholder={t("report.filters.amountPlaceholder")}
                                            placeholderTextColor={theme.colors.textSecondary} 
                                            keyboardType="numeric" 
                                            value={tempFilters.maxAmount?.toString() || ''} 
                                            onChangeText={(v) => setTempFilters({...tempFilters, maxAmount: v ? Number(v) : undefined})} 
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Box marginBottom="xl">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">{t("report.filters.categories")}</Text>
                            {loading ? (
                                <Skeleton width="100%" height={45} borderRadius={8} />
                            ) : (
                                <TextInput 
                                    style={[baseInputStyle, { borderColor: 'transparent' }]} 
                                    placeholder={t("report.filters.selectCategories")} 
                                    placeholderTextColor={theme.colors.textSecondary}
                                    editable={false} 
                                />
                            )}
                        </Box>
                    </ScrollView>

                    <Box flexDirection="row" style={{ gap: 16 }} marginTop="s">
                        <TouchableOpacity onPress={handleReset} style={{ flex: 1 }}>
                            <Box padding="m" borderRadius="s" alignItems="center" borderWidth={1} borderColor="border">
                                <Text color="textSecondary" style={{ fontWeight: '700' }}>{t("report.filters.reset")}</Text>
                            </Box>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={handleApply} 
                            style={{ flex: 1 }}
                            disabled={isButtonDisabled}
                        >
                            <Box 
                                backgroundColor={isButtonDisabled ? "inputBackground" : "primary"} 
                                padding="m" 
                                borderRadius="s" 
                                alignItems="center"
                                style={{ opacity: isButtonDisabled ? 0.6 : 1 }}
                            >
                                <Text color={isButtonDisabled ? "textSecondary" : "textInverse"} style={{ fontWeight: '700' }}>
                                    {t("report.filters.apply")}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
