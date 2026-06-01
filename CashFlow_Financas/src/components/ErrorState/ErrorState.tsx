import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { logger } from '@/utils/logger';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

interface ErrorStateProps {
    message?: string;
    onRetry: () => Promise<void> | void; 
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const [isRetrying, setIsRetrying] = useState(false); 

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            await onRetry(); 
        } catch (error) {
            logger.error("Erro ao tentar novamente:", error);
        } finally {
            setIsRetrying(false); // Desativa se o erro persistir
        }
    };

    return (
        <Box
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="l"
            backgroundColor="background"
            style={{ marginTop: '50%' }}
        >
            <MotiView
                from={{ opacity: 0, scale: 0.95, translateY: 10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 350 }}
                style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: scale(20),
                    padding: scale(28),
                    width: '100%',
                    maxWidth: scale(328),
                    alignItems: 'center',
                    borderWidth: scale(1),
                    borderColor: theme.colors.inputBorder,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: scale(4) },
                    shadowOpacity: 0.04,
                    shadowRadius: scale(12),
                    elevation: 2,
                }}
            >
                <Box
                    width={scale(56)}
                    height={scale(56)}
                    borderRadius="xl"
                    backgroundColor="dangerLight"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="m"
                >
                    <Feather name="alert-circle" size={scale(28)} color={theme.colors.expense} />
                </Box>
                
                <Text variant="titleMedium" color="textPrimary" fontWeight="700" marginBottom="s">
                    {t('common.errorTitle')}
                </Text>
                
                <Text
                    variant="body"
                    color="textSecondary"
                    marginBottom="l"
                    style={{ textAlign: 'center', lineHeight: scale(20) }}
                >
                    {message || t('common.errorMessage')}
                </Text>
                
                <TouchableOpacity 
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: scale(8),
                        backgroundColor: theme.colors.income,
                        height: scale(46),
                        paddingHorizontal: scale(24),
                        borderRadius: scale(12),
                        width: '100%',
                        opacity: isRetrying ? 0.6 : 1,
                    }} 
                    onPress={handleRetry} 
                    activeOpacity={0.7}
                    disabled={isRetrying} 
                >
                    {isRetrying ? (
                        <ActivityIndicator size="small" color={theme.colors.surface} />
                    ) : (
                        <>
                            <Feather name="refresh-cw" size={scale(15)} color={theme.colors.surface} />
                            <Text variant="body" color="surface" fontWeight="600">
                                {t('common.retry')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </MotiView>
        </Box>
    );
}
