import React from 'react';
import { Platform } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { useCurrency } from '@/features/settings/hooks/useCurrency';

type Item = { day: string; balance: number };

export function BalanceEvolutionChart({ data }: { data: Item[] }) {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const { formatCurrency } = useCurrency();
    const font = useFont(Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' }), 10);
    if (data.length < 2) return null;
    return (
        <Box backgroundColor="card" borderRadius="xl" padding="l" marginBottom="s" style={{ elevation: 2 }}>
            <Text variant="body" fontWeight="700">{t('graph.balanceEvolutionTitle')}</Text>
            <Text variant="caption" color="textSecondary" marginTop="xs" marginBottom="m">{t('graph.balanceEvolutionDescription')}</Text>
            <Box height={scale(210)}>
                <CartesianChart data={data} xKey="day" yKeys={['balance']} padding={{ left: 4, right: 12, top: 12, bottom: 8 }} axisOptions={{ font: font || undefined, lineColor: theme.colors.divider, labelColor: theme.colors.textSecondary, formatYLabel: (value) => formatCurrency(Math.round(value)) }}>
                    {({ points }) => <Line points={points.balance} color={theme.colors.primary} strokeWidth={3} curveType="natural" />}
                </CartesianChart>
            </Box>
        </Box>
    );
}
