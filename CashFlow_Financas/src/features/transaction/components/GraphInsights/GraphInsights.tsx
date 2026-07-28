import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, scale } from '@/theme/unistyles';
import { useCurrency } from '@/features/settings/hooks/useCurrency';
import type { GraphInsights as GraphInsightsData } from '@/hooks/useReports';

export const GraphInsights = React.memo(function GraphInsights({ data }: { data: GraphInsightsData }) {
    const { t, i18n } = useTranslation();
    const { formatCurrency } = useCurrency();

    const date = useMemo(() => {
        if (!data?.busiestDay) return t('graph.empty');
        try {
            return new Intl.DateTimeFormat(i18n.language.startsWith('en') ? 'en-US' : 'pt-BR').format(
                new Date(`${data.busiestDay}T12:00:00`)
            );
        } catch {
            return t('graph.empty');
        }
    }, [data?.busiestDay, i18n.language, t]);

    const statusTotal = useMemo(() => {
        if (!data?.status) return 0;
        return Object.values(data.status).reduce((total, value) => {
            const num = Number(value);
            return total + (Number.isFinite(num) ? num : 0);
        }, 0);
    }, [data?.status]);

    if (!data) return null;

    const balance = Number.isFinite(data.balance) ? data.balance : 0;
    const balanceChange = Number.isFinite(data.balanceChange) ? data.balanceChange : 0;
    const expenseAverage = Number.isFinite(data.expenseAverage) ? data.expenseAverage : 0;
    const totalExpenses = Number.isFinite(data.totalExpenses) ? data.totalExpenses : 0;
    const recurringBalance = Number.isFinite(data.recurringBalance) ? data.recurringBalance : 0;

    const hasBalance = balance !== 0 || balanceChange !== 0;
    const hasExpenseTrend = expenseAverage !== 0;
    const hasTopCategories = Array.isArray(data.topCategories) && data.topCategories.length > 0 && totalExpenses !== 0;
    const hasStatus = statusTotal > 0;
    const hasCalendar = data.busiestDay !== null && data.busiestDay !== undefined;
    const hasRecurring = recurringBalance !== 0;

    if (!hasBalance && !hasExpenseTrend && !hasTopCategories && !hasStatus && !hasCalendar && !hasRecurring) return null;

    const paidFlex = Number.isFinite(data.status?.paid) && data.status.paid > 0 ? data.status.paid : 0.01;
    const pendingFlex = Number.isFinite(data.status?.pending) && data.status.pending > 0 ? data.status.pending : 0.01;
    const canceledFlex = Number.isFinite(data.status?.canceled) && data.status.canceled > 0 ? data.status.canceled : 0.01;

    return (
        <Box style={{ marginBottom: scale(100) }}>
            <Text variant="titleMedium" fontWeight="700" marginBottom="m">{t('graph.insights.title')}</Text>

            {hasBalance && (
                <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                    <Text variant="caption">{t('graph.insights.balanceEvolution')}</Text>
                    <Text variant="titleMedium" fontWeight="700" marginTop="xs">{formatCurrency(balance)}</Text>
                    <Text variant="caption" color={balanceChange >= 0 ? 'success' : 'danger'} marginTop="xs">
                        {t('graph.insights.periodComparison', {
                            value: formatCurrency(Math.abs(balanceChange)),
                            direction: balanceChange >= 0 ? t('graph.insights.up') : t('graph.insights.down')
                        })}
                    </Text>
                </Box>
            )}

            {hasExpenseTrend && (
                <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                    <Text variant="caption">{t('graph.insights.expenseTrend')}</Text>
                    <Text variant="body" fontWeight="700" marginTop="xs">{formatCurrency(expenseAverage)}</Text>
                </Box>
            )}

            {hasTopCategories && (
                <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                    <Text variant="caption">{t('graph.insights.topCategories')}</Text>
                    {data.topCategories.map((category, index) => {
                        const amount = Number.isFinite(category.amount) ? category.amount : 0;
                        const percentage = totalExpenses > 0 ? Math.min(100, (amount / totalExpenses) * 100) : 0;

                        return (
                            <Box key={category.name || `cat-${index}`} marginTop="s">
                                <Box flexDirection="row" justifyContent="space-between">
                                    <Text variant="body">{category.name}</Text>
                                    <Text variant="body" fontWeight="700">{formatCurrency(amount)}</Text>
                                </Box>
                                <Box height={5} backgroundColor="border" borderRadius="s" marginTop="xs">
                                    <Box height={5} backgroundColor="expense" borderRadius="s" style={{ width: `${percentage}%` }} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {hasStatus && (
                <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                    <Text variant="caption">{t('graph.insights.status')}</Text>
                    <Text variant="body" marginTop="xs">
                        {t('graph.insights.statusSummary', {
                            paid: data.status.paid || 0,
                            pending: data.status.pending || 0,
                            canceled: data.status.canceled || 0,
                            total: statusTotal
                        })}
                    </Text>
                    <Box flexDirection="row" height={8} borderRadius="s" overflow="hidden" marginTop="s">
                        <Box backgroundColor="success" style={{ flex: paidFlex }} />
                        <Box backgroundColor="warning" style={{ flex: pendingFlex }} />
                        <Box backgroundColor="danger" style={{ flex: canceledFlex }} />
                    </Box>
                </Box>
            )}

            {hasCalendar && (
                <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                    <Text variant="caption">{t('graph.insights.financialCalendar')}</Text>
                    <Text variant="body" marginTop="xs">{date}</Text>
                </Box>
            )}

            {hasRecurring && (
                <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border">
                    <Text variant="caption">{t('graph.insights.recurringForecast')}</Text>
                    <Text variant="body" fontWeight="700" marginTop="xs">{formatCurrency(recurringBalance)}</Text>
                </Box>
            )}
        </Box>
    );
});
