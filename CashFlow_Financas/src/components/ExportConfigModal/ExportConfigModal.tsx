import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

export type ExportFormat = 'json' | 'csv' | 'pdf';
export type ExportPeriod = 'current_month' | 'three_months' | 'current_year' | 'all';

interface ExportConfigModalProps {
    visible: boolean;
    type: ExportFormat | null;
    onClose: () => void;
    onConfirm: (config: { type: ExportFormat; period: ExportPeriod }) => void;
}

export function ExportConfigModal({ visible, type, onClose, onConfirm }: ExportConfigModalProps) {
    const theme = useTheme<Theme>();
    const { t } = useTranslation();
    const [selectedPeriod, setSelectedPeriod] = useState<ExportPeriod>('current_month');

    useEffect(() => {
        if (type === 'json') {
            setSelectedPeriod('all');
        } else {
            setSelectedPeriod('current_month');
        }
    }, [type, visible]);

    if (!type) return null;

    const isBackupMode = type === 'json';

    const titles: Record<ExportFormat, string> = {
        json: t('backup.config.jsonTitle'),
        csv: t('backup.config.csvTitle'),
        pdf: t('backup.config.pdfTitle'),
    };

    const handleConfirm = () => {
        onConfirm({ type, period: selectedPeriod });
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Box flex={1} backgroundColor="modalOverlay" justifyContent="center" alignItems="center" paddingHorizontal="m">
                <Box
                    backgroundColor="card"
                    borderRadius="xl"
                    padding="l"
                    width="100%"
                    style={{
                        maxWidth: scale(340),
                        shadowColor: theme.colors.textPrimary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                    }}
                >
                    <Text variant="titleMedium" fontWeight="700" color="textPrimary" marginBottom="m" style={{ textAlign: 'center' }}>
                        {titles[type]}
                    </Text>

                    {isBackupMode ? (
                        <Box backgroundColor="background" padding="m" borderRadius="m" borderWidth={1} borderColor="border" marginBottom="l" flexDirection="row" alignItems="flex-start">
                            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.primary} style={{ marginRight: scale(10), marginTop: scale(2) }} />
                            <Text variant="caption" color="textSecondary" style={{ flex: 1, lineHeight: scale(18) }}>
                                {t('backup.config.fullBackupDescription')}
                            </Text>
                        </Box>
                    ) : (
                        <Box marginBottom="l">
                            <Text variant="caption" fontWeight="600" color="textSecondary" marginBottom="s">
                                {t('backup.config.selectPeriod')}
                            </Text>

                            <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedPeriod('current_month')}>
                                <Box flexDirection="row" alignItems="center" padding="m" borderRadius="m" borderWidth={1} borderColor={selectedPeriod === 'current_month' ? 'primary' : 'border'} backgroundColor={selectedPeriod === 'current_month' ? 'primaryLight' : 'surface'} marginBottom="s">
                                    <MaterialCommunityIcons name={selectedPeriod === 'current_month' ? "radiobox-marked" : "radiobox-blank"} size={20} color={selectedPeriod === 'current_month' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: scale(10) }} />
                                    <Text variant="body" fontWeight={selectedPeriod === 'current_month' ? '700' : '500'}>{t('backup.period.currentMonth')}</Text>
                                </Box>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedPeriod('three_months')}>
                                <Box flexDirection="row" alignItems="center" padding="m" borderRadius="m" borderWidth={1} borderColor={selectedPeriod === 'three_months' ? 'primary' : 'border'} backgroundColor={selectedPeriod === 'three_months' ? 'primaryLight' : 'surface'} marginBottom="s">
                                    <MaterialCommunityIcons name={selectedPeriod === 'three_months' ? "radiobox-marked" : "radiobox-blank"} size={20} color={selectedPeriod === 'three_months' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: scale(10) }} />
                                    <Text variant="body" fontWeight={selectedPeriod === 'three_months' ? '700' : '500'}>{t('backup.period.threeMonths')}</Text>
                                </Box>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedPeriod('current_year')}>
                                <Box flexDirection="row" alignItems="center" padding="m" borderRadius="m" borderWidth={1} borderColor={selectedPeriod === 'current_year' ? 'primary' : 'border'} backgroundColor={selectedPeriod === 'current_year' ? 'primaryLight' : 'surface'} marginBottom="s">
                                    <MaterialCommunityIcons name={selectedPeriod === 'current_year' ? "radiobox-marked" : "radiobox-blank"} size={20} color={selectedPeriod === 'current_year' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: scale(10) }} />
                                    <Text variant="body" fontWeight={selectedPeriod === 'current_year' ? '700' : '500'}>{t('backup.period.currentYear')}</Text>
                                </Box>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedPeriod('all')}>
                                <Box flexDirection="row" alignItems="center" padding="m" borderRadius="m" borderWidth={1} borderColor={selectedPeriod === 'all' ? 'primary' : 'border'} backgroundColor={selectedPeriod === 'all' ? 'primaryLight' : 'surface'}>
                                    <MaterialCommunityIcons name={selectedPeriod === 'all' ? "radiobox-marked" : "radiobox-blank"} size={20} color={selectedPeriod === 'all' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: scale(10) }} />
                                    <Text variant="body" fontWeight={selectedPeriod === 'all' ? '700' : '500'}>{t('backup.period.all')}</Text>
                                </Box>
                            </TouchableOpacity>
                        </Box>
                    )}

                    <Box flexDirection="row" style={{ gap: scale(12) }}>
                        <TouchableOpacity style={{ flex: 1, paddingVertical: scale(12), alignItems: 'center' }} onPress={onClose} activeOpacity={0.7}>
                            <Text variant="body" fontWeight="600" color="textSecondary">{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.85} onPress={handleConfirm}>
                            <Box backgroundColor="primary" paddingVertical="s" borderRadius="m" alignItems="center" justifyContent="center" style={{ height: scale(44) }}>
                                <Text variant="body" fontWeight="600" color="textInverse">
                                    {isBackupMode ? t('backup.config.generate') : t('backup.config.export')}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
