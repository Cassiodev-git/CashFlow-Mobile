<<<<<<< HEAD
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react"; 
=======
import { StyleSheet, View, ScrollView, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react"; 
import { useTranslation } from "react-i18next";
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
import { colors } from "@/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
<<<<<<< HEAD
import { TopBar, TopBarSkeleton } from "@/components/TopBar/TopBar";
import { BalanceCard, BalanceCardSkeleton } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard, FinanceCardSkeleton } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions, RecentTransactionsSkeleton } from "@/features/transaction/components/RecentTransactions/RecentTransactions";
=======
import { TopBar } from "@/components/TopBar/TopBar";
import { BalanceCard } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions } from "@/features/transaction/components/RecentTransactions/RecentTransactions";
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
import { TransactionFormModal } from "@/features/transaction/components/TransactionFormModal/TransactionFormModal"; 
import { ErrorState } from "@/components/ErrorState/ErrorState";

// Hooks
import { useHomeData } from "@/hooks/useHomeData";

// Types
import { Transactions } from "@/features/transaction/types/Transactions";
//responsive
import { ScaledSheet } from "@/utils/responsive";
<<<<<<< HEAD
import { logger } from "@/utils/logger";
=======
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707

const VISIBILITY_KEY = "@app_finance_visibility";

export default function HomeScreen() {
<<<<<<< HEAD
=======
    const { t } = useTranslation();
    
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    const {
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
        refetch,
        loadMoreTransactions,
=======
        loading,
        hasError,
        refetch,
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
        deleteTransaction
    } = useHomeData();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTxToEdit, setSelectedTxToEdit] = useState<Transactions | null>(null);
    
    const [isVisible, setIsVisible] = useState(true);
    const [isVisibilityLoaded, setIsVisibilityLoaded] = useState(false);

    useEffect(() => {
        async function loadVisibility() {
            try {
                const savedVisibility = await AsyncStorage.getItem(VISIBILITY_KEY);
                if (savedVisibility !== null) {
                    setIsVisible(JSON.parse(savedVisibility));
                }
            } catch (error) {
<<<<<<< HEAD
                logger.error("Erro ao carregar visibilidade:", error);
=======
                console.error("Erro ao carregar visibilidade:", error);
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
            } finally {
                setIsVisibilityLoaded(true);
            }
        }
        loadVisibility();
    }, []);

    const toggleVisibility = async () => {
        try {
            const newValue = !isVisible;
            setIsVisible(newValue);
            await AsyncStorage.setItem(VISIBILITY_KEY, JSON.stringify(newValue));
        } catch (error) {
<<<<<<< HEAD
            logger.error("Erro ao salvar visibilidade:", error);
        }
    };

    const isBalanceLoading = loadingSummary || loadingMonthlyStats || !isVisibilityLoaded;
    const isFinanceLoading = loadingSummary || !isVisibilityLoaded;

=======
            console.error("Erro ao salvar visibilidade:", error);
        }
    };

>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

<<<<<<< HEAD
                {loadingUser ? (
                    <TopBarSkeleton />
                ) : (
                    <TopBar user={user} />
                )}

                {hasError ? (
                    <ErrorState onRetry={refetch} />
                ) : (
                    <>
                        {isBalanceLoading || !summary || !monthlyStats ? (
                            <BalanceCardSkeleton balance={0} percentage={0} status="neutral" isVisible={true} />
                        ) : (
                            <BalanceCard
                                balance={summary.balance}
                                percentage={monthlyStats.percentage}
                                status={monthlyStats.status}
                                isVisible={isVisible}
                                onToggleVisibility={toggleVisibility}
                            />
                        )}

                        <View style={styles.summaryRow}>
                            {isFinanceLoading || !summary ? (
                                <>
                                    <FinanceCardSkeleton isIncome={true} />
                                    <FinanceCardSkeleton isIncome={false} />
                                </>
                            ) : (
                                <>
                                    <FinanceCard isIncome={true} value={summary.income ?? 0} isVisible={isVisible} />
                                    <FinanceCard isIncome={false} value={summary.expense ?? 0} isVisible={isVisible} />
                                </>
                            )}
                        </View>
                        
                        {loadingTransactions ? (
                            <RecentTransactionsSkeleton />
                        ) : (
                            <RecentTransactions
                                transactions={transactions}
                                isVisible={isVisible}
                                onDelete={deleteTransaction}
                                onLoadMore={loadMoreTransactions}
                                hasMore={hasMoreTransactions}
                                isLoadingMore={loadingMoreTransactions}
                                onEdit={(tx: Transactions) => {
                                    setSelectedTxToEdit(tx);
                                    setIsEditOpen(true);
                                }}
                            />
                        )}
                    </>
=======
                <TopBar user={user} />

                {(loading || !isVisibilityLoaded) ? (
                    <View style={styles.feedbackContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.feedbackText}>{t("common.loading")}</Text>
                    </View>
                ) : hasError ? (
                    <ErrorState onRetry={refetch} />
                ) : summary && monthlyStats ? (
                    <>
                        <BalanceCard
                            balance={summary.balance}
                            percentage={monthlyStats.percentage}
                            status={monthlyStats.status}
                            isVisible={isVisible}
                            onToggleVisibility={toggleVisibility}
                        />

                        <View style={styles.summaryRow}>
                            <FinanceCard isIncome={true} value={summary.income ?? 0} isVisible={isVisible} />
                            <FinanceCard isIncome={false} value={summary.expense ?? 0} isVisible={isVisible} />
                        </View>
                        
                        <RecentTransactions 
                            transactions={transactions} 
                            isVisible={isVisible} 
                            onDelete={deleteTransaction}
                            onEdit={(tx: Transactions) => {
                                setSelectedTxToEdit(tx);
                                setIsEditOpen(true);
                            }}
                        />
                    </>
                ) : (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackText}>{t("transactions.emptyTransactions")}</Text>
                    </View>
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
                )}
            </ScrollView>
            
            <TransactionFormModal 
                isOpen={isEditOpen}
                transaction={selectedTxToEdit}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedTxToEdit(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, width: "100%", backgroundColor: colors.background },
    scrollContent: { padding: 24, gap: 16, paddingBottom: 75 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
<<<<<<< HEAD
});
=======
    feedbackContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 },
    feedbackText: { color: colors.textSecondary, fontSize: 14 }
});
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
