import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export function HelpModal({ isVisible, onClose }: HelpModalProps) {
    const theme = useTheme<Theme>();
    const { t } = useTranslation();

    return (
        <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFillObject}>
                <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
                
                <Box flex={1} justifyContent="center" padding="m">
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ backgroundColor: theme.colors.card, borderRadius: scale(20), padding: scale(24) }}
                    >
                        <Text variant="titleMedium" fontWeight="700" marginBottom="m">
                            {t("recurrence.help.title")}
                        </Text>
                        
                        <Text variant="body" color="textSecondary" marginBottom="m" lineHeight={22}>
                            {t("recurrence.help.description")}
                        </Text>

                        <Text variant="body" fontWeight="600" marginBottom="xs">
                            {t("recurrence.help.limitTitle")}
                        </Text>
                        <Text variant="body" color="textSecondary" marginBottom="xl" lineHeight={22}>
                            {t("recurrence.help.limitDescription")}
                        </Text>

                        <Pressable 
                            onPress={onClose}
                            style={{ 
                                backgroundColor: theme.colors.primary, 
                                padding: scale(14), 
                                borderRadius: scale(12),
                                alignItems: 'center' 
                            }}
                        >
                            <Text color="textInverse" fontWeight="600">{t("common.done")}</Text>
                        </Pressable>
                    </MotiView>
                </Box>
            </BlurView>
        </Modal>
    );
}
