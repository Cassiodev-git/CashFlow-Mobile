import React, { useState, useEffect, useMemo } from 'react';
import { Modal, TouchableOpacity, ScrollView, TextInput, NativeModules, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box, Text, type Theme } from '@/theme/unistyles';
import { FilterOptions } from '@/hooks/useTransactionFilter';
import { Skeleton } from '@/components/Skeleton/Skeleton';

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
    const [tempFilters, setTempFilters] = useState(currentFilters);
    
    const [startDateError, setStartDateError] = useState(false);
    const [endDateError, setEndDateError] = useState(false);

    // Captura o idioma do sistema operacional
    const deviceLocale = useMemo(() => {
        if (Platform.OS === 'android') {
            return NativeModules.I18nManager.localeIdentifier || 'pt-BR';
        } else {
            return NativeModules.SettingsManager.settings.AppleLocale || 
                NativeModules.SettingsManager.settings.AppleLanguages[0] || 'pt-BR';
        }
    }, []);

    const isEnUS = deviceLocale.includes('en');
    const placeholderFormat = isEnUS ? 'MM/DD/AAAA' : 'DD/MM/AAAA';

    useEffect(() => {
        if (visible) {
            setTempFilters(currentFilters);
            setStartDateError(false);
            setEndDateError(false);
        }
    }, [visible, currentFilters]);

    // Aplica a máscara de digitação conforme a ordem cronológica do idioma
    const maskDate = (value: string) => {
        return value
            .replace(/\D/g, '') 
            .replace(/(\d{2})(\d)/, '$1/$2') 
            .replace(/(\d{2})(\d)/, '$1/$2') 
            .replace(/(\d{4})(\d)/, '$1'); 
    };

    // Validação inteligente baseada no idioma do sistema
    const isValidDate = (dateStr: string) => {
        if (!dateStr) return true; 
        if (dateStr.length !== 10) return false;

        const parts = dateStr.split('/').map(Number);
        
        // Se for en-US, inverte a leitura de dia e mês na validação
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
                        <Text variant="titleMedium">Filtros Avançados</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </Box>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Status de Pagamento */}
                        <Box marginBottom="l">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">Status do Pagamento</Text>
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
                                                            {s === 'all' ? 'Todos' : s === 'paid' ? 'Pago' : s === 'pending' ? 'Pendente' : 'Cancelado'}
                                                        </Text>
                                                    </Box>
                                                </TouchableOpacity>
                                            );
                                        })
                                    )}
                                </Box>
                            </ScrollView>
                        </Box>

                        {/* Filtro de Datas Internacionalizado */}
                        <Box marginBottom="l">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">Período</Text>
                            <Box flexDirection="row" style={{ gap: 16 }}>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs" color={startDateError ? "expense" : "textSecondary"}>Início</Text>
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
                                                <Text variant="caption" color="expense" style={{ marginTop: 4, fontSize: 11 }}>Formato inválido</Text>
                                            )}
                                        </>
                                    )}
                                </Box>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs" color={endDateError ? "expense" : "textSecondary"}>Fim</Text>
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
                                                <Text variant="caption" color="expense" style={{ marginTop: 4, fontSize: 11 }}>Formato inválido</Text>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Faixa de Valor */}
                        <Box marginBottom="l">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">Faixa de Valor</Text>
                            <Box flexDirection="row" style={{ gap: 16 }}>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs">Mínimo</Text>
                                    {loading ? (
                                        <Skeleton width="100%" height={45} borderRadius={8} />
                                    ) : (
                                        <TextInput 
                                            style={[baseInputStyle, { borderColor: 'transparent' }]} 
                                            placeholder="R$ 0,00"
                                            placeholderTextColor={theme.colors.textSecondary} 
                                            keyboardType="numeric" 
                                            value={tempFilters.minAmount?.toString() || ''} 
                                            onChangeText={(v) => setTempFilters({...tempFilters, minAmount: v ? Number(v) : undefined})} 
                                        />
                                    )}
                                </Box>
                                <Box flex={1}>
                                    <Text variant="caption" marginBottom="xs">Máximo</Text>
                                    {loading ? (
                                        <Skeleton width="100%" height={45} borderRadius={8} />
                                    ) : (
                                        <TextInput 
                                            style={[baseInputStyle, { borderColor: 'transparent' }]} 
                                            placeholder="R$ 0,00"
                                            placeholderTextColor={theme.colors.textSecondary} 
                                            keyboardType="numeric" 
                                            value={tempFilters.maxAmount?.toString() || ''} 
                                            onChangeText={(v) => setTempFilters({...tempFilters, maxAmount: v ? Number(v) : undefined})} 
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Categorias */}
                        <Box marginBottom="xl">
                            <Text variant="body" style={{ fontWeight: '600' }} marginBottom="s">Categorias</Text>
                            {loading ? (
                                <Skeleton width="100%" height={45} borderRadius={8} />
                            ) : (
                                <TextInput 
                                    style={[baseInputStyle, { borderColor: 'transparent' }]} 
                                    placeholder="Selecione as categorias" 
                                    editable={false} 
                                />
                            )}
                        </Box>
                    </ScrollView>

                    <Box flexDirection="row" style={{ gap: 16 }} marginTop="s">
                        <TouchableOpacity onPress={handleReset} style={{ flex: 1 }}>
                            <Box padding="m" borderRadius="s" alignItems="center" borderWidth={1} borderColor="border">
                                <Text color="textSecondary" style={{ fontWeight: '700' }}>Resetar</Text>
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
                                    Aplicar
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>

                </Box>
            </Box>
        </Modal>
    );
}