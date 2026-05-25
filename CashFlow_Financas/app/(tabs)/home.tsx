import { StyleSheet, View, ScrollView, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react"; 
import { useTranslation } from "react-i18next";
import { colors } from "@/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const VISIBILITY_KEY = "@app_finance_visibility";

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
                console.error("Erro ao carregar visibilidade:", error);
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
            console.error("Erro ao salvar visibilidade:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 🌟 O cabeçalho voltou a ter apenas o TopBar, sem o botão do olho */}
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
                        {/* 🌟 Passamos o estado e a função de clique para dentro do BalanceCard */}
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