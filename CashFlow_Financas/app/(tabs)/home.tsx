import { StyleSheet, View, ScrollView, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react"; 
import { useTranslation } from "react-i18next";
import { colors } from "@/theme";

// Components
import { TopBar } from "@/components/TopBar/TopBar";
import { BalanceCard } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions } from "@/features/transaction/components/RecentTransactions/RecentTransactions";
import { TransactionFormModal } from "@/features/transaction/components/TransactionFormModal/TransactionFormModal"; 
import { ErrorState } from "@/components/ErrorState/ErrorState";

// Hooks
import { useHomeData } from "@/hooks/useHomeData";

// Types
import { Transactions } from "@/features/transaction/types/Transactions";
//responsive
import { ScaledSheet } from "@/utils/responsive";

export default function HomeScreen() {
    const { t } = useTranslation();
    
    const {
        user,
        summary,
        monthlyStats,
        transactions,
        loading,
        hasError,
        refetch,
        deleteTransaction
    } = useHomeData();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTxToEdit, setSelectedTxToEdit] = useState<Transactions | null>(null);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TopBar user={user} />

                {loading ? (
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
                        />

                        <View style={styles.summaryRow}>
                            <FinanceCard isIncome={true} value={summary.income ?? 0} />
                            <FinanceCard isIncome={false} value={summary.expense ?? 0} />
                        </View>
                        
                        <RecentTransactions 
                            transactions={transactions} 
                            isVisible={true} 
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
    feedbackContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 },
    feedbackText: { color: colors.textSecondary, fontSize: 14 }
});