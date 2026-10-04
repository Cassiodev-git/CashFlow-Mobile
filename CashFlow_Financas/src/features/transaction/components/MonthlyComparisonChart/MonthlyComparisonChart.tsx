import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, scale } from '@/theme/unistyles';
import { useCurrency } from '@/features/settings/hooks/useCurrency';

type Item = { day: string; revenue: number; expense: number };

export const MonthlyComparisonChart = React.memo(function MonthlyComparisonChart({ data }: { data: Item[] }) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    // Memoriza o valor máximo e protege contra NaN/Infinity
    const max = useMemo(() => {
        if (!data || data.length === 0) return 1;
        const allValues = data.flatMap((item) => [
            Number.isFinite(item.revenue) ? item.revenue : 0,
            Number.isFinite(item.expense) ? item.expense : 0
        ]);
        const calculatedMax = Math.max(...allValues, 1);
        return Number.isFinite(calculatedMax) && calculatedMax > 0 ? calculatedMax : 1;
    }, [data]);

    if (!data || data.length < 2) return null;

    return (
        <Box backgroundColor="card" borderRadius="xl" padding="l" marginBottom="s" style={{ elevation: 2 }}>
            <Text variant="body" fontWeight="700">{t('graph.monthlyComparisonTitle')}</Text>
            <Text variant="caption" color="textSecondary" marginTop="xs" marginBottom="m">{t('graph.monthlyComparisonDescription')}</Text>
            {data.map((item, index) => {
                const revenue = Number.isFinite(item.revenue) ? item.revenue : 0;
                const expense = Number.isFinite(item.expense) ? item.expense : 0;

                const revFlex = (revenue / max) || 0.01;
                const expFlex = (expense / max) || 0.01;

                return (
                    <Box key={item.day || `month-${index}`} marginBottom="s">
                        <Box flexDirection="row" justifyContent="space-between">
                            <Text variant="caption" fontWeight="600">{item.day}</Text>
                            <Text variant="caption" color="textSecondary">{formatCurrency(revenue - expense)}</Text>
                        </Box>
                        <Box flexDirection="row" height={scale(10)} marginTop="xs" style={{ gap: scale(4) }}>
                            <Box height={scale(10)} borderRadius="s" backgroundColor="income" style={{ flex: revFlex }} />
                            <Box height={scale(10)} borderRadius="s" backgroundColor="expense" style={{ flex: expFlex }} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
});
