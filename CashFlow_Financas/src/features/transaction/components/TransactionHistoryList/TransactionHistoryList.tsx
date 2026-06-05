import React, { useMemo } from 'react';
import { SectionList, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box, Text, Theme } from '@/theme/unistyles'; 
import { useTheme } from '@shopify/restyle';
import { Transaction } from '@/hooks/useTransactionFilter'; 
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useTranslation } from 'react-i18next';

interface TransactionHistoryListProps {
    transactions: Transaction[]; 
    ListHeaderComponent?: React.ReactElement;
    loading?: boolean;
}

interface ExtendedTransaction extends Transaction {
    created_at?: string;
    category_icon?: string | null;
}

export function TransactionHistoryList({ transactions, ListHeaderComponent, loading = false }: TransactionHistoryListProps) {
    const theme = useTheme<Theme>();
    const { t, i18n } = useTranslation();
    const { height: screenHeight } = useWindowDimensions();

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString + 'T12:00:00'); 
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const formattedDate = date.toLocaleString(i18n.language, { day: 'numeric', month: 'long' });

        if (isToday) return `${t("date.today")} • ${formattedDate}`;
        if (isYesterday) return `${t("date.yesterday")} • ${formattedDate}`;
        
        const weekday = date.toLocaleString(i18n.language, { weekday: 'long' });
        const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        return `${capitalizedWeekday} • ${formattedDate}`;
    };

    const formatCurrency = (value: number, type: 'income' | 'expense') => {
        return value.toLocaleString(i18n.language, {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const sections = useMemo(() => {
        if (loading) {
            return [
                {
                    title: t("date.today"),
                    countText: t("transaction.count", { count: 2 }),
                    data: [{ id: 's1' }, { id: 's2' }] as any[],
                },
                {
                    title: t("date.yesterday"),
                    countText: t("transaction.count", { count: 1 }),
                    data: [{ id: 's3' }] as any[],
                }
            ];
        }

        const groups: { [key: string]: Transaction[] } = {};
        transactions.forEach((transaction) => {
            const safeDate = transaction.date || new Date().toISOString();
            const dateKey = safeDate.split('T')[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(transaction);
        });

        return Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((dateKey) => ({
                title: formatDateHeader(dateKey),
                countText: t("transaction.count", { count: groups[dateKey].length }),
                data: groups[dateKey],
            }));
    }, [transactions, loading, i18n.language]);

    const getCategoryIcon = (
        customIcon: string | null | undefined, 
        categoryId: string | null | undefined, 
        title: string
    ): keyof typeof Feather.glyphMap => {
        if (customIcon && customIcon in Feather.glyphMap) return customIcon as keyof typeof Feather.glyphMap;
        const fallbackKey = (categoryId || title || '').toLowerCase();
        if (fallbackKey.includes('aliment') || fallbackKey.includes('mercado')) return 'shopping-cart';
        if (fallbackKey.includes('salario') || fallbackKey.includes('trabalho')) return 'dollar-sign';
        if (fallbackKey.includes('transp') || fallbackKey.includes('combustivel')) return 'truck';
        return 'file-text';
    };

    const isGestureNavigation = screenHeight >= 800;
    const dynamicPaddingBottom = isGestureNavigation ? theme.spacing.xxl * 2 : theme.spacing.xl * 1.5;

    return (
        <Box flex={1} backgroundColor="background">
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={false}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={!loading ? (
                    <Box paddingVertical="xl" justifyContent="center" alignItems="center" marginTop="l">
                        <Feather name="info" size={28} color={theme.colors.textSecondary} style={{ marginBottom: 8 }} />
                        <Text variant="body" color="textSecondary" style={{ fontWeight: '500' }}>
                            {t("transaction.noTransactions")}
                        </Text>
                    </Box>
                ) : null}
                contentContainerStyle={{ paddingBottom: dynamicPaddingBottom }}
                renderSectionHeader={({ section: { title, countText } }) => (
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="m" marginBottom="xs" paddingHorizontal="m">
                        {loading ? (
                            <><Skeleton width={110} height={16} borderRadius={4} /><Skeleton width={65} height={14} borderRadius={4} /></>
                        ) : (
                            <><Text variant="body" color="textSecondary" style={{ fontWeight: '500' }}>{title}</Text>
                            <Text variant="caption" color="textSecondary">{countText}</Text></>
                        )}
                    </Box>
                )}
                renderItem={({ item, index, section }) => {
                    const isFirst = index === 0;
                    const isLast = index === section.data.length - 1;

                    if (loading) {
                        return (
                            <Box backgroundColor="card" marginHorizontal="m" padding="s" flexDirection="row" justifyContent="space-between" alignItems="center" borderLeftWidth={1} borderRightWidth={1} borderTopWidth={isFirst ? 1 : 0} borderBottomWidth={1} borderColor={isLast ? "border" : "divider"} style={{ marginBottom: isLast ? theme.spacing.s : 0 }}>
                                <Box flexDirection="row" alignItems="center" flex={1}>
                                    <Skeleton width={36} height={36} borderRadius={18} />
                                    <Box marginLeft="s" flex={1} style={{ gap: 6 }}><Skeleton width="55%" height={14} borderRadius={4} /><Skeleton width="35%" height={11} borderRadius={4} /></Box>
                                </Box>
                            </Box>
                        );
                    }

                    const isExpense = item.type === 'expense';
                    const valueColor = isExpense ? 'expense' : 'income';
                    const iconName = getCategoryIcon(item.category_icon, item.category_id, item.title);
                    const typeLabel = isExpense ? t("transaction.types.expense") : t("transaction.types.income");
                    const descriptionText = item.category_id ? `${typeLabel} • ${item.category_id}` : typeLabel;
                    const time = (item.created_at || item.date || '').split('T')[1]?.substring(0, 5) || '00:00';

                    return (
                        <Box backgroundColor="card" marginHorizontal="m" padding="s" flexDirection="row" justifyContent="space-between" alignItems="center" borderLeftWidth={1} borderRightWidth={1} borderTopWidth={isFirst ? 1 : 0} borderBottomWidth={1} borderColor={isLast ? "border" : "divider"} style={{ marginBottom: isLast ? theme.spacing.s : 0 }}>
                            <Box flexDirection="row" alignItems="center" flex={1}>
                                <Box width={36} height={36} borderRadius="xl" justifyContent="center" alignItems="center" backgroundColor={isExpense ? 'expenseLight' : 'incomeLight'}>
                                    <Feather name={iconName} size={18} color={isExpense ? theme.colors.expense : theme.colors.income} />
                                </Box>
                                <Box marginLeft="s" flex={1}>
                                    <Text variant="body" color="textPrimary" style={{ fontWeight: '500' }}>{item.title}</Text>
                                    <Text variant="caption" color="textSecondary">{descriptionText}</Text>
                                </Box>
                            </Box>
                            <Box alignItems="flex-end" marginLeft="s">
                                <Text variant="body" color={valueColor} style={{ fontWeight: '600' }}>{isExpense ? '-' : ''}{formatCurrency(item.amount, item.type)}</Text>
                                <Text variant="caption" color="textMuted">{time}</Text>
                            </Box>
                        </Box>
                    );
                }}
            />
        </Box>
    );
}