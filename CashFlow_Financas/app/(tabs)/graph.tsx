import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ScaledSheet } from '@/utils/responsive';

import { RevenueExpenseChart } from '@/components/RevenueExpenseChart/RevenueExpenseChart';
import { ExpensesDistributionChart } from '@/components/ExpensesDistributionChart/ExpensesDistributionChart';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';

const LINE_DATA = [
    { day: "1", revenue: 2500, expense: 1800 },
    { day: "5", revenue: 3200, expense: 2200 },
    { day: "10", revenue: 2800, expense: 2400 },
    { day: "15", revenue: 4500, expense: 2100 },
    { day: "20", revenue: 3800, expense: 2800 },
    { day: "25", revenue: 5200, expense: 2500 },
    { day: "30", revenue: 4800, expense: 2300 },
];

const PIE_DATA = [
    { label: "Moradia", value: 35, color: "#2D6A4F" },
    { label: "Alimentação", value: 25, color: "#FF9F1C" },
    { label: "Transporte", value: 15, color: "#3A86FF" },
    { label: "Lazer", value: 10, color: "#FFD60A" },
    { label: "Outros", value: 15, color: "#80ED99" },
];

export default function ReportsScreen() {
    const {t} = useTranslation()
    const [selectedTab, setSelectedTab] = useState('Mês');

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("graph.title")}</Text>
                <Text style={styles.subtitle}>Acompanhe sua evolução financeira</Text>
            </View>

            <View style={styles.tabContainer}>
                {['Semana', 'Mês', '3 Meses', 'Ano'].map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        onPress={() => setSelectedTab(tab)}
                        style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
                    >
                        <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <RevenueExpenseChart data={LINE_DATA} />
            <ExpensesDistributionChart data={PIE_DATA} />
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: colors.card, padding: 22},
    header: { marginTop: 40, marginBottom: 15 },
    title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    
    tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 10 },
    tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    tabButtonActive: { backgroundColor: colors.primaryDark, elevation: 2 },
    tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
    tabTextActive: { color: colors.textInverse },
});