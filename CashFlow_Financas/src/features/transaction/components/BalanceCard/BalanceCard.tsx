import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { ScaledSheet } from '@/utils/responsive';
import { Skeleton } from '@/components/Skeleton/Skeleton'; // Certifique-se de ajustar este import para o seu caminho real

interface BalanceCardProps {
    balance: number;
    percentage: number;
    status: "positive" | "negative" | "neutral";
    isVisible: boolean;
    onToggleVisibility: () => void;
}

export function BalanceCard({
    balance,
    percentage,
    status,
    isVisible,
    onToggleVisibility
}: BalanceCardProps) {
    const { t } = useTranslation();

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const isPositive = status === "positive";
    const isNegative = status === "negative";
    const isNeutral = status === "neutral";

    const badgeIcon = isPositive
        ? "arrow-up"
        : isNegative
            ? "arrow-down"
            : null; 

    const badgeColor = isPositive
        ? colors.income
        : isNegative
            ? colors.expense
            : colors.textSecondary;

    const percentageTextColor = isPositive
        ? colors.income
        : isNegative
            ? colors.expense
            : colors.textSecondary;

    let displayPercentage = percentage.toFixed(1);
    if (isNeutral || displayPercentage === "-0.0" || parseFloat(displayPercentage) === 0) {
        displayPercentage = "0.0";
    }

    return (
        <MotiView 
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.container}
        >
            <View style={styles.headerRow}>
                <Text style={styles.title}>
                    {t("balance.title")}
                </Text>

                <TouchableOpacity
                    onPress={onToggleVisibility}
                    activeOpacity={0.7}
                >
                    <Feather
                        name={isVisible ? "eye" : "eye-off"}
                        size={20}
                        color={colors.textInverse}
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.balanceContainer}>
                <AnimatePresence exitBeforeEnter>
                    {isVisible ? (
                        <MotiView
                            key="visible-balance"
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 150 }}
                        >
                            <Text style={styles.balanceValue}>
                                {formatCurrency(balance)}
                            </Text>
                        </MotiView>
                    ) : (
                        <MotiView
                            key="hidden-balance"
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 150 }}
                        >
                            <Text style={styles.balanceValue}>
                                ••••••
                            </Text>
                        </MotiView>
                    )}
                </AnimatePresence>
            </View>

            <View style={styles.badgeRow}>
                <View style={styles.badge}>
                    <AnimatePresence exitBeforeEnter>
                        {isVisible ? (
                            <MotiView
                                key="visible-percentage"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 150 }}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                {badgeIcon && (
                                    <Feather
                                        name={badgeIcon}
                                        size={12}
                                        color={badgeColor}
                                        style={styles.badgeIcon}
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: percentageTextColor }
                                    ]}
                                >
                                    {displayPercentage}%
                                </Text>
                            </MotiView>
                        ) : (
                            <MotiView
                                key="hidden-percentage"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 150 }}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: colors.textSecondary }
                                    ]}
                                >
                                    ••••
                                </Text>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </View>

                <Text style={styles.comparisonText}>
                    {t("balance.comparedToLastMonth")}
                </Text>
            </View>
        </MotiView>
    );
}

export function BalanceCardSkeleton() {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Skeleton width={100} height={16} borderRadius={4} />
                <Skeleton width={20} height={20} borderRadius={10} />
            </View>

            <View style={styles.balanceContainer}>
                <Skeleton width="65%" height={32} borderRadius={6} />
            </View>

            <View style={styles.badgeRow}>
                <View style={styles.skeletonBadge}>
                    <Skeleton width={38} height={14} borderRadius={4} />
                </View>
                <Skeleton width="55%" height={14} borderRadius={4} />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 20,
        width: "100%",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    eyeIcon: {
        opacity: 0.9,
    },
    balanceContainer: {
        height: 40,
        justifyContent: 'center',
        marginBottom: 16,
    },
    balanceValue: {
        color: colors.primaryLight,
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: colors.primaryLight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginRight: 10,
        minHeight: 24, 
        minWidth: 54,  
        justifyContent: 'center'
    },
    skeletonBadge: {
        backgroundColor: colors.primaryLight,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginRight: 10,
        minHeight: 24, 
        minWidth: 54,  
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeIcon: {
        marginRight: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    comparisonText: {
        color: colors.textInverse,
        fontSize: 12,
        fontWeight: '400'
    },
});