import { useTranslation } from 'react-i18next';
import { Box, Text } from '@/theme/unistyles';
import { useCurrency } from '@/features/settings/hooks/useCurrency';
import type { GraphInsights as GraphInsightsData } from '@/hooks/useReports';

export function GraphInsights({ data }: { data: GraphInsightsData }) {
    const { t, i18n } = useTranslation();
    const { formatCurrency } = useCurrency();
    const date = data.busiestDay ? new Intl.DateTimeFormat(i18n.language.startsWith('en') ? 'en-US' : 'pt-BR').format(new Date(`${data.busiestDay}T12:00:00`)) : t('graph.empty');
    const statusTotal = Object.values(data.status).reduce((total, value) => total + value, 0);

    return (
        <Box marginBottom="xxl">
            <Text variant="titleMedium" fontWeight="700" marginBottom="m">{t('graph.insights.title')}</Text>
            <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                <Text variant="caption">{t('graph.insights.balanceEvolution')}</Text><Text variant="titleMedium" fontWeight="700" marginTop="xs">{formatCurrency(data.balance)}</Text>
                <Text variant="caption" color={data.balanceChange >= 0 ? 'success' : 'danger'} marginTop="xs">{t('graph.insights.periodComparison', { value: formatCurrency(Math.abs(data.balanceChange)), direction: data.balanceChange >= 0 ? t('graph.insights.up') : t('graph.insights.down') })}</Text>
            </Box>
            <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m"><Text variant="caption">{t('graph.insights.expenseTrend')}</Text><Text variant="body" fontWeight="700" marginTop="xs">{formatCurrency(data.expenseAverage)}</Text></Box>
            <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m"><Text variant="caption">{t('graph.insights.topCategories')}</Text>{data.topCategories.map((category) => <Box key={category.name} marginTop="s"><Box flexDirection="row" justifyContent="space-between"><Text variant="body">{category.name}</Text><Text variant="body" fontWeight="700">{formatCurrency(category.amount)}</Text></Box><Box height={5} backgroundColor="border" borderRadius="s" marginTop="xs"><Box height={5} backgroundColor="expense" borderRadius="s" style={{ width: `${Math.min(100, data.totalExpenses ? category.amount / data.totalExpenses * 100 : 0)}%` }} /></Box></Box>)}</Box>
            <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m"><Text variant="caption">{t('graph.insights.status')}</Text><Text variant="body" marginTop="xs">{t('graph.insights.statusSummary', { paid: data.status.paid, pending: data.status.pending, canceled: data.status.canceled, total: statusTotal })}</Text><Box flexDirection="row" height={8} borderRadius="s" overflow="hidden" marginTop="s"><Box backgroundColor="success" style={{ flex: data.status.paid || 0.01 }} /><Box backgroundColor="warning" style={{ flex: data.status.pending || 0.01 }} /><Box backgroundColor="danger" style={{ flex: data.status.canceled || 0.01 }} /></Box></Box>
            <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m"><Text variant="caption">{t('graph.insights.financialCalendar')}</Text><Text variant="body" marginTop="xs">{date}</Text></Box>
            <Box backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border"><Text variant="caption">{t('graph.insights.recurringForecast')}</Text><Text variant="body" fontWeight="700" marginTop="xs">{formatCurrency(data.recurringBalance)}</Text></Box>
        </Box>
    );
}
