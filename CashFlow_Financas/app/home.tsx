import { StyleSheet, View, ScrollView, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Theme
import { colors } from "@/theme";

// Components
import { TopBar } from "@/components/TopBar/TopBar";
import { BalanceCard } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard } from "@/features/transaction/components/FinanceCard/FinanceCard";
import { RecentTransactions } from "@/features/transaction/components/RecentTransactions/RecentTransactions";

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

    useEffect(() => {
        async function loadData() {
            try {
                const userData = await AppUserService.findFirstUser();

                if (!userData) {
                    return;
                }

                setUser(userData);

                const [transactionsList, summaryData, percentageData] = await Promise.all([
                    AppTransactionsService.listTransactions(),
                    AppTransactionSummaryService.getSummary(),
                    AppTransactionSummaryService.getMonthlyExpensePercentage(),
                ]);

                setSummary(summaryData);
                setMonthlyStats(percentageData);
                setTransactions(transactionsList);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

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
                            />
                        </>
                    ) : (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackText}>{t("transactions.emptyTransactions")}</Text>
                    </View>
                )}
            </ScrollView>
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
