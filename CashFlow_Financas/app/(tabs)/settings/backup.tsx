import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { ExportConfigModal, type ExportFormat, type ExportPeriod } from '@/components/ExportConfigModal/ExportConfigModal';
import { useBackup } from '@/hooks/useBackup';
import { Box, Text, type Theme } from '@/theme/unistyles';

interface ExportOptionProps {
    format: ExportFormat;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: keyof Theme['colors'];
    title: string;
    description: string;
    onPress: (format: ExportFormat) => void;
}

function ExportOption({ format, icon, color, title, description, onPress }: ExportOptionProps) {
    const theme = useTheme<Theme>();
    return (
        <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(format)}>
            <Box flexDirection="row" alignItems="center" backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border" marginBottom="m">
                <MaterialCommunityIcons name={icon} size={24} color={theme.colors[color]} />
                <Box flex={1} marginLeft="m">
                    <Text variant="body" fontWeight="600">{title}</Text>
                    <Text variant="caption" color="textSecondary" marginTop="xs">{description}</Text>
                </Box>
                <MaterialCommunityIcons name="download" size={20} color={theme.colors.iconMuted} />
            </Box>
        </TouchableOpacity>
    );
}

export default function BackupScreen() {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const { exportData, importData, isExporting, isImporting } = useBackup();
    const [format, setFormat] = useState<ExportFormat | null>(null);
    const [configOpen, setConfigOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const busy = isExporting || isImporting;

    const openExport = (nextFormat: ExportFormat) => {
        setFormat(nextFormat);
        setConfigOpen(true);
    };

    const confirmExport = ({ type, period }: { type: ExportFormat; period: ExportPeriod }) => {
        setConfigOpen(false);
        void exportData(type, period);
    };

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: theme.spacing.l }}>
                <MotiView from={{ opacity: 0, translateY: theme.spacing.s }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 220 }}>
                    <Box paddingTop="xxl" />
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                        <Text variant="titleMedium" fontWeight="700">{t('backup.title')}</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setAboutOpen(true)} accessibilityLabel={t('backup.about.open')}>
                            <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </Box>
                    <Text variant="caption" marginBottom="xl">{t('backup.subtitle')}</Text>

                    <Text variant="body" fontWeight="700" marginBottom="m">{t('backup.export.title')}</Text>
                    <ExportOption format="json" icon="file-code-outline" color="primary" title={t('backup.export.json.title')} description={t('backup.export.json.description')} onPress={openExport} />
                    <ExportOption format="csv" icon="file-excel-outline" color="success" title={t('backup.export.csv.title')} description={t('backup.export.csv.description')} onPress={openExport} />
                    <ExportOption format="pdf" icon="file-pdf-box" color="danger" title={t('backup.export.pdf.title')} description={t('backup.export.pdf.description')} onPress={openExport} />

                    <Text variant="body" fontWeight="700" marginTop="m" marginBottom="m">{t('backup.import.title')}</Text>
                    <TouchableOpacity activeOpacity={0.75} onPress={() => void importData()} disabled={busy}>
                        <Box flexDirection="row" alignItems="center" backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border">
                            <MaterialCommunityIcons name="upload" size={24} color={theme.colors.iconMuted} />
                            <Box flex={1} marginLeft="m"><Text variant="body" fontWeight="600">{t('backup.import.action')}</Text><Text variant="caption" marginTop="xs">{t('backup.import.description')}</Text></Box>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.iconMuted} />
                        </Box>
                    </TouchableOpacity>
                </MotiView>
            </ScrollView>

            {busy && <Box position="absolute" top={0} right={0} bottom={0} left={0} backgroundColor="modalOverlay" justifyContent="center" alignItems="center"><ActivityIndicator size="large" color={theme.colors.primary} /><Text variant="body" color="textInverse" marginTop="m">{t('backup.processing')}</Text></Box>}
            <ExportConfigModal visible={configOpen} type={format} onClose={() => setConfigOpen(false)} onConfirm={confirmExport} />
            <Modal transparent visible={aboutOpen} animationType="fade" onRequestClose={() => setAboutOpen(false)}>
                <Box flex={1} backgroundColor="modalOverlay" justifyContent="center" padding="l">
                    <Box backgroundColor="card" borderRadius="l" padding="l" borderWidth={1} borderColor="border">
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m"><Text variant="titleMedium" fontWeight="700">{t('backup.about.title')}</Text><TouchableOpacity onPress={() => setAboutOpen(false)} accessibilityLabel={t('common.close')}><MaterialCommunityIcons name="close" size={24} color={theme.colors.icon} /></TouchableOpacity></Box>
                        <Text variant="body" color="textSecondary" marginBottom="m">{t('backup.about.localFirst')}</Text>
                        <Text variant="body" color="textSecondary" marginBottom="m">{t('backup.about.privacy')}</Text>
                        <Text variant="body" color="textSecondary" marginBottom="l">{t('backup.about.noServers')}</Text>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setAboutOpen(false)}><Box backgroundColor="primary" borderRadius="m" padding="m" alignItems="center"><Text color="textInverse" fontWeight="700">{t('common.done')}</Text></Box></TouchableOpacity>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
