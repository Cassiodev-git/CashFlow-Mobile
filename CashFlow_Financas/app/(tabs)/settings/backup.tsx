import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { ExportConfigModal, type ExportFormat, type ExportPeriod } from '@/components/ExportConfigModal/ExportConfigModal';
import { useBackup } from '@/hooks/useBackup';

export default function BackupScreen() {
    const theme = useTheme<Theme>();
    const { exportData, importData, isExporting, isImporting } = useBackup();
    const [modalFormat, setModalFormat] = useState<ExportFormat | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    const handleOpenExportConfig = (format: ExportFormat) => {
        setModalFormat(format);
        setIsConfigModalOpen(true);
    };

    const handleExecuteExport = ({ type, period }: { type: ExportFormat; period: ExportPeriod }) => {
        setIsConfigModalOpen(false);
        exportData(type, period);
    };

    return (
        <Box flex={1} backgroundColor="background">
            {(isExporting || isImporting) && (
                <Box position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="modalOverlay" justifyContent="center" alignItems="center" zIndex={50}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text variant="body" marginTop="m" fontWeight="600">Processando...</Text>
                </Box>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: scale(24) }}>
                <MotiView 
                    from={{ opacity: 0, translateY: 6 }} 
                    animate={{ opacity: 1, translateY: 0 }} 
                    transition={{ type: 'timing', duration: 220 }}
                >
                    <Box paddingTop="xxl" />

                    <Text variant="body" fontWeight="700" color="textPrimary" marginBottom="m">
                        Exportar Dados
                    </Text>

                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleOpenExportConfig('json')} disabled={isExporting}>
                        <Box 
                            flexDirection="row" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            backgroundColor="surface" 
                            padding="m" 
                            borderRadius="l" 
                            borderWidth={1} 
                            borderColor="border" 
                            marginBottom="m"
                        >
                            <Box flexDirection="row" alignItems="center" flex={1} marginRight="m">
                                <Box marginRight="m">
                                    <MaterialCommunityIcons name="file-code-outline" size={24} color={theme.colors.primary} />
                                </Box>
                                <Box flex={1}>
                                    <Text variant="body" fontWeight="600">Formato JSON (.json)</Text>
                                    <Text variant="caption" color="textSecondary">Ideal para fazer backup completo e restaurar o app</Text>
                                </Box>
                            </Box>
                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.textSecondary} />
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleOpenExportConfig('csv')} disabled={isExporting}>
                        <Box 
                            flexDirection="row" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            backgroundColor="surface" 
                            padding="m" 
                            borderRadius="l" 
                            borderWidth={1} 
                            borderColor="border" 
                            marginBottom="m"
                        >
                            <Box flexDirection="row" alignItems="center" flex={1} marginRight="m">
                                <Box marginRight="m">
                                    <MaterialCommunityIcons name="file-excel-outline" size={24} color="#107C41" />
                                </Box>
                                <Box flex={1}>
                                    <Text variant="body" fontWeight="600">Planilha Excel (.csv)</Text>
                                    <Text variant="caption" color="textSecondary">Otimizado para abrir no Excel, Sheets ou Numbers</Text>
                                </Box>
                            </Box>
                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.textSecondary} />
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleOpenExportConfig('pdf')} disabled={isExporting}>
                        <Box 
                            flexDirection="row" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            backgroundColor="surface" 
                            padding="m" 
                            borderRadius="l" 
                            borderWidth={1} 
                            borderColor="border" 
                            marginBottom="xl"
                        >
                            <Box flexDirection="row" alignItems="center" flex={1} marginRight="m">
                                <Box marginRight="m">
                                    <MaterialCommunityIcons name="file-pdf-box" size={24} color={theme.colors.danger} />
                                </Box>
                                <Box flex={1}>
                                    <Text variant="body" fontWeight="600">Relatório em PDF (.pdf)</Text>
                                    <Text variant="caption" color="textSecondary">Ideal para impressão, relatórios visuais ou envio</Text>
                                </Box>
                            </Box>
                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.textSecondary} />
                        </Box>
                    </TouchableOpacity>

                    <Text variant="body" fontWeight="700" color="textPrimary" marginBottom="m">
                        Restaurar Backup
                    </Text>

                    <TouchableOpacity activeOpacity={0.7} onPress={importData} disabled={isImporting}>
                        <Box 
                            flexDirection="row" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            backgroundColor="surface" 
                            padding="m" 
                            borderRadius="l" 
                            borderWidth={1} 
                            borderColor="border"
                        >
                            <Box flexDirection="row" alignItems="center" flex={1} marginRight="m">
                                <Box marginRight="m">
                                    <MaterialCommunityIcons name="upload" size={24} color={theme.colors.textSecondary} />
                                </Box>
                                <Box flex={1}>
                                    <Text variant="body" fontWeight="600">Importar arquivo</Text>
                                    <Text variant="caption" color="textSecondary">Selecione um arquivo JSON ou CSV para restaurar seus dados</Text>
                                </Box>
                            </Box>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                        </Box>
                    </TouchableOpacity>

                </MotiView>
            </ScrollView>

            <ExportConfigModal 
                visible={isConfigModalOpen}
                type={modalFormat}
                onClose={() => setIsConfigModalOpen(false)}
                onConfirm={handleExecuteExport}
            />
        </Box>
    );
}