import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

export default function ReportsScreen() {
    const { t } = useTranslation();

    const transactionsGrouped = [
        {
            dateTitle: "Hoje • 29 de maio",
            count: "3 transações",
            items: [
                { id: '1', title: 'Supermercado', category: 'Despesa • Alimentação', value: '-R$ 156,80', time: '14:23', type: 'expense', icon: 'shopping-cart' },
                { id: '2', title: 'Salário', category: 'Receita • Salário', value: 'R$ 4.500,00', time: '09:15', type: 'income', icon: 'dollar-sign' },
                { id: '3', title: 'Combustível', category: 'Despesa • Transporte', value: '-R$ 120,00', time: '08:40', type: 'expense', icon: 'truck' },
            ]
        },
        {
            dateTitle: "Ontem • 28 de maio",
            count: "2 transações",
            items: [
                { id: '4', title: 'Restaurante', category: 'Despesa • Alimentação', value: '-R$ 85,40', time: '21:10', type: 'expense', icon: 'shopping-cart' },
                { id: '5', title: 'Freelance', category: 'Receita • Trabalho', value: 'R$ 800,00', time: '16:30', type: 'income', icon: 'dollar-sign' },
            ]
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t("graph.title") || "Relatório"}</Text>
                    <Text style={styles.subtitle}>Veja seu histórico completo</Text>
                </View>
                <TouchableOpacity style={styles.filterHeaderButton}>
                    <Feather name="filter" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                    <Text style={styles.summaryMonth}>Maio 2026</Text>
                    <View style={styles.chevronContainer}>
                        <TouchableOpacity style={styles.chevronButton}>
                            <Feather name="chevron-left" size={16} color={colors.textInverse} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chevronButton}>
                            <Feather name="chevron-right" size={16} color={colors.textInverse} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.summaryValuesRow}>
                    <View style={styles.summaryValueBlock}>
                        <Text style={styles.summaryValueLabel}>Receitas</Text>
                        <Text style={styles.summaryValueIncome}>R$ 7.250,00</Text>
                    </View>
                    <View style={styles.summaryValueBlock}>
                        <Text style={styles.summaryValueLabel}>Despesas</Text>
                        <Text style={styles.summaryValueExpense}>R$ 2.399,25</Text>
                    </View>
                    <View style={styles.summaryValueBlock}>
                        <Text style={styles.summaryValueLabel}>Saldo</Text>
                        <Text style={styles.summaryValueBalance}>R$ 4.850,75</Text>
                    </View>
                </View>
            </View>


            <View style={styles.searchContainer}>
                <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                <TextInput 
                    style={styles.searchInput} 
                    placeholder="Buscar transação..." 
                    placeholderTextColor="#888"
                />
                <TouchableOpacity>
                    <Feather name="calendar" size={18} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, styles.filterPillTextActive]}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterPill}>
                    <Text style={styles.filterPillText}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterPill}>
                    <Text style={styles.filterPillText}>Despesas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterPill}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.filterPillText}>Mais filtros </Text>
                        <Feather name="chevron-down" size={14} color="#555" />
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {transactionsGrouped.map((group, groupIdx) => (
                <View key={groupIdx} style={styles.dateGroupContainer}>
                    <View style={styles.dateGroupHeader}>
                        <Text style={styles.dateGroupTitle}>{group.dateTitle}</Text>
                        <Text style={styles.dateGroupCount}>{group.count}</Text>
                    </View>

                    {group.items.map((item) => (
                        <View key={item.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeftBlock}>
                                <View style={styles.iconContainer}>
                                    <Feather 
                                        name={item.icon as any} 
                                        size={16} 
                                        color={item.type === 'income' ? '#2E7D32' : '#C62828'} 
                                    />
                                </View>
                                <View style={styles.transactionDetails}>
                                    <Text style={styles.transactionTitle}>{item.title}</Text>
                                    <Text style={styles.transactionCategory}>{item.category}</Text>
                                </View>
                            </View>

                            <View style={styles.transactionRightBlock}>
                                <Text style={[
                                    styles.transactionValue, 
                                    item.type === 'income' ? styles.valueIncome : styles.valueExpense
                                ]}>
                                    {item.value}
                                </Text>
                                <Text style={styles.transactionTime}>{item.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: colors.card, paddingHorizontal: 22 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 50, 
        marginBottom: 20 
    },
    title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    filterHeaderButton: { padding: 4 },


    summaryCard: { 
        backgroundColor: colors.primary, 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 20 
    },
    summaryCardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16
    },
    summaryMonth: { fontSize: 14, fontWeight: '600', color: colors.textInverse },
    chevronContainer: { flexDirection: 'row', alignItems: 'center' },
    chevronButton: { paddingHorizontal: 6 },
    
    summaryValuesRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryValueBlock: { flex: 1 },
    summaryValueLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    summaryValueIncome: { fontSize: 14, fontWeight: '700', color: '#A5D6A7' }, // Verde claro de destaque
    summaryValueExpense: { fontSize: 14, fontWeight: '700', color: '#EF9A9A' }, // Vermelho claro de destaque
    summaryValueBalance: { fontSize: 14, fontWeight: '700', color: colors.textInverse },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 15
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },

    filtersContainer: { marginBottom: 20, mx: -22 },
    filtersContent: { paddingHorizontal: 22, alignItems: 'center', gap: 8 },
    filterPill: { 
        paddingHorizontal: 16, 
        paddingVertical: 6, 
        borderRadius: 20, 
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    filterPillActive: { 
        backgroundColor: '#1B5E20',
        borderColor: '#1B5E20'
    },
    filterPillText: { fontSize: 13, color: '#555', fontWeight: '500' },
    filterPillTextActive: { color: colors.textInverse, fontWeight: '600' },

    dateGroupContainer: { marginBottom: 22 },
    dateGroupHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 6
    },
    dateGroupTitle: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    dateGroupCount: { fontSize: 11, color: '#999' },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10
    },
    transactionLeftBlock: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    transactionDetails: { flex: 1 },
    transactionTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    transactionCategory: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    
    transactionRightBlock: { alignItems: 'flex-end' },
    transactionValue: { fontSize: 14, fontWeight: '700' },
    valueIncome: { color: '#2E7D32' },
    valueExpense: { color: '#C62828' },
    transactionTime: { fontSize: 11, color: '#999', marginTop: 4 }
});