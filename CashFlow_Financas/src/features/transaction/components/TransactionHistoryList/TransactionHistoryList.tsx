import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Box, Text, scale, Theme } from '@/theme/unistyles'; 
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transactions as Transaction } from '../../types/Transactions';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal';
import { useCurrency } from '@/features/settings/hooks/useCurrency';

interface TransactionHistoryListProps {
    transactions: Transaction[]; 
    ListHeaderComponent?: React.ReactElement;
    loading?: boolean;
    onTransactionPress?: (transaction: Transaction) => void;
    onDeleteMultiple?: (ids: string[]) => Promise<void>;
}

export function TransactionHistoryList({ 
    transactions, 
    ListHeaderComponent, 
    loading = false,
    onTransactionPress,
    onDeleteMultiple
}: TransactionHistoryListProps) {
    const theme = useTheme<Theme>();
    const { t, i18n } = useTranslation();
    const { formatCurrency } = useCurrency();
    const insets = useSafeAreaInsets();
    
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const isSelectionMode = selectedIds.size > 0;

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const performDelete = async () => {
        const ids = Array.from(selectedIds);
        if (onDeleteMultiple) {
            await onDeleteMultiple(ids);
        }
        setSelectedIds(new Set());
    };

    const handleDeletePress = () => {
        if (selectedIds.size > 3) {
            setIsModalVisible(true);
        } else {
            performDelete();
        }
    };

    const getDateKey = useCallback((transaction: Transaction) => {
        const dateRaw = transaction.date || transaction.created_at;
        return dateRaw ? dateRaw.split(' ')[0].split('T')[0] : new Date().toISOString().split('T')[0];
    }, []);

    const getSectionTitle = useCallback((dateKey: string) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        
        const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
        if (isToday) return t("report.date.today");

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = date.getFullYear() === yesterday.getFullYear() && date.getMonth() === yesterday.getMonth() && date.getDate() === yesterday.getDate();
        if (isYesterday) return t("report.date.yesterday");

        return date.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });
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

    const dynamicPaddingBottom = 95 + (insets.bottom > 0 ? insets.bottom : 4);

    const renderLoadingSkeleton = () => (
        <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 220 }}>
            {[0, 1].map((sectionIndex) => (
                <Box key={sectionIndex}>
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="m" marginBottom="xs" paddingHorizontal="m">
                        <Skeleton width={110} height={16} borderRadius={4} />
                        <Skeleton width={65} height={14} borderRadius={4} />
                    </Box>
                    {[0, 1, 2].map((itemIndex) => (
                        <Box key={`${sectionIndex}-${itemIndex}`} backgroundColor="card" marginHorizontal="m" paddingVertical="s" paddingHorizontal="s" flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="divider" marginBottom="xs">
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
            {isSelectionMode && (
                <TouchableOpacity 
                    style={{ position: 'absolute', bottom: 100, right: 20, zIndex: 10, backgroundColor: theme.colors.danger, padding: 15, borderRadius: 30 }}
                    onPress={handleDeletePress}
                >
                    <Feather name="trash-2" size={24} color="white" />
                </TouchableOpacity>
            )}

            <ConfirmationModal
                visible={isModalVisible}
                title={t("common.deleteTitle")}
                description={t("common.deleteDescription", { count: selectedIds.size })}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                onClose={() => setIsModalVisible(false)}
                onConfirm={() => {
                    performDelete();
                    setIsModalVisible(false);
                }}
                isDestructive={true}
            />

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={loading ? renderLoadingSkeleton() : null}
                ListEmptyComponent={
                    !loading ? (
                        <Box flex={1} justifyContent="center" alignItems="center" marginTop="xxl">
                            <Text variant="body" color="textSecondary">
                                {t("transactions.emptyTransactions")}
                            </Text>
                        </Box>
                    ) : null
                }
                contentContainerStyle={{ 
                    paddingBottom: dynamicPaddingBottom, 
                    paddingTop: theme.spacing.s,
                    flexGrow: 1 
                }}
                renderSectionHeader={({ section: { title, countText } }) => (
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="m" marginBottom="xs" paddingHorizontal="m">
                        <Text variant="body" color="textSecondary" fontWeight="600">{title}</Text>
                        <Text variant="caption" color="textSecondary">{countText}</Text>
                    </Box>
                )}
                renderItem={({ item }) => {
                    const isExpense = item.type === 'expense';
                    const typeLabel = isExpense ? t("transactions.expense") : t("transactions.income");
                    const isSelected = selectedIds.has(item.id.toString());
                    const shouldCrossOut = isSelected || item.status === 'canceled';
                    const statusOpacity = item.status === 'paid' ? 1 : item.status === 'pending' ? 0.6 : 0.4;
                    const finalOpacity = isSelected ? 0.5 : statusOpacity;

                    return (
                        <TouchableOpacity 
                            activeOpacity={0.7} 
                            onLongPress={() => toggleSelection(item.id.toString())}
                            onPress={() => isSelectionMode ? toggleSelection(item.id.toString()) : onTransactionPress?.(item)}
                            style={{ opacity: finalOpacity, marginHorizontal: 16, marginBottom: scale(2) }}
                        >
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'timing', duration: 100 }}>
                                <Box 
                                    backgroundColor="card" 
                                    paddingVertical="s" 
                                    paddingHorizontal="s" 
                                    flexDirection="row" 
                                    justifyContent="space-between" 
                                    alignItems="center" 
                                    borderBottomWidth={1} 
                                    borderColor="divider"
                                    overflow="hidden"
                                >
                                    {shouldCrossOut && (
                                        <Box position="absolute" height={2} backgroundColor="danger" left={scale(60)} right={scale(10)} top="50%" zIndex={1} />
                                    )}
                                    <Box flexDirection="row" alignItems="center" flex={1}>
                                        <Box width={40} height={40} borderRadius="xl" justifyContent="center" alignItems="center" backgroundColor={isExpense ? 'expenseLight' : 'incomeLight'}>
                                            <Feather name={isSelected ? 'check' : (isExpense ? 'arrow-down' : 'arrow-up')} size={18} color={isSelected ? theme.colors.danger : (isExpense ? theme.colors.expense : theme.colors.income)} />
                                        </Box>
                                        <Box marginLeft="m" flex={1}>
                                            <Text variant="body" color="textPrimary" fontWeight="500" style={{ fontSize: scale(15) }}>{item.title}</Text>
                                            <Text variant="caption" color="textSecondary" style={{ fontSize: scale(12) }}>{typeLabel} {item.category_id ? `• ${item.category_id}` : ''}</Text>
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
