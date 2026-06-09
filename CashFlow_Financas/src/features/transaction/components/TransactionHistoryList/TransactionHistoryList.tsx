import React, { useCallback, useMemo } from 'react';
import { SectionList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text, scale, Theme } from '@/theme/unistyles'; 
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transactions as Transaction } from '../../types/Transactions';
import { Skeleton } from '@/components/Skeleton/Skeleton';

interface TransactionHistoryListProps {
    transactions: Transaction[]; 
    ListHeaderComponent?: React.ReactElement;
    loading?: boolean;
    onTransactionPress?: (transaction: Transaction) => void;
}

export function TransactionHistoryList({ 
    transactions, 
    ListHeaderComponent, 
    loading = false,
    onTransactionPress
}: TransactionHistoryListProps) {
    const theme = useTheme<Theme>();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    const getDateKey = useCallback((transaction: Transaction) => {
        const dateRaw = transaction.date || transaction.created_at;
        return dateRaw ? dateRaw.split(' ')[0].split('T')[0] : new Date().toISOString().split('T')[0];
    }, []);

    const getSectionTitle = useCallback((dateKey: string) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        
        const isToday = 
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        if (isToday) return t("report.date.today");

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const isYesterday = 
            date.getFullYear() === yesterday.getFullYear() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getDate() === yesterday.getDate();

        if (isYesterday) return t("report.date.yesterday");

        return date.toLocaleDateString(i18n.language, { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }, [i18n.language, t]);

    const sections = useMemo(() => {
        if (loading) return [];
        const groups: Record<string, Transaction[]> = {};
        transactions.forEach((transaction) => {
            const dateKey = getDateKey(transaction);
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(transaction);
        });

        return Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((dateKey) => ({
                title: getSectionTitle(dateKey),
                countText: t("transaction.count", { count: groups[dateKey].length }),
                data: groups[dateKey],
            }));
    }, [transactions, loading, getDateKey, getSectionTitle, t]);

    const formatCurrency = (value: number) => value.toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' });
    const dynamicPaddingBottom = 95 + (insets.bottom > 0 ? insets.bottom : 4);

    const renderLoadingSkeleton = () => (
        <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
        >
            {[0, 1].map((sectionIndex) => (
                <Box key={sectionIndex}>
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="m" marginBottom="xs" paddingHorizontal="m">
                        <Skeleton width={110} height={16} borderRadius={4} />
                        <Skeleton width={65} height={14} borderRadius={4} />
                    </Box>

                    {[0, 1, 2].map((itemIndex) => (
                        <Box
                            key={`${sectionIndex}-${itemIndex}`}
                            backgroundColor="card"
                            marginHorizontal="m"
                            paddingVertical="s"
                            paddingHorizontal="s"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            borderBottomWidth={1}
                            borderColor="divider"
                        >
                            <Box flexDirection="row" alignItems="center" flex={1}>
                                <Skeleton width={40} height={40} borderRadius={20} />
                                <Box marginLeft="m" flex={1} style={{ gap: scale(6) }}>
                                    <Skeleton width="60%" height={14} borderRadius={4} />
                                    <Skeleton width="42%" height={12} borderRadius={4} />
                                </Box>
                            </Box>
                            <Skeleton width={72} height={16} borderRadius={4} />
                        </Box>
                    ))}
                </Box>
            ))}
        </MotiView>
    );

    return (
        <Box flex={1} backgroundColor="background">
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={loading ? renderLoadingSkeleton() : null}
                ListEmptyComponent={!loading ? (
                    <Box paddingVertical="xl" justifyContent="center" alignItems="center" marginTop="l">
                        <Feather name="info" size={28} color={theme.colors.textSecondary} />
                        <Text variant="body" color="textSecondary" fontWeight="500" marginTop="s">
                            {t("transaction.noTransactions")}
                        </Text>
                    </Box>
                ) : null}
                contentContainerStyle={{ paddingBottom: dynamicPaddingBottom, paddingTop: theme.spacing.s }}
                renderSectionHeader={({ section: { title, countText } }) => (
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="m" marginBottom="xs" paddingHorizontal="m">
                        <Text variant="body" color="textSecondary" fontWeight="600">{title}</Text>
                        <Text variant="caption" color="textSecondary">{countText}</Text>
                    </Box>
                )}
                renderItem={({ item }) => {
                    const isExpense = item.type === 'expense';
                    const typeLabel = isExpense ? t("transactions.expense") : t("transactions.income");

                    return (
                        <TouchableOpacity activeOpacity={0.7} onPress={() => onTransactionPress?.(item)}>
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 100 }}
                            >
                                <Box backgroundColor="card" marginHorizontal="m" paddingVertical="s" paddingHorizontal="s" flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="divider">
                                    <Box flexDirection="row" alignItems="center" flex={1}>
                                        <Box width={40} height={40} borderRadius="xl" justifyContent="center" alignItems="center" backgroundColor={isExpense ? 'expenseLight' : 'incomeLight'}>
                                            <Feather name={isExpense ? 'arrow-down' : 'arrow-up'} size={18} color={isExpense ? theme.colors.expense : theme.colors.income} />
                                        </Box>
                                        <Box marginLeft="m" flex={1}>
                                            <Text variant="body" color="textPrimary" fontWeight="500" style={{ fontSize: scale(15) }}>{item.title}</Text>
                                            <Text variant="caption" color="textSecondary" style={{ fontSize: scale(12) }}>
                                                {typeLabel} {item.category_id ? `• ${item.category_id}` : ''}
                                            </Text>
                                        </Box>
                                    </Box>
                                    <Box alignItems="flex-end">
                                        <Text variant="body" color={isExpense ? 'expense' : 'income'} fontWeight="600" style={{ fontSize: scale(15) }}>
                                            {isExpense ? '-' : ''}{formatCurrency(item.amount)}
                                        </Text>
                                    </Box>
                                </Box>
                            </MotiView>
                        </TouchableOpacity>
                    );
                }}
            />
        </Box>
    );
}
