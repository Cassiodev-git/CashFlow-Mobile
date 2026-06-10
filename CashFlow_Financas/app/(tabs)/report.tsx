import React, { useCallback, useMemo, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Box, Text } from '@/theme/unistyles';
import { FinancialSummaryCard } from '@/features/transaction/components/FinancialSummaryCard/FinancialSummaryCard';
import { TransactionHistoryList } from '@/features/transaction/components/TransactionHistoryList/TransactionHistoryList';
import { TransactionFilterBar } from '@/features/transaction/components/TransactionFilterBar/TransactionFilterBar'; 
import { TransactionDetailsModal } from '@/features/transaction/components/TransactionDetailsModal/TransactionDetailsModal';
import { TransactionFormModal } from '@/features/transaction/components/TransactionFormModal/TransactionFormModal';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionFilter } from '@/hooks/useTransactionFilter'; 
import { useHomeData } from '@/hooks/useHomeData';
import { Transactions } from '@/features/transaction/types/Transactions';
import { Skeleton } from '@/components/Skeleton/Skeleton';

export default function ReportsScreen() {
    const { t, i18n } = useTranslation();
    const { date, data, handleNext, handlePrev, loading: loadingSummary } = useMonthlySummary();
    const { transactions, loading: loadingTransactions, deleteMultipleTransactions } = useTransactions();
    const { filters, updateFilter, resetFilters, filteredTransactions } = useTransactionFilter(transactions);
    const { deleteTransaction } = useHomeData();

    const [selectedTransaction, setSelectedTransaction] = useState<Transactions | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transactions | null>(null);
    const isReportLoading = loadingSummary || loadingTransactions;

    const sanitizedTransactions = useMemo<Transactions[]>(() => {
        const now = new Date().toISOString();

        return filteredTransactions.map(tx => ({
            ...tx,
            date: tx.date ?? now,
            category_id: tx.category_id ?? null,
            description: tx.description ?? null,
            status: tx.status ?? 'pending',
            created_at: tx.created_at ?? now,
            updated_at: tx.updated_at ?? now,
        })) as Transactions[];
    }, [filteredTransactions]);

    const formatCurrency = (value: number) => 
        value.toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' });

    const monthName = new Date(date.year, date.month - 1).toLocaleString(i18n.language, { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const handleEditTransaction = useCallback((transaction: Transactions) => {
        setTransactionToEdit(transaction);
    }, []);

    const handleDeleteTransaction = useCallback(async (transaction: Transactions) => {
        await deleteTransaction(transaction.id);
        setSelectedTransaction(null);
        DeviceEventEmitter.emit("transaction_mutated");
    }, [deleteTransaction]);

    const handleDeleteMultiple = useCallback(async (ids: string[]) => {
        await deleteMultipleTransactions(ids);
        setSelectedTransaction(null);
    }, [deleteMultipleTransactions]);

    const renderHeader = () => (
        <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
        >
        <Box paddingTop="xxl">
            <Box marginTop="m" marginBottom="m" paddingHorizontal="m">
                {isReportLoading ? (
                    <Box style={{ gap: 8 }}>
                        <Skeleton width={120} height={28} borderRadius={6} />
                        <Skeleton width={180} height={18} borderRadius={6} />
                    </Box>
                ) : (
                    <>
                        <Text variant="titleLarge" color="textPrimary" fontWeight="700">{t("report.title")}</Text>
                        <Text variant="body" color="textSecondary" marginTop="xs">{t("report.subtitle")}</Text>
                    </>
                )}
            </Box>

            <Box marginBottom="m" paddingHorizontal="m">
                <FinancialSummaryCard 
                    periodo={`${capitalizedMonth} ${date.year}`}
                    receitas={formatCurrency(data.income)}
                    despesas={formatCurrency(data.expense)}
                    saldo={formatCurrency(data.balance)}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    loading={isReportLoading}
                />
            </Box>

            <TransactionFilterBar 
                filters={filters}
                onUpdate={updateFilter}
                onReset={resetFilters}
                loading={loadingTransactions}
            />
        </Box>
        </MotiView>
    );

    return (
        <Box flex={1} backgroundColor="background">
            <TransactionHistoryList 
                transactions={sanitizedTransactions} 
                ListHeaderComponent={renderHeader()}
                loading={loadingTransactions}
                onTransactionPress={setSelectedTransaction}
                onDeleteMultiple={handleDeleteMultiple}
            />

            <TransactionDetailsModal
                isOpen={selectedTransaction !== null}
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                onDelete={handleDeleteTransaction}
                onEdit={handleEditTransaction}
            />

            <TransactionFormModal
                isOpen={transactionToEdit !== null}
                transaction={transactionToEdit}
                onClose={() => {
                    setTransactionToEdit(null);
                    setSelectedTransaction(null);
                }}
            />
        </Box>
    );
}
