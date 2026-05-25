import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView, AnimatePresence } from 'moti';
import { FlashList } from '@shopify/flash-list';
import { Transactions as Transaction } from '../../types/Transactions';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal'; 
import { ScaledSheet } from '@/utils/responsive';
import { Skeleton } from '@/components/Skeleton/Skeleton'; // Certifique-se de ajustar este import para o seu caminho real

const OtimizedList = FlashList as React.ComponentType<any>;

interface RecentTransactionsProps {
    transactions: Transaction[];
    isVisible?: boolean;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    if (!transaction) return null;

    const isExpense = String(transaction.type).toLowerCase() === 'expense';
    const statusColor = isExpense ? colors.expense : colors.income;
    const iconName = categoryIcons[transaction.title] || (isExpense ? 'arrow-down-left' : 'arrow-up-right');

    const formattedAmount = transaction.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

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
                    <View style={modalStyles.backdrop}>
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
                                style={modalStyles.sheetContainer}
                            >
                                <View style={modalStyles.dragIndicator} />

                                <View style={modalStyles.header}>
                                    <Text style={modalStyles.headerTitle}>{t('transactions.detailsTitle')}</Text>
                                    <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
                                        <Feather name="x" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={modalStyles.infoBlock}>
                                    <View style={[modalStyles.iconBg, { backgroundColor: `${statusColor}1A` }]}>
                                        <Feather name={iconName} size={22} color={statusColor} />
                                    </View>
                                    <Text style={modalStyles.transactionTitle} numberOfLines={1}>{transaction.title}</Text>
                                    <Text style={[modalStyles.transactionAmount, { color: statusColor }]}>
                                        {isVisible ? `${isExpense ? '-' : ''}${formattedAmount}` : '••••••'}
                                    </Text>
                                </View>

                                <View style={modalStyles.detailsList}>
                                    <View style={modalStyles.detailRow}>
                                        <Text style={modalStyles.detailLabel}>{t('transactions.type')}</Text>
                                        <Text style={[modalStyles.detailValue, { color: statusColor, fontWeight: '600' }]}>
                                            {isExpense ? t('transactions.expense') : t('transactions.income')}
                                        </Text>
                                    </View>
                                    {transaction.description && (
                                        <View style={modalStyles.detailRow}>
                                            <Text style={modalStyles.detailLabel}>{t('transactions.description', 'Descrição')}</Text>
                                            <Text
                                                style={[modalStyles.detailValue, modalStyles.descriptionValue]}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {transaction.description}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={modalStyles.actionRow}>
                                    <TouchableOpacity
                                        style={[modalStyles.btn, modalStyles.btnDelete]}
                                        activeOpacity={0.7}
                                        onPress={() => setIsConfirmOpen(true)} 
                                    >
                                        <Feather name="trash-2" size={16} color={colors.expense} />
                                        <Text style={modalStyles.btnDeleteText}>{t('common.delete')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[modalStyles.btn, modalStyles.btnEdit]}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            onEdit(transaction);
                                            onClose();
                                        }}
                                    >
                                        <Feather name="edit-3" size={16} color="#FFF" />
                                        <Text style={modalStyles.btnEditText}>{t('common.edit')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>
                        </TouchableWithoutFeedback>
                    </View>
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
    onTransactionCreated
}: RecentTransactionsProps) {
    const { t } = useTranslation();
    const [showAll, setShowAll] = useState(false);
    const [inputQuery, setInputQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(inputQuery);
        }, 180);
        return () => clearTimeout(handler);
    }, [inputQuery]);

    const formatDate = useCallback((dateString?: string | null, createdAtString?: string | null) => {
        const targetDate = dateString || createdAtString;
        if (!targetDate) return '';

        const date = new Date(targetDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        return `${day} de ${month}`;
    }, []);

    const formatCurrency = useCallback((value: number, isExpense: boolean) => {
        const formatted = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        return isExpense ? `-${formatted}` : formatted;
    }, []);

    const processedTransactions = useMemo(() => {
        let result = transactions;

        if (searchQuery.trim() !== '') {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (!showAll) {
            return result.slice(0, 5);
        }
        return result.slice(0, 50);
    }, [transactions, showAll, searchQuery]);

    const renderItem = useCallback(({ item, index }: { item: Transaction; index: number }) => {
        const isExpense = String(item.type).toLowerCase() === 'expense';
        const iconName = categoryIcons[item.title] || (isExpense ? 'arrow-down-left' : 'arrow-up-right');

        const statusColor = isExpense ? colors.expense : colors.income;
        const iconBgColor = isExpense ? `${colors.expense}1A` : `${colors.income}1A`;

        return (
            <TouchableOpacity
                activeOpacity={0.65}
                onPress={() => setSelectedTransaction(item)}
            >
                <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateY: 15 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                    transition={{
                        type: 'timing',
                        duration: 220,
                        delay: showAll ? 0 : Math.min(index * 30, 120)
                    }}
                    style={styles.transactionCard}
                >
                    <View style={styles.leftRow}>
                        <View style={[styles.iconBg, { backgroundColor: iconBgColor }]}>
                            <Feather name={iconName} size={18} color={statusColor} />
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.transactionTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.transactionSub}>
                                {formatDate(item.date, item.created_at)} • {isExpense ? t('transactions.expense') : t('transactions.income')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.valueContainer}>
                        <AnimatePresence exitBeforeEnter>
                            {isVisible ? (
                                <MotiView
                                    key="visible-amount"
                                    from={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'timing', duration: 150 }}
                                >
                                    <Text style={[styles.amountText, { color: statusColor }]}>
                                        {formatCurrency(item.amount, isExpense)}
                                    </Text>
                                </MotiView>
                            ) : (
                                <MotiView
                                    key="hidden-amount"
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 120 }}
                                >
                                    <Text style={styles.hiddenText}>••••••</Text>
                                </MotiView>
                            )}
                        </AnimatePresence>
                    </View>
                </MotiView>
            </TouchableOpacity>
        );
    }, [isVisible, t, formatDate, formatCurrency, showAll]);

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 450 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <AnimatePresence exitBeforeEnter>
                    {!showAll ? (
                        <MotiView
                            key="title-section"
                            from={{ opacity: 0, translateX: -10 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            exit={{ opacity: 0, translateX: -10 }}
                            transition={{ type: 'timing', duration: 180 }}
                            style={styles.titleRow}
                        >
                            <Text style={styles.title}>{t('transactions.recentTitle')}</Text>
                            {transactions.length > 5 && ( 
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        setShowAll(true);
                                        setInputQuery('');
                                    }}
                                >
                                    <Text style={styles.viewAllBtn}>{t('transactions.seeAll')}</Text>
                                </TouchableOpacity>
                            )}
                        </MotiView>
                    ) : (
                        <MotiView
                            key="search-section"
                            from={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ type: 'timing', duration: 180 }}
                            style={styles.searchContainer}
                        >
                            <Feather name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('transactions.searchPlaceholder')}
                                placeholderTextColor={colors.placeholder}
                                value={inputQuery}
                                onChangeText={setInputQuery}
                                autoFocus={true}
                            />

                            <TouchableOpacity
                                style={styles.closeSearchBtn}
                                onPress={() => {
                                    setShowAll(false);
                                    setInputQuery('');
                                }}
                            >
                                <Text style={styles.seeLessText}>{t('transactions.seeLess')}</Text>
                            </TouchableOpacity>
                        </MotiView>
                    )}
                </AnimatePresence>
            </View>

            <View style={[styles.listWrapper, showAll && styles.scrollActive]}>
                <OtimizedList
                    data={processedTransactions}
                    renderItem={renderItem}
                    estimatedItemSize={58}
                    keyExtractor={(item: any) => item.id.toString()}
                    showsVerticalScrollIndicator={showAll}
                    scrollEnabled={showAll}
                    nestedScrollEnabled={true} 
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingVertical: 24 }}>
                            <Text style={styles.emptyText}>{t("transactions.emptyTransactions")}</Text>
                        </MotiView>
                    }
                />
            </View>

            <TransactionDetailsModal
                isOpen={selectedTransaction !== null}
                transaction={selectedTransaction}
                isVisible={isVisible}
                onClose={() => setSelectedTransaction(null)}
                onDelete={(tx) => onDelete(tx.id)}
                onEdit={(tx) => onEdit(tx)}
            />
        </MotiView>
    );
}


export function RecentTransactionsSkeleton() {
    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Skeleton width={140} height={18} borderRadius={4} />
                    <Skeleton width={60} height={16} borderRadius={4} />
                </View>
            </View>

            <View style={styles.listWrapper}>
                {[1, 2, 3].map((index) => (
                    <View key={index} style={[styles.transactionCard, { paddingVertical: 9 }]}>
                        <View style={styles.leftRow}>
                            <Skeleton width={44} height={44} borderRadius={22} />
                            <View style={[styles.textContainer, { gap: 6, marginLeft: 14 }]}>
                                <Skeleton width="70%" height={15} borderRadius={4} />
                                <Skeleton width="45%" height={12} borderRadius={4} />
                            </View>
                        </View>
                        <View style={styles.valueContainer}>
                            <Skeleton width={65} height={16} borderRadius={4} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: { width: '100%', marginTop: 8, backgroundColor: colors.card, padding: 15, borderRadius: 16 },
    header: { width: '100%', height: 46, justifyContent: 'center', marginBottom: 8 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
    viewAllBtn: { fontSize: 14, fontWeight: '600', color: colors.income },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderRadius: 14, paddingLeft: 14, borderWidth: 1, borderColor: colors.inputBorder, width: '100%', height: '100%' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: '100%', fontSize: 14, color: colors.textPrimary },
    closeSearchBtn: { height: '100%', justifyContent: 'center', paddingHorizontal: 14 },
    seeLessText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    listWrapper: { width: '100%' },
    scrollActive: { height: 260, maxHeight: 260 },
    listContent: { paddingBottom: 4 },
    transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 7 },
    leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    iconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    textContainer: {  flex: 1 },
    transactionTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.1 },
    transactionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
    valueContainer: { justifyContent: 'center', alignItems: 'flex-end' },
    amountText: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
    hiddenText: { fontSize: 14, color: colors.textSecondary, fontWeight: 'bold', letterSpacing: 1 },
    emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 14 }
});

const modalStyles = ScaledSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' }, 
    sheetContainer: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 12, paddingTop: 12, width: '100%', borderWidth: 1, borderColor: colors.inputBorder },
    dragIndicator: { width: 38, height: 5, backgroundColor: colors.inputBorder, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
    closeBtn: { padding: 4 },
    infoBlock: { alignItems: 'center', marginBottom: 24 },
    iconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    transactionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
    transactionAmount: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    detailsList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.inputBorder, paddingVertical: 16, marginBottom: 24, gap: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontSize: 14, color: colors.textSecondary },
    detailValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
    descriptionValue: { flex: 1, textAlign: 'right', marginLeft: 24 },
    actionRow: { flexDirection: 'row', gap: 12 },
    btn: { flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    btnEdit: { backgroundColor: colors.income },
    btnEditText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
    btnDelete: { backgroundColor: `${colors.expense}12`, borderWidth: 1, borderColor: `${colors.expense}26` },
    btnDeleteText: { color: colors.expense, fontSize: 15, fontWeight: '600' }
});