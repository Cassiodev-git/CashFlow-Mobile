import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react"; 
import { colors } from "@/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import { TopBar, TopBarSkeleton } from "@/components/TopBar/TopBar";
import { BalanceCard, BalanceCardSkeleton } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard, FinanceCardSkeleton } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions, RecentTransactionsSkeleton } from "@/features/transaction/components/RecentTransactions/RecentTransactions";
import { TransactionFormModal } from "@/features/transaction/components/TransactionFormModal/TransactionFormModal"; 
import { ErrorState } from "@/components/ErrorState/ErrorState";

// Hooks
import { useHomeData } from "@/hooks/useHomeData";

// Types
import { Transactions } from "@/features/transaction/types/Transactions";
//responsive
import { ScaledSheet } from "@/utils/responsive";
import { logger } from "@/utils/logger";

const VISIBILITY_KEY = "@app_finance_visibility";

export default function HomeScreen() {
    const {
        user,
        summary,
        monthlyStats,
        transactions,
        loadingUser,
        loadingSummary,
        loadingTransactions,
        loadingMonthlyStats,
        loadingMoreTransactions,
        hasMoreTransactions,
        hasError,
        refetch,
        loadMoreTransactions,
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
                logger.error("Erro ao carregar visibilidade:", error);
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
            logger.error("Erro ao salvar visibilidade:", error);
        }
    };

    const isBalanceLoading = loadingSummary || loadingMonthlyStats || !isVisibilityLoaded;
    const isFinanceLoading = loadingSummary || !isVisibilityLoaded;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

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
});
