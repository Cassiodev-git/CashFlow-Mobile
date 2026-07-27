import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { FlashList } from '@shopify/flash-list';
import { Transactions as Transaction } from '../../types/Transactions';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal'; 
import { Skeleton } from '@/components/Skeleton/Skeleton'; 
import { useCurrency } from '@/features/settings/hooks/useCurrency';
import { Box, Text, scale, verticalScale, moderateScale} from '@/theme/unistyles';
import { parseDateOnly, parseDatabaseTimestamp } from '@/utils/date';

const OtimizedList = FlashList as React.ComponentType<any>;

interface RecentTransactionsProps {
    transactions: Transaction[];
    isVisible?: boolean;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    onTransactionCreated?: () => void;
}

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    isVisible?: boolean;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

const categoryIcons: Record<string, keyof typeof Feather.glyphMap> = {
    Supermercado: 'shopping-cart',
    Salário: 'credit-card',
    Combustível: 'activity',
    Restaurante: 'coffee',
};

function TransactionDetailsModal({
    isOpen,
    onClose,
    transaction,
    isVisible = true,
    onEdit,
    onDelete
}: TransactionDetailsModalProps) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    if (!transaction) return null;

    const isExpense = String(transaction.type).toLowerCase() === 'expense';
    const statusColor = isExpense ? "#FF4747" : "#289653";
    const iconName = categoryIcons[transaction.title] || (isExpense ? 'arrow-down-left' : 'arrow-up-right');

    const formattedAmount = formatCurrency(transaction.amount);

    const handleConfirmDelete = () => {
        setIsConfirmOpen(false);
        onDelete(transaction);
        onClose();
    };

    return (
        <>
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <Box flex={1} style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }} justifyContent="flex-end">
                        <AnimatePresence>
                            {isOpen && (
                                <MotiView
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            )}
                        </AnimatePresence>

                        <TouchableWithoutFeedback>
                            <MotiView
                                from={{ translateY: 320 }}
                                animate={{ translateY: 0 }}
                                exit={{ translateY: 320 }}
                                transition={{ type: 'timing', duration: 230 }}
                            >
                                <Box
                                    backgroundColor="card"
                                    borderTopLeftRadius="xl"
                                    borderTopRightRadius="xl"
                                    paddingHorizontal="m"
                                    paddingBottom="s"
                                    paddingTop="s"
                                    width="100%"
                                    borderWidth={scale(1)}
                                    borderColor="inputBorder"
                                >
                                    <Box
                                        width={38}
                                        height={5}
                                        backgroundColor="inputBorder"
                                        borderRadius="xs"
                                        alignSelf="center"
                                        marginBottom="m"
                                    />

                                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                                        <Text variant="body" fontWeight="600" color="textSecondary">
                                            {t('transactions.detailsTitle')}
                                        </Text>
                                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                                            <Feather name="x" size={20} color="#6F7583" />
                                        </TouchableOpacity>
                                    </Box>

                                    <Box alignItems="center" marginBottom="l">
                                        <Box
                                            width={56}
                                            height={56}
                                            borderRadius="xl"
                                            justifyContent="center"
                                            alignItems="center"
                                            marginBottom="s"
                                            style={{ backgroundColor: `${statusColor}1A` }}
                                        >
                                            <Feather name={iconName} size={22} color={statusColor} />
                                        </Box>
                                        <Text variant="titleMedium" color="textPrimary" marginBottom="none" style={{ marginBottom: 6 }} numberOfLines={1}>
                                            {transaction.title}
                                        </Text>
                                        <Text variant="titleLarge" style={{ color: statusColor, fontSize: moderateScale(26), fontWeight: '800', letterSpacing: -0.5 }}>
                                            {isVisible ? `${isExpense ? '-' : ''}${formattedAmount}` : '••••••'}
                                        </Text>
                                    </Box>

                                    <Box
                                        borderTopWidth={scale(1)}
                                        borderBottomWidth={scale(1)}
                                        borderColor="inputBorder"
                                        paddingVertical="m"
                                        marginBottom="l"
                                        gap="s"
                                    >
                                        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                            <Text variant="body" color="textSecondary">{t('transactions.type')}</Text>
                                            <Text variant="body" style={{ color: statusColor, fontWeight: '600' }}>
                                                {isExpense ? t('transactions.expense') : t('transactions.income')}
                                            </Text>
                                        </Box>
                                        {transaction.description && (
                                            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                <Text variant="body" color="textSecondary">{t('transactions.descriptionLabel')}</Text>
                                                <Text
                                                    variant="body"
                                                    color="textPrimary"
                                                    fontWeight="500"
                                                    style={{ flex: 1, textAlign: 'right', marginLeft: scale(24) }}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {transaction.description}
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box flexDirection="row" gap="s">
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                height: verticalScale(48),
                                                borderRadius: scale(14),
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: scale(8),
                                                backgroundColor: '#FF474712',
                                                borderWidth: scale(1),
                                                borderColor: '#FF474726'
                                            }}
                                            activeOpacity={0.7}
                                            onPress={() => setIsConfirmOpen(true)} 
                                        >
                                            <Feather name="trash-2" size={16} color="#FF4747" />
                                            <Text variant="body" fontWeight="600" style={{ color: '#FF4747', fontSize: moderateScale(15) }}>
                                                {t('common.delete')}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                height: verticalScale(48),
                                                borderRadius: scale(14),
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: scale(8),
                                                backgroundColor: '#289653'
                                            }}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                onEdit(transaction);
                                                onClose();
                                            }}
                                        >
                                            <Feather name="edit-3" size={16} color="#FFF" />
                                            <Text variant="body" fontWeight="600" style={{ color: '#FFF', fontSize: moderateScale(15) }}>
                                                {t('common.edit')}
                                            </Text>
                                        </TouchableOpacity>
                                    </Box>
                                </Box>
                            </MotiView>
                        </TouchableWithoutFeedback>
                    </Box>
                </TouchableWithoutFeedback>
            </Modal>

            <ConfirmationModal
                visible={isConfirmOpen}
                title={t('common.delete')}
                description={t('transactions.confirmDelete')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                isDestructive={true}
            />
        </>
    );
}

export function RecentTransactions({
    transactions,
    isVisible = true,
    onEdit,
    onDelete,
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
    onTransactionCreated
}: RecentTransactionsProps) {
    const { t, i18n } = useTranslation();
    const { formatCurrency: formatCurrencyValue } = useCurrency();
    const [showAll, setShowAll] = useState(false);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const formatDate = useCallback((dateString?: string | null, createdAtString?: string | null) => {
        const targetDate = dateString || createdAtString;
        if (!targetDate) return '';

        const date = dateString ? parseDateOnly(dateString) : parseDatabaseTimestamp(createdAtString);
        if (!date) return '';
        const locale = i18n.language.startsWith('en') ? 'en-US' : 'pt-BR';
        return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(date).replace('.', '');
    }, [i18n.language]);

    const formatCurrency = useCallback((value: number, isExpense: boolean) => {
        const formatted = formatCurrencyValue(value);
        return isExpense ? `-${formatted}` : formatted;
    }, [formatCurrencyValue]);

    const processedTransactions = useMemo(() => {
        if (!showAll) {
            return transactions.slice(0, 5);
        }
        return transactions;
    }, [transactions, showAll]);

    const renderItem = useCallback(({ item }: { item: Transaction; index: number }) => {
        const isExpense = String(item.type).toLowerCase() === 'expense';
        const iconName = categoryIcons[item.title] || (isExpense ? 'arrow-down-left' : 'arrow-up-right');

        const statusColor = isExpense ? "#FF4747" : "#289653";
        const iconBgColor = isExpense ? "#FF47471A" : "#2896531A";

        return (
            <TouchableOpacity
                activeOpacity={0.65}
                onPress={() => setSelectedTransaction(item)}
            >
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        type: 'timing',
                        duration: 100,
                    }}
                >
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" width="100%" paddingVertical="xs">
                        <Box flexDirection="row" alignItems="center" flex={1} marginRight="s">
                            <Box width={44} height={44} borderRadius="xl" justifyContent="center" alignItems="center" marginRight="m" style={{ backgroundColor: iconBgColor }}>
                                <Feather name={iconName} size={18} color={statusColor} />
                            </Box>

                            <Box flex={1}>
                                <Text variant="body" fontWeight="600" color="textPrimary" style={{ letterSpacing: -0.1 }} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text variant="caption" color="textSecondary" style={{ marginTop: 3 }}>
                                    {formatDate(item.date, item.created_at)} • {isExpense ? t('transactions.expense') : t('transactions.income')}
                                </Text>
                            </Box>
                        </Box>

                        <Box justifyContent="center" alignItems="flex-end">
                            {isVisible ? (
                                <Text variant="body" fontWeight="600" style={{ color: statusColor, letterSpacing: -0.2 }}>
                                    {formatCurrency(item.amount, isExpense)}
                                </Text>
                            ) : (
                                <Text variant="body" color="textSecondary" fontWeight="bold" style={{ letterSpacing: 1 }}>••••••</Text>
                            )}
                        </Box>
                    </Box>
                </MotiView>
            </TouchableOpacity>
        );
    }, [isVisible, t, formatDate, formatCurrency]);

    return (
        <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
        >
            <Box width="100%" backgroundColor="card" padding="m" borderRadius="m" style={{ marginTop: scale(8) }}>
                <Box width="100%" height={46} justifyContent="center" marginBottom="xs">
                    <AnimatePresence exitBeforeEnter>
                        {!showAll ? (
                            <MotiView
                                key="title-section"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 100 }}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                            >
                                <Text variant="body" fontWeight="700" color="textPrimary" style={{ fontSize: moderateScale(16), letterSpacing: -0.3 }}>
                                    {t('transactions.recentTitle')}
                                </Text>
                                {(transactions.length > 5 || hasMore) && ( 
                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            setShowAll(true);
                                        }}
                                    >
                                    </TouchableOpacity>
                                )}
                            </MotiView>
                        ) : (
                            <MotiView
                                key="all-title-section"
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 100 }}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                            >
                                <Text variant="body" fontWeight="700" color="textPrimary" style={{ fontSize: moderateScale(16), letterSpacing: -0.3 }}>
                                    {t('transactions.recentTitle')}
                                </Text>
                                <TouchableOpacity activeOpacity={0.6} onPress={() => setShowAll(false)}>
                                    <Text variant="body" fontWeight="600" color="income">{t('transactions.seeLess')}</Text>
                                </TouchableOpacity>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </Box>

                <Box width="100%" style={showAll ? { maxHeight: verticalScale(350) } : undefined}>
                    <OtimizedList
                        data={processedTransactions}
                        renderItem={renderItem}
                        estimatedItemSize={58}
                        keyExtractor={(item: any) => item.id.toString()}
                        showsVerticalScrollIndicator={showAll}
                        scrollEnabled={showAll}
                        nestedScrollEnabled={true}
                        contentContainerStyle={{ paddingBottom: scale(4) }}
                        onEndReached={showAll && hasMore && !isLoadingMore ? onLoadMore : undefined}
                        onEndReachedThreshold={0.4}
                        ListFooterComponent={
                            isLoadingMore ? (
                                <Box paddingVertical="s">
                                    <Skeleton width="100%" height={44} borderRadius={12} />
                                </Box>
                            ) : null
                        }
                        ListEmptyComponent={
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingVertical: 24 }}>
                                <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                                    {t("transactions.emptyTransactions")}
                                </Text>
                            </MotiView>
                        }
                    />
                </Box>

                <TransactionDetailsModal
                    isOpen={selectedTransaction !== null}
                    transaction={selectedTransaction}
                    isVisible={isVisible}
                    onClose={() => setSelectedTransaction(null)}
                    onDelete={(tx) => onDelete(tx.id)}
                    onEdit={(tx) => onEdit(tx)}
                />
            </Box>
        </MotiView>
    );
}

export function RecentTransactionsSkeleton() {
    return (
        <Box width="100%" backgroundColor="card" padding="m" borderRadius="m" style={{ marginTop: scale(8) }}>
            <Box width="100%" height={46} justifyContent="center" marginBottom="xs">
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
                    <Skeleton width={140} height={18} borderRadius={4} />
                    <Skeleton width={60} height={16} borderRadius={4} />
                </Box>
            </Box>

            <Box width="100%">
                {[1, 2, 3].map((index) => (
                    <Box key={index} flexDirection="row" justifyContent="space-between" alignItems="center" width="100%" paddingVertical="xs" style={{ paddingVertical: verticalScale(9) }}>
                        <Box flexDirection="row" alignItems="center" flex={1} marginRight="s">
                            <Skeleton width={44} height={44} borderRadius={22} />
                            <Box flex={1} style={{ gap: scale(6), marginLeft: scale(14) }}>
                                <Skeleton width="70%" height={15} borderRadius={4} />
                                <Skeleton width="45%" height={12} borderRadius={4} />
                            </Box>
                        </Box>
                        <Box justifyContent="center" alignItems="flex-end">
                            <Skeleton width={65} height={16} borderRadius={4} />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
