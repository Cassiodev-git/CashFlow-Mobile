import { useState, useCallback, useEffect } from "react";
import { DeviceEventEmitter, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

// Services
import AppUserService from "@/services/AppUserService";
import AppTransactionSummaryService from "@/services/AppTransactionSummaryService";
import AppTransactionsService from "@/services/AppTransactionsService";

// Types
import { User } from "@/features/user/types/User";
import { Transactions } from "@/features/transaction/types/Transactions";
import type {
    MonthlyExpensePercentage,
    TransactionSummary,
} from "@/features/transaction/services/TransactionStatsService";

function sanitizeTransactionDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    
    if (dateStr.length === 10) {
        return `${dateStr}T12:00:00.000`;
    }
    if (dateStr.includes('T00:00:00')) {
        return dateStr.replace('T00:00:00', 'T12:00:00');
    }
    
    return dateStr;
}

export function useHomeData() {
    const { t } = useTranslation();
    
    const [user, setUser] = useState<User | null>(null);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyExpensePercentage | null>(null);
    const [transactions, setTransactions] = useState<Transactions[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const fetchUpdatedData = useCallback(async () => {
        try {
            setHasError(false);
            const userData = await AppUserService.findFirstUser();
            if (!userData) return;

            setUser(userData);

            const [transactionsList, summaryData, percentageData] = await Promise.all([
                AppTransactionsService.listTransactions(),
                AppTransactionSummaryService.getSummary(),
                AppTransactionSummaryService.getMonthlyExpensePercentage(),
            ]);
            const sanitizedTransactions = transactionsList.map(transaction => ({
                ...transaction,
                date: sanitizeTransactionDate(transaction.date)
            }));

            setSummary(summaryData);
            setMonthlyStats(percentageData);
            setTransactions(sanitizedTransactions);
            //throw new Error("Algo deu errado")
        } catch (error) {
            console.error("Erro ao sincronizar dados da Home:", error);
            setHasError(true);
        }
    }, []);

    const handleDeleteTransaction = useCallback(async (id: string) => {
        try {
            await AppTransactionsService.deleteTransaction(id);
            
            setTransactions(prev => prev.filter(item => item.id !== id));

            const [summaryData, percentageData] = await Promise.all([
                AppTransactionSummaryService.getSummary(),
                AppTransactionSummaryService.getMonthlyExpensePercentage(),
            ]);
            setSummary(summaryData);
            setMonthlyStats(percentageData);
        } catch (error) {
            console.error("Erro ao deletar transação:", error);
            Alert.alert(t("common.error"), t("transactions.errorDelete"));
        }
    }, [t]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener("transaction_mutated", () => {
            fetchUpdatedData(); 
        });

        return () => {
            subscription.remove();
        };
    }, [fetchUpdatedData]);

    useFocusEffect(
        useCallback(() => {
            async function initHome() {
                if (transactions.length === 0) {
                    setLoading(true);
                }
                await fetchUpdatedData();
                setLoading(false);
            }

            initHome();
        }, [transactions.length, fetchUpdatedData])
    );

    return {
        user,
        summary,
        monthlyStats,
        transactions,
        loading,
        hasError,
        refetch: fetchUpdatedData,
        deleteTransaction: handleDeleteTransaction
    };
}