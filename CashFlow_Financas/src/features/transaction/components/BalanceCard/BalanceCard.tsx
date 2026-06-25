import React from 'react';
import {
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useCurrency } from '@/features/settings/hooks/useCurrency';
import { Box, Text, verticalScale } from '@/theme/unistyles';

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
    const { formatCurrency } = useCurrency();

    const isPositive = status === "positive";
    const isNegative = status === "negative";

    const badgeIcon = isPositive
        ? "arrow-up"
        : isNegative
            ? "arrow-down"
            : null; 

    const badgeColor = isPositive
        ? "#289653"
        : isNegative
            ? "#FF4747"
            : "#6F7583";

    const percentageTextColor = isPositive
        ? "#289653"
        : isNegative
            ? "#FF4747"
            : "#A3A8B3";

    let displayPercentage = Math.abs(percentage).toFixed(1);
    if (status === "neutral" || displayPercentage === "-0.0" || parseFloat(displayPercentage) === 0) {
        displayPercentage = "0.0";
    }

    return (
        <MotiView 
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
        >
            <Box
                backgroundColor="primary"
                borderRadius="m"
                padding="m"
                width="100%"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                }}
            >
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom="s"
                >
                    <Text variant="body" fontWeight="500" color="textPrimary">
                        {t("balance.title")}
                    </Text>

                    <TouchableOpacity
                        onPress={onToggleVisibility}
                        activeOpacity={0.7}
                    >
                        <Feather
                            name={isVisible ? "eye" : "eye-off"}
                            size={20}
                            color="#FFFFFF"
                            style={{ opacity: 0.9 }}
                        />
                    </TouchableOpacity>
                </Box>

                <Box
                    height={verticalScale(40)}
                    justifyContent="center"
                    marginBottom="m"
                >
                    <AnimatePresence exitBeforeEnter>
                        {isVisible ? (
                            <MotiView
                                key="visible-balance"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 90 }}
                            >
                                <Text
                                    color="textPrimary"
                                    fontWeight="700"
                                    style={{ fontSize: 30, letterSpacing: -0.5 }}
                                >
                                    {formatCurrency(balance)}
                                </Text>
                            </MotiView>
                        ) : (
                            <MotiView
                                key="hidden-balance"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 90 }}
                            >
                                <Text
                                    color="textMuted"
                                    fontWeight="700"
                                    style={{ fontSize: 30, letterSpacing: -0.5 }}
                                >
                                    ••••••
                                </Text>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </Box>

                <Box flexDirection="row" alignItems="center">
                    <Box
                        backgroundColor="card"
                        flexDirection="row"
                        alignItems="center"
                        paddingVertical="xs"
                        paddingHorizontal="s"
                        borderRadius="s"
                        marginRight="s"
                        minHeight={24}
                        minWidth={54}
                        justifyContent="center"
                    >
                        <AnimatePresence exitBeforeEnter>
                            {isVisible ? (
                                <MotiView
                                    key="visible-percentage"
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 90 }}
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                >
                                    {badgeIcon && (
                                        <Feather
                                            name={badgeIcon}
                                            size={12}
                                            color={badgeColor}
                                            style={{ marginRight: 4 }}
                                        />
                                    )}
                                    <Text
                                        variant="caption"
                                        fontWeight="700"
                                        style={{ color: percentageTextColor }}
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
                                    transition={{ type: 'timing', duration: 90 }}
                                >
                                    <Text
                                        variant="caption"
                                        fontWeight="700"
                                        color="textMuted"
                                    >
                                        ••••
                                    </Text>
                                </MotiView>
                            )}
                        </AnimatePresence>
                    </Box>

                    <Text variant="caption" fontWeight="400" color="textPrimary">
                        {t("balance.comparedToLastMonth")}
                    </Text>
                </Box>
            </Box>
        </MotiView>
    );
}

export function BalanceCardSkeleton(_props: Partial<BalanceCardProps>) {
    return (
        <Box
            backgroundColor="primary"
            borderRadius="m"
            padding="m"
            width="100%"
        >
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="s"
            >
                <Skeleton width={100} height={16} borderRadius={4} />
                <Skeleton width={20} height={20} borderRadius={10} />
            </Box>

            <Box
                height={verticalScale(40)}
                justifyContent="center"
                marginBottom="m"
            >
                <Skeleton width="65%" height={32} borderRadius={6} />
            </Box>

            <Box flexDirection="row" alignItems="center">
                <Box
                    backgroundColor="primaryLight"
                    paddingVertical="xs"
                    paddingHorizontal="s"
                    borderRadius="s"
                    marginRight="s"
                    minHeight={24}
                    minWidth={54}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Skeleton width={38} height={14} borderRadius={4} />
                </Box>
                <Skeleton width="55%" height={14} borderRadius={4} />
            </Box>
        </Box>
    );
}
