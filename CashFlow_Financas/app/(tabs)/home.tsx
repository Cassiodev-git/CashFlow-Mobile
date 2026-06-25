import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "@shopify/restyle";

// components
import { TopBar } from "@/components/TopBar/TopBar";
import { BalanceCard, BalanceCardSkeleton } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard, FinanceCardSkeleton } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions, RecentTransactionsSkeleton } from "@/features/transaction/components/RecentTransactions/RecentTransactions";
import { TransactionFormModal } from "@/features/transaction/components/TransactionFormModal/TransactionFormModal"; 
import { ErrorState } from "@/components/ErrorState/ErrorState";

import { useHomeData } from "@/hooks/useHomeData";
import { Transactions } from "@/features/transaction/types/Transactions";
import { logger } from "@/utils/logger";
import { Box, scale, verticalScale, type Theme } from "@/theme/unistyles";

const VISIBILITY_KEY = "@app_finance_visibility";

export default function HomeScreen() {
    const theme = useTheme<Theme>();
    const insets = useSafeAreaInsets();
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
        <Box 
            flex={1} 
            width="100%" 
            style={{ 
                backgroundColor: theme.colors.background,
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    padding: scale(24),
                    gap: scale(16),
                    paddingBottom: verticalScale(40) 
                }}
                showsVerticalScrollIndicator={false}
            >
                {!loadingUser && <TopBar user={user} />}

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

                        <Box flexDirection="row" justifyContent="space-between" width="100%">
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
                        </Box>
                        
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
        </Box>
    );
}