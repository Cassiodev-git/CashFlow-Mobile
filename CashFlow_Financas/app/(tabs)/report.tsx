import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Box, Text, scale, Theme } from '@/theme/unistyles';
import { useTheme } from '@shopify/restyle';
import { FinancialSummaryCard } from '@/features/transaction/components/FinancialSummaryCard/FinancialSummaryCard';
import { TransactionHistoryList } from '@/features/transaction/components/TransactionHistoryList/TransactionHistoryList';
import { TransactionFilterBar } from '@/features/transaction/components/TransactionFilterBar/TransactionFilterBar'; 
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionFilter } from '@/hooks/useTransactionFilter'; 

export default function ReportsScreen() {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const { date, data, handleNext, handlePrev, loading: loadingSummary } = useMonthlySummary();
    const { transactions, loading: loadingTransactions } = useTransactions();
    const { filters, updateFilter, resetFilters, filteredTransactions } = useTransactionFilter(transactions);

    const formatCurrency = (value: number) => 
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const monthName = new Date(date.year, date.month - 1).toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const renderHeader = () => (
        <Box style={{ paddingTop: scale(42) }}>
            <Box style={{ marginTop: scale(16), marginBottom: scale(15) }} paddingHorizontal="m">
                <Text variant="titleLarge" color="textPrimary" fontWeight="700">{t("report.title")}</Text>
                <Text variant="body" color="textSecondary" style={{ marginTop: scale(4) }}>{t("report.subtitle")}</Text>
            </Box>

            <Box marginBottom="m" paddingHorizontal="m">
                <FinancialSummaryCard 
                    periodo={`${capitalizedMonth} ${date.year}`}
                    receitas={formatCurrency(data.income)}
                    despesas={formatCurrency(data.expense)}
                    saldo={formatCurrency(data.balance)}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    loading={loadingSummary || loadingTransactions}
                />
            </Box>

            <TransactionFilterBar 
                filters={filters}
                onUpdate={updateFilter}
                onReset={resetFilters}
            />
            
            {loadingTransactions && (
                <Box padding="xl" justifyContent="center" alignItems="center" marginTop="m">
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </Box>
            )}
        </Box>
    );

    return (
        <Box flex={1} backgroundColor="background">
            <TransactionHistoryList 
                transactions={filteredTransactions} 
                ListHeaderComponent={renderHeader()}
            />
        </Box>
    );
}