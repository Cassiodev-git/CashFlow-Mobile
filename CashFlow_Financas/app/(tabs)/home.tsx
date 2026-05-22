import { StyleSheet, View, ScrollView, Text, ActivityIndicator, Alert, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useState, useCallback, useEffect } from "react"; 
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

// Theme
import { colors } from "@/theme";

// Components
import { TopBar } from "@/components/TopBar/TopBar";
import { BalanceCard } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions } from "@/features/transaction/components/RecentTransactions/RecentTransactions";
import { TransactionFormModal } from "@/features/transaction/components/TransactionFormModal/TransactionFormModal"; 

// Services
import AppUserService from "@/services/AppUserService";
import AppTransactionSummaryService from "@/services/AppTransactionSummaryService";
import AppTransactionsService from "@/services/AppTransactionsService";
import type {
    MonthlyExpensePercentage,
    TransactionSummary,
} from "@/features/transaction/services/TransactionStatsService";

// Types
import { User } from "@/features/user/types/User";
import { Transactions } from "@/features/transaction/types/Transactions";

export default function HomeScreen() {
    const { t } = useTranslation();
    
    const [user, setUser] = useState<User | null>(null);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyExpensePercentage | null>(null);
    const [transactions, setTransactions] = useState<Transactions[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTxToEdit, setSelectedTxToEdit] = useState<Transactions | null>(null);

    async function fetchUpdatedData() {
        try {
            const userData = await AppUserService.findFirstUser();
            if (!userData) return;

            setUser(userData);

            const [transactionsList, summaryData, percentageData] = await Promise.all([
                AppTransactionsService.listTransactions(),
                AppTransactionSummaryService.getSummary(),
                AppTransactionSummaryService.getMonthlyExpensePercentage(),
            ]);

            setSummary(summaryData);
            setMonthlyStats(percentageData);
            setTransactions(transactionsList);
        } catch (error) {
            console.error("Erro ao sincronizar dados em background:", error);
        }
    }

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener("transaction_mutated", () => {
            fetchUpdatedData(); 
        });

        return () => {
            subscription.remove();
        };
    }, []);

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
        }, [transactions.length])
    );

    const handleDeleteTransaction = async (id: string) => {
        Alert.alert(
            t("common.delete"),
            t("transactions.confirmDelete"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AppTransactionsService.deleteTransaction(id);
                            
                            setTransactions(prev => prev.filter(item => item.id !== id));

                            const [summaryData, percentageData] = await Promise.all([
                                AppTransactionSummaryService.getSummary(),
                                AppTransactionSummaryService.getMonthlyExpensePercentage(),
                            ]);
                            setSummary(summaryData);
                            setMonthlyStats(percentageData);

                        } catch {
                            Alert.alert(t("common.error"), t("transactions.errorDelete"));
                        }
                    }
                }
            ]
        );
    };

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
                ) : summary && monthlyStats ? (
                        <>
                            <BalanceCard
                                balance={summary.balance}
                                percentage={monthlyStats.percentage}
                                status={monthlyStats.status}
                            />

                            <View style={styles.summaryRow}>
                                <FinanceCard
                                    isIncome={true}
                                    value={summary.income ?? 0}
                                />
                                <FinanceCard
                                    isIncome={false}
                                    value={summary.expense ?? 0}
                                />
                            </View>
                            
                            <RecentTransactions 
                                transactions={transactions} 
                                isVisible={true} 
                                onDelete={handleDeleteTransaction}
                                //Conecta o clique do botão Editar ao formulário unificado
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 24,
        gap: 16,
        paddingBottom: 85, 
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    feedbackContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 12,
    },
    feedbackText: {
        color: colors.textSecondary,
        fontSize: 14,
    }
});