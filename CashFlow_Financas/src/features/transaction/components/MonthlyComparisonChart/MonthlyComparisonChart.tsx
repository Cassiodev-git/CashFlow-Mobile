import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, scale } from '@/theme/unistyles';
import { useCurrency } from '@/features/settings/hooks/useCurrency';

type Item = { day: string; revenue: number; expense: number };

export function MonthlyComparisonChart({ data }: { data: Item[] }) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const max = Math.max(...data.flatMap((item) => [item.revenue, item.expense]), 1);
    if (data.length < 2) return null;
    return (
        <Box backgroundColor="card" borderRadius="xl" padding="l" marginBottom="s" style={{ elevation: 2 }}>
            <Text variant="body" fontWeight="700">{t('graph.monthlyComparisonTitle')}</Text>
            <Text variant="caption" color="textSecondary" marginTop="xs" marginBottom="m">{t('graph.monthlyComparisonDescription')}</Text>
            {data.map((item) => (
                <Box key={item.day} marginBottom="s">
                    <Box flexDirection="row" justifyContent="space-between"><Text variant="caption" fontWeight="600">{item.day}</Text><Text variant="caption" color="textSecondary">{formatCurrency(item.revenue - item.expense)}</Text></Box>
                    <Box flexDirection="row" height={scale(10)} marginTop="xs" style={{ gap: scale(4) }}>
                        <Box height={scale(10)} borderRadius="s" backgroundColor="income" style={{ flex: item.revenue / max || 0.01 }} />
                        <Box height={scale(10)} borderRadius="s" backgroundColor="expense" style={{ flex: item.expense / max || 0.01 }} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
