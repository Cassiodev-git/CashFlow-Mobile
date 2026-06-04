import React, { useMemo } from 'react';
import { SectionList, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box, Text, Theme } from '@/theme/unistyles'; 
import { useTheme } from '@shopify/restyle';
import { Transaction } from '@/hooks/useTransactionFilter'; 
import { Skeleton } from '@/components/Skeleton/Skeleton';

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
    const { height: screenHeight } = useWindowDimensions();

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString + 'T12:00:00'); 
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const formattedDate = date.toLocaleString('pt-BR', { day: 'numeric', month: 'long' });

        if (isToday) return `Hoje • ${formattedDate}`;
        if (isYesterday) return `Ontem • ${formattedDate}`;
        
        const weekday = date.toLocaleString('pt-BR', { weekday: 'long' });
        const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        return `${capitalizedWeekday} • ${formattedDate}`;
    };

    const formatCurrency = (value: number, type: 'income' | 'expense') => {
        const formatted = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        return type === 'expense' ? `-${formatted}` : formatted;
    };

    const sections = useMemo(() => {
        if (loading) {
            return [
                {
                    title: 'Hoje • 4 de Junho',
                    countText: '2 transações',
                    data: [{ id: 's1' }, { id: 's2' }] as any[],
                },
                {
                    title: 'Ontem • 3 de Junho',
                    countText: '1 transação',
                    data: [{ id: 's3' }] as any[],
                }
            ];
        }

        const groups: { [key: string]: Transaction[] } = {};

        transactions.forEach((transaction) => {
            const safeDate = transaction.date || new Date().toISOString();
            const dateKey = safeDate.split('T')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
        });

        return Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((dateKey) => ({
                title: formatDateHeader(dateKey),
                countText: `${groups[dateKey].length} ${groups[dateKey].length === 1 ? 'transação' : 'transações'}`,
                data: groups[dateKey],
            }));
    }, [transactions, loading]);

    const getCategoryIcon = (
        customIcon: string | null | undefined, 
        categoryId: string | null | undefined, 
        title: string
    ): keyof typeof Feather.glyphMap => {
        if (customIcon && customIcon in Feather.glyphMap) {
            return customIcon as keyof typeof Feather.glyphMap;
        }

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
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={
                    !loading ? (
                        <Box paddingVertical="xl" justifyContent="center" alignItems="center" marginTop="l">
                            <Feather name="info" size={28} color={theme.colors.textSecondary} style={{ marginBottom: 8 }} />
                            <Text variant="body" color="textSecondary" style={{ fontWeight: '500' }}>
                                Nenhuma transação encontrada
                            </Text>
                        </Box>
                    ) : null
                }
                contentContainerStyle={{
                    paddingBottom: dynamicPaddingBottom,
                }}
                
                renderSectionHeader={({ section: { title, countText } }) => (
                    <Box 
                        flexDirection="row" 
                        justifyContent="space-between" 
                        alignItems="center"
                        marginTop="m"
                        marginBottom="xs"
                        paddingHorizontal="m"
                    >
                        {loading ? (
                            <>
                                <Skeleton width={110} height={16} borderRadius={4} />
                                <Skeleton width={65} height={14} borderRadius={4} />
                            </>
                        ) : (
                            <>
                                <Text variant="body" color="textSecondary" style={{ fontWeight: '500' }}>
                                    {title}
                                </Text>
                                <Text variant="caption" color="textSecondary">
                                    {countText}
                                </Text>
                            </>
                        )}
                    </Box>
                )}

                renderItem={({ item, index, section }: { item: ExtendedTransaction; index: number; section: any }) => {
                    const isFirst = index === 0;
                    const isLast = index === section.data.length - 1;

                    if (loading) {
                        return (
                            <Box 
                                backgroundColor="card"
                                marginHorizontal="m"
                                padding="s"
                                flexDirection="row" 
                                justifyContent="space-between" 
                                alignItems="center"
                                borderLeftWidth={1}
                                borderRightWidth={1}
                                borderTopWidth={isFirst ? 1 : 0}
                                borderBottomWidth={1}
                                borderColor={isLast ? "border" : "divider"}
                                borderTopLeftRadius={isFirst ? "m" : "none"}
                                borderTopRightRadius={isFirst ? "m" : "none"}
                                borderBottomLeftRadius={isLast ? "m" : "none"}
                                borderBottomRightRadius={isLast ? "m" : "none"}
                                style={{
                                    marginBottom: isLast ? theme.spacing.s : 0,
                                }}
                            >
                                <Box flexDirection="row" alignItems="center" flex={1}>
                                    <Skeleton width={36} height={36} borderRadius={18} />
                                    <Box marginLeft="s" flex={1} style={{ gap: 6 }}>
                                        <Skeleton width="55%" height={14} borderRadius={4} />
                                        <Skeleton width="35%" height={11} borderRadius={4} />
                                    </Box>
                                </Box>
                                <Box alignItems="flex-end" marginLeft="s" style={{ gap: 6 }}>
                                    <Skeleton width={60} height={14} borderRadius={4} />
                                    <Skeleton width={30} height={11} borderRadius={4} />
                                </Box>
                            </Box>
                        );
                    }

                    const isExpense = item.type === 'expense';
                    const valueColor = isExpense ? 'expense' : 'income';
                    const iconBgColor = isExpense ? 'expenseLight' : 'incomeLight';
                    const rawIconColor = isExpense ? theme.colors.expense : theme.colors.income;
                    
                    const iconName = getCategoryIcon(item.category_icon, item.category_id, item.title);

                    const typeLabel = isExpense ? 'Despesa' : 'Receita';
                    const descriptionText = item.category_id 
                        ? `${typeLabel} • ${item.category_id}`
                        : typeLabel;

                    const timeSource = item.created_at || item.date || '';
                    const time = timeSource.includes('T') 
                        ? timeSource.split('T')[1].substring(0, 5) 
                        : '00:00';

                    return (
                        <Box 
                            backgroundColor="card"
                            marginHorizontal="m"
                            padding="s"
                            flexDirection="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            borderLeftWidth={1}
                            borderRightWidth={1}
                            borderTopWidth={isFirst ? 1 : 0}
                            borderBottomWidth={1}
                            borderColor={isLast ? "border" : "divider"}
                            borderTopLeftRadius={isFirst ? "m" : "none"}
                            borderTopRightRadius={isFirst ? "m" : "none"}
                            borderBottomLeftRadius={isLast ? "m" : "none"}
                            borderBottomRightRadius={isLast ? "m" : "none"}
                            style={{
                                marginBottom: isLast ? theme.spacing.s : 0,
                                shadowColor: '#191D29',
                                shadowOffset: { width: 0, height: isLast ? 2 : 0 },
                                shadowOpacity: isLast ? 0.03 : 0,
                                shadowRadius: isLast ? 6 : 0,
                                elevation: isLast ? 1 : 0,
                            }}
                        >
                            <Box flexDirection="row" alignItems="center" flex={1}>
                                <Box 
                                    width={36} 
                                    height={36} 
                                    borderRadius="xl" 
                                    justifyContent="center" 
                                    alignItems="center"
                                    backgroundColor={iconBgColor} 
                                >
                                    <Feather name={iconName} size={18} color={rawIconColor} />
                                </Box>
                                
                                <Box marginLeft="s" flex={1}>
                                    <Text variant="body" color="textPrimary" style={{ fontWeight: '500', fontSize: 13.5 }}>
                                        {item.title}
                                    </Text>
                                    <Text variant="caption" color="textSecondary" style={{ marginTop: 1, fontSize: 11.5 }}>
                                        {descriptionText}
                                    </Text>
                                </Box>
                            </Box>

                            <Box alignItems="flex-end" marginLeft="s">
                                <Text variant="body" color={valueColor} style={{ fontWeight: '600', fontSize: 13.5 }}>
                                    {formatCurrency(item.amount, item.type)}
                                </Text>
                                <Text variant="caption" color="textMuted" style={{ marginTop: 1, fontSize: 11.5 }}>
                                    {time}
                                </Text>
                            </Box>
                        </Box>
                    );
                }}
            />
        </Box>
    );
}