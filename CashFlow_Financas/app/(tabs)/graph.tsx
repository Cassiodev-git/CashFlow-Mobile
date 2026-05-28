import React, { useState } from 'react';
<<<<<<< HEAD
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
=======
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';

<<<<<<< HEAD
import { RevenueExpenseChart, RevenueExpenseChartSkeleton } from '@/components/RevenueExpenseChart/RevenueExpenseChart';
import { ExpensesDistributionChart, ExpensesDistributionChartSkeleton } from '@/components/ExpensesDistributionChart/ExpensesDistributionChart';
=======
import { RevenueExpenseChart } from '@/components/RevenueExpenseChart/RevenueExpenseChart';
import { ExpensesDistributionChart } from '@/components/ExpensesDistributionChart/ExpensesDistributionChart';
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
import { ErrorState } from '@/components/ErrorState/ErrorState'; 
import { useReports } from '@/hooks/useReports'; 

export default function GraphScreen() {
    const { t } = useTranslation();
    
    const [selectedTab, setSelectedTab] = useState('Mês');
    const { loading, error, lineChartData, pieChartData, refresh } = useReports(selectedTab);

    const tabs = [
        { id: 'Semana', label: t("common.week") },
        { id: 'Mês', label: t("common.month") },
        { id: 'Ano', label: t("common.year") },
    ];

<<<<<<< HEAD
=======
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryDark} />
            </View>
        );
    }

>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    if (error) {
        return (
            <View style={styles.errorCenteredContainer}>
                <ErrorState onRetry={refresh} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("graph.title")}</Text>
                <Text style={styles.subtitle}>{t("graph.titleDescription")}</Text>
            </View>
            <View style={styles.tabContainer}>
                {tabs.map((tab) => {
                    const isActive = selectedTab === tab.id;
                    return (
                        <TouchableOpacity 
                            key={tab.id} 
                            onPress={() => setSelectedTab(tab.id)}
                            style={[styles.tabButton, isActive && styles.tabButtonActive]}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

<<<<<<< HEAD
            {loading ? (
                <>
                    <RevenueExpenseChartSkeleton />
                    <ExpensesDistributionChartSkeleton />
                </>
            ) : (
                <>
                    {lineChartData.length > 0 ? (
                        <RevenueExpenseChart data={lineChartData} />
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>{t("graph.empty")}</Text>
                        </View>
                    )}

                    {pieChartData.length > 0 ? (
                        <ExpensesDistributionChart data={pieChartData} />
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>{t("graph.empty")}</Text>
                        </View>
                    )}
                </>
=======
            {lineChartData.length > 0 ? (
                <RevenueExpenseChart data={lineChartData} />
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>{t("graph.empty")}</Text>
                </View>
            )}

            {pieChartData.length > 0 ? (
                <ExpensesDistributionChart data={pieChartData} />
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>{t("graph.empty")}</Text>
                </View>
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
            )}
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: colors.card, padding: 24 },
<<<<<<< HEAD
=======
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card },
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    errorCenteredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 22 },
    header: { marginTop: 40, marginBottom: 15 },
    title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    
    tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 8, marginBottom: 10, backgroundColor: colors.surface },
    tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    tabButtonActive: { backgroundColor: colors.primaryDark, elevation: 2 },
    tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
    tabTextActive: { color: colors.textInverse },

    emptyCard: { backgroundColor: colors.card, borderRadius: 24, padding: 40, marginBottom: 20, alignItems: 'center', justifyContent: 'center', elevation: 1 },
    emptyText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center' }
<<<<<<< HEAD
});
=======
});
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
