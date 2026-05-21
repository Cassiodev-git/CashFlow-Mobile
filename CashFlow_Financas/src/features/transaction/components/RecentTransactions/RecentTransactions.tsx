import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { Transactions as Transaction } from '../../types/Transactions';

interface RecentTransactionsProps {
    transactions: Transaction[];
    isVisible?: boolean;
}

const categoryIcons: Record<string, keyof typeof Feather.glyphMap> = {
    Supermercado: 'shopping-cart',
    Salário: 'credit-card',
    Combustível: 'truck',
    Restaurante: 'coffee',
};

export function RecentTransactions({ transactions, isVisible = true }: RecentTransactionsProps) {
    const { t } = useTranslation();
    const [showAll, setShowAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    };

    const formatCurrency = (value: number, isExpense: boolean) => {
        const formatted = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        return isExpense ? `-${formatted}` : formatted;
    };

    const processedTransactions = useMemo(() => {
        let result = transactions;

        if (showAll && searchQuery.trim() !== '') {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (!showAll) {
            return result.slice(0, 6);
        }

        return result;
    }, [transactions, showAll, searchQuery]);

    
    const renderItem = ({ item, index }: { item: Transaction; index: number }) => {
        const isExpense = String(item.type).toLowerCase() === 'expense';
        const iconName = categoryIcons[item.title]; 

        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ 
                    type: 'timing', 
                    duration: 350, 
                    delay: Math.min(index * 60, 400) 
                }}
                style={styles.transactionCard}
            >
                <View style={styles.leftRow}>
                    {iconName && (
                        <View style={styles.iconBg}>
                            <Feather name={iconName} size={18} color={colors.income || '#2E7D32'} />
                        </View>
                    )}
                    
                    <View style={styles.textContainer}>
                        <Text style={styles.transactionTitle}>{item.title}</Text>
                        <Text style={styles.transactionSub}>
                            {formatDate(item.date)} • {isExpense ? t('transactions.expense') : t('transactions.income')}
                        </Text>
                    </View>
                </View>

                <View style={styles.valueContainer}>
                    <AnimatePresence exitBeforeEnter>
                        {isVisible ? (
                            <MotiView
                                key="visible-amount"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 150 }}
                            >
                                <Text style={[styles.amountText, { color: isExpense ? colors.expense : colors.income }]}>
                                    {formatCurrency(item.amount, isExpense)}
                                </Text>
                            </MotiView>
                        ) : (
                            <MotiView
                                key="hidden-amount"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 150 }}
                            >
                                <Text style={styles.hiddenText}>••••••</Text>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </View>
            </MotiView>
        );
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{t('transactions.recentTitle')}</Text>
                <TouchableOpacity onPress={() => {
                    setShowAll(!showAll);
                    setSearchQuery(''); 
                }}>
                    <Text style={styles.viewAllBtn}>
                        {showAll ? t('transactions.seeLess') : t('transactions.seeAll')}
                    </Text>
                </TouchableOpacity>
            </View>

            <AnimatePresence>
                {showAll && (
                    <MotiView
                        from={{ opacity: 0, height: 0, scaleY: 0.8, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 46, scaleY: 1, marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, scaleY: 0.8, marginBottom: 0 }}
                        transition={{ type: 'timing', duration: 250 }}
                        style={styles.searchContainer}
                    >
                        <Feather name="search" size={18} color={colors.textPrimary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t('transactions.searchPlaceholder')}
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Feather name="x" size={16} color={colors.textSecondary} style={{ padding: 4 }} />
                            </TouchableOpacity>
                        )}
                    </MotiView>
                )}
            </AnimatePresence>

            <AnimatePresence>
                <FlatList
                    data={processedTransactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    scrollEnabled={false} 
                    ListEmptyComponent={
                        <MotiView 
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ paddingVertical: 20 }}
                        >
                            <Text style={styles.emptyText}>{t("transactions.emptyTransactions")}</Text>
                        </MotiView>
                    }
                />
            </AnimatePresence>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 4,
        shadowColor: '#000',
        backgroundColor: colors.card,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: 'space-between',
        padding: 12
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    viewAllBtn: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.income, 
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card ,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        overflow: 'hidden'
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: colors.textPrimary,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card ,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        padding: 16, 
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary, 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        justifyContent: 'center',
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    transactionSub: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    valueContainer: {
        height: 24,
        justifyContent: 'center',
    },
    amountText: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    hiddenText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 14,
    },
});
