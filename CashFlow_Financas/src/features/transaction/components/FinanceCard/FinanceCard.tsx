import React from 'react';
<<<<<<< HEAD
import { View, Text } from 'react-native';
=======
import { View, Text, StyleSheet } from 'react-native';
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { ScaledSheet } from '@/utils/responsive';
import { Skeleton } from '@/components/Skeleton/Skeleton'; // Certifique-se de ajustar este import para o seu caminho real

interface FinanceCardProps {
    isIncome: boolean; 
    value: number;
    isVisible?: boolean;
}

export function FinanceCard({ isIncome, value, isVisible = true }: FinanceCardProps) {
    const { t } = useTranslation();

    const cardConfig = isIncome
        ? {
            label: t("transactions.income"),
            iconName: 'arrow-down' as const,
            iconColor: colors.income,
            iconBgColor: colors.incomeLight || colors.primaryLight,
            valueColor: colors.income,
        }
        : {
            label: t("transactions.expense"),
            iconName: 'arrow-up' as const,
            iconColor: colors.expense,
            iconBgColor: colors.expenseLight || colors.primaryLight,
            valueColor: colors.expense,
        };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    return (
        <MotiView
<<<<<<< HEAD
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 220 }}
=======
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 450, delay: 100 }}
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
            style={styles.cardContainer}
        >

            <View style={[styles.iconContainer, { backgroundColor: cardConfig.iconBgColor }]}>
                <Feather name={cardConfig.iconName} size={18} color={cardConfig.iconColor} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.label}>{cardConfig.label}</Text>
                
                <View style={styles.valueContainer}>
                    <AnimatePresence exitBeforeEnter>
                        {isVisible ? (
                            <MotiView
                                key="visible-value"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
<<<<<<< HEAD
                                transition={{ type: 'timing', duration: 90 }}
=======
                                transition={{ type: 'timing', duration: 150 }}
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
                            >
                                <Text style={[styles.value, { color: cardConfig.valueColor }]}>
                                    {formatCurrency(value)}
                                </Text>
                            </MotiView>
                        ) : (
                            <MotiView
                                key="hidden-value"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
<<<<<<< HEAD
                                transition={{ type: 'timing', duration: 90 }}
=======
                                transition={{ type: 'timing', duration: 150 }}
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
                            >
                                <Text style={[styles.value, { color: colors.textSecondary }]}>
                                    ••••••
                                </Text>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </View>
            </View>

            <Text style={styles.subLabel}>{t("transactions.thisMonth")}</Text>
        </MotiView>
    );
}

<<<<<<< HEAD
export function FinanceCardSkeleton(_props: Partial<Pick<FinanceCardProps, "isIncome">>) {
=======
export function FinanceCardSkeleton() {
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    return (
        <View style={styles.cardContainer}>
            <View style={styles.skeletonIconContainer}>
                <Skeleton width={32} height={32} borderRadius={16} />
            </View>
            <View style={styles.textContainer}>
                <View style={{ marginBottom: 6 }}>
                    <Skeleton width={60} height={14} borderRadius={4} />
                </View>
                <View style={styles.valueContainer}>
                    <Skeleton width="85%" height={20} borderRadius={4} />
                </View>
            </View>

            <Skeleton width={75} height={12} borderRadius={4} />
        </View>
    );
}

const styles = ScaledSheet.create({
    cardContainer: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        width: '47%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: 'space-between',
        minHeight: 130,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    skeletonIconContainer: {
        width: 32,
        height: 32,
        marginBottom: 12,
    },
    textContainer: {
        marginBottom: 4,
    },
    valueContainer: {
        height: 24,
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
        marginBottom: 2,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    subLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
        marginTop: 'auto',
    },
<<<<<<< HEAD
});
=======
});
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
