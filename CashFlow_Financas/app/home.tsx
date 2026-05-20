import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useState, useEffect } from "react";

// Theme
import { colors } from "@/theme";

// Components
import { TopBar } from "@/components/TopBar/TopBar";
import { BalanceCard } from "@/features/transaction/components/BalanceCard/BalanceCard";
import { FinanceCard } from "@/features/transaction/components/FinanceCard/FinanceCard";

// Services
import UserServiceGlobal from "@/services/UserServiceGlobal";
import TransactionStatsService from "@/features/transaction/services/TransactionStatsService";

// Types
import { User } from "@/features/user/types/User";

type MonthlyStats = {
    percentage: number;
    status: "positive" | "negative" | "neutral";
};

type Summary = {
    income: number;
    expense: number;
    balance: number;
};

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);

    useEffect(() => {
        async function loadData() {
            const userData = await UserServiceGlobal.findFirstUser();

            if (!userData) {
                return;
            }

            setUser(userData);

            const summaryData = await TransactionStatsService.getUserSummary(userData.id);
            const percentageData = await TransactionStatsService.getMonthlyExpensePercentage(userData.id) as MonthlyStats;

            setSummary(summaryData);
            setMonthlyStats(percentageData);
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

                {
                    summary &&
                    monthlyStats && (
                        <>
                            {/* Card de saldo */}
                            <BalanceCard
                                balance={summary.balance}
                                percentage={monthlyStats.percentage}
                                status={monthlyStats.status}
                            />

                            <View style={styles.summaryRow}>
                                {/* Cards de receita e despesa */}
                                <FinanceCard
                                    isIncome={true}
                                    value={summary.income ?? 0}
                                />
                                <FinanceCard
                                    isIncome={false}
                                    value={summary.expense ?? 0}
                                />
                            </View>
                        </>
                    )
                }
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
    }
});