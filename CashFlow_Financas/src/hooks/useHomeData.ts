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
import { logger } from "@/utils/logger";

<<<<<<< HEAD
const TRANSACTIONS_PAGE_SIZE = 10;

=======
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
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
<<<<<<< HEAD
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [loadingMonthlyStats, setLoadingMonthlyStats] = useState(true);
    const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
    const [hasError, setHasError] = useState(false);

    const sanitizeTransactions = useCallback((items: Transactions[]) => (
        items.map(transaction => ({
            ...transaction,
            date: sanitizeTransactionDate(transaction.date)
        }))
    ), []);

    const loadTransactionsPage = useCallback(async (offset: number) => {
        const transactionsList = await AppTransactionsService.listTransactions({
            limit: TRANSACTIONS_PAGE_SIZE,
            offset,
        });

        const sanitizedTransactions = sanitizeTransactions(transactionsList);
        setHasMoreTransactions(transactionsList.length === TRANSACTIONS_PAGE_SIZE);

        if (offset === 0) {
            setTransactions(sanitizedTransactions);
            return;
        }

        setTransactions(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const nextItems = sanitizedTransactions.filter(item => !existingIds.has(item.id));
            return [...prev, ...nextItems];
        });
    }, [sanitizeTransactions]);

    const fetchUpdatedData = useCallback(async () => {
        setHasError(false);

        setLoadingUser(true);
        setLoadingSummary(true);
        setLoadingTransactions(true);
        setLoadingMonthlyStats(true);

        const loadUser = async () => {
            try {
                const userData = await AppUserService.findFirstUser();
                setUser(userData);
            } catch (error) {
                logger.error("Error loading Home user:", error);
                setHasError(true);
            } finally {
                setLoadingUser(false);
            }
        };

        const loadSummary = async () => {
            try {
                const summaryData = await AppTransactionSummaryService.getSummary();
                setSummary(summaryData);
            } catch (error) {
                logger.error("Error loading Home summary:", error);
                setHasError(true);
            } finally {
                setLoadingSummary(false);
            }
        };

        const loadMonthlyStats = async () => {
            try {
                const percentageData = await AppTransactionSummaryService.getMonthlyExpensePercentage();
                setMonthlyStats(percentageData);
            } catch (error) {
                logger.error("Error loading Home monthly stats:", error);
                setHasError(true);
            } finally {
                setLoadingMonthlyStats(false);
            }
        };

        const loadInitialTransactions = async () => {
            try {
                await loadTransactionsPage(0);
            } catch (error) {
                logger.error("Error loading Home transactions:", error);
                setHasError(true);
            } finally {
                setLoadingTransactions(false);
            }
        };

        await Promise.all([
            loadUser(),
            loadSummary(),
            loadMonthlyStats(),
            loadInitialTransactions(),
        ]);
    }, [loadTransactionsPage]);

    const loadMoreTransactions = useCallback(async () => {
        if (loadingMoreTransactions || loadingTransactions || !hasMoreTransactions) return;

        try {
            setLoadingMoreTransactions(true);
            await loadTransactionsPage(transactions.length);
        } catch (error) {
            logger.error("Error loading more Home transactions:", error);
            setHasError(true);
        } finally {
            setLoadingMoreTransactions(false);
        }
    }, [
        hasMoreTransactions,
        loadTransactionsPage,
        loadingMoreTransactions,
        loadingTransactions,
        transactions.length,
    ]);
=======
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
            //await new Promise(resolve => setTimeout(resolve, 2500))
        } catch (error) {
            logger.error("Error synchronizing Home data:", error);
            setHasError(true);
        }
    }, []);
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707

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
<<<<<<< HEAD
            logger.error("Erro ao deletar transação:", error);
=======
            console.error("Erro ao deletar transação:", error);
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
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
<<<<<<< HEAD
                await fetchUpdatedData();
            }

            initHome();
        }, [fetchUpdatedData])
=======
                if (transactions.length === 0) {
                    setLoading(true);
                }
                await fetchUpdatedData();
                setLoading(false);
            }

            initHome();
        }, [transactions.length, fetchUpdatedData])
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    );

    return {
        user,
        summary,
        monthlyStats,
        transactions,
<<<<<<< HEAD
        loadingUser,
        loadingSummary,
        loadingTransactions,
        loadingMonthlyStats,
        loadingMoreTransactions,
        hasMoreTransactions,
        hasError,
        refetch: fetchUpdatedData,
        loadMoreTransactions,
        deleteTransaction: handleDeleteTransaction
    };
}
=======
        loading,
        hasError,
        refetch: fetchUpdatedData,
        deleteTransaction: handleDeleteTransaction
    };
}
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
