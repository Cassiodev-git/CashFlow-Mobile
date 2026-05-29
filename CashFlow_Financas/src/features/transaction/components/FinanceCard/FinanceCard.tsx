import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Box, Text, verticalScale } from '@/theme/unistyles';

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
            iconColor: "#289653",
            iconBgColor: "#E4F5EA",
            valueColor: "#289653",
        }
        : {
            label: t("transactions.expense"),
            iconName: 'arrow-up' as const,
            iconColor: "#FF4747",
            iconBgColor: "#FFE3E3",
            valueColor: "#FF4747",
        };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 220 }}
            style={{ width: '47%' }}
        >
            <Box
                backgroundColor="card"
                borderRadius="m"
                padding="m"
                width="100%"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                }}
                justifyContent="space-between"
                minHeight={verticalScale(130)}
            >
                <Box
                    width={32}
                    height={32}
                    borderRadius="xl"
                    justifyContent="center"
                    alignItems="center"
                    marginBottom="s"
                    style={{ backgroundColor: cardConfig.iconBgColor }}
                >
                    <Feather name={cardConfig.iconName} size={18} color={cardConfig.iconColor} />
                </Box>

                <Box marginBottom="xs">
                    <Text variant="body" color="textSecondary" marginBottom="none" style={{ marginBottom: 2 }}>
                        {cardConfig.label}
                    </Text>
                    
                    <Box height={24} justifyContent="center">
                        <AnimatePresence exitBeforeEnter>
                            {isVisible ? (
                                <MotiView
                                    key="visible-value"
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 90 }}
                                >
                                    <Text variant="titleMedium" style={{ color: cardConfig.valueColor, letterSpacing: -0.3 }}>
                                        {formatCurrency(value)}
                                    </Text>
                                </MotiView>
                            ) : (
                                <MotiView
                                    key="hidden-value"
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 90 }}
                                >
                                    <Text variant="titleMedium" color="textSecondary" style={{ letterSpacing: -0.3 }}>
                                        •••••
                                    </Text>
                                </MotiView>
                            )}
                        </AnimatePresence>
                    </Box>
                </Box>

                <Text variant="caption" color="textSecondary" style={{ marginTop: 'auto' }}>
                    {t("transactions.thisMonth")}
                </Text>
            </Box>
        </MotiView>
    );
}

export function FinanceCardSkeleton(_props: Partial<Pick<FinanceCardProps, "isIncome">>) {
    return (
        <Box
            backgroundColor="card"
            borderRadius="m"
            padding="m"
            width="47%"
            justifyContent="space-between"
            minHeight={verticalScale(130)}
        >
            <Box width={32} height={32} marginBottom="s">
                <Skeleton width={32} height={32} borderRadius={16} />
            </Box>
            <Box marginBottom="xs">
                <Box marginBottom="xs" style={{ marginBottom: 6 }}>
                    <Skeleton width={60} height={14} borderRadius={4} />
                </Box>
                <Box height={24} justifyContent="center">
                    <Skeleton width="85%" height={20} borderRadius={4} />
                </Box>
            </Box>

            <Skeleton width={75} height={12} borderRadius={4} />
        </Box>
    );
}
