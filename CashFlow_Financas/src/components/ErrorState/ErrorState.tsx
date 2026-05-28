import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
<<<<<<< HEAD
import { logger } from '@/utils/logger';
=======
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707

interface ErrorStateProps {
    message?: string;
    onRetry: () => Promise<void> | void; 
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    const { t } = useTranslation();
    const [isRetrying, setIsRetrying] = useState(false); 

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            await onRetry(); 
        } catch (error) {
<<<<<<< HEAD
            logger.error("Erro ao tentar novamente:", error);
=======
            console.error("Erro ao tentar novamente:", error);
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
        } finally {
            setIsRetrying(false); // Desativa se o erro persistir
        }
    };

    return (
        <View style={styles.outerContainer}>
            <MotiView
                from={{ opacity: 0, scale: 0.95, translateY: 10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 350 }}
                style={styles.card}
            >
                <View style={styles.iconBg}>
                    <Feather name="alert-circle" size={28} color={colors.expense} />
                </View>
                
                <Text style={styles.title}>
                    {t('common.errorTitle')}
                </Text>
                
                <Text style={styles.message}>
                    {message || t('common.errorMessage')}
                </Text>
                
                <TouchableOpacity 
                    style={[styles.button, isRetrying && styles.buttonDisabled]} 
                    onPress={handleRetry} 
                    activeOpacity={0.7}
                    disabled={isRetrying} 
                >
                    {isRetrying ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                    ) : (
                        <>
                            <Feather name="refresh-cw" size={15} color={colors.surface} />
                            <Text style={styles.buttonText}>
                                {t('common.retry')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: "50%",
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 328,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.inputBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${colors.expense}12`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    message: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.income,
        height: 46,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.6, 
    },
    buttonText: {
        color: colors.surface,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
<<<<<<< HEAD
});
=======
});
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
