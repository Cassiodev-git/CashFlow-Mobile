import React, { useState } from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal'; 
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { Transactions as Transaction } from '../../types/Transactions';

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    isVisible?: boolean;
}

type TransactionStatus = 'paid' | 'canceled' | 'pending';

export function TransactionDetailsModal({ 
    isOpen, 
    onClose, 
    transaction, 
    onEdit, 
    onDelete,
    isVisible = true 
}: TransactionDetailsModalProps) {
    const { t, i18n } = useTranslation();
    const theme = useTheme<Theme>();
    const insets = useSafeAreaInsets();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    if (!transaction) return null;

    const isExpense = String(transaction.type).toLowerCase() === 'expense';
    const statusColorHex = isExpense ? theme.colors.expense : theme.colors.income; 
    const deleteColorHex = theme.colors.expense;
    const editColorHex = theme.colors.income;
    const iconName = isExpense ? 'arrow-down-left' : 'arrow-up-right';
    
    const rawStatus = transaction.status;
    const status: TransactionStatus = rawStatus === 'paid' || rawStatus === 'canceled' || rawStatus === 'pending'
        ? rawStatus
        : 'pending';
    const statusColor = {
        paid: theme.colors.income,
        canceled: theme.colors.danger,
        pending: theme.colors.warning,
    }[status];
    const statusBackgroundColor = `${statusColor}1A`;

    const formattedAmount = transaction.amount.toLocaleString(i18n.language, {
        style: 'currency',
        currency: 'BRL',
    });

    const handleConfirmDelete = () => {
        setIsConfirmOpen(false);
        onDelete(transaction);
        onClose(); 
    };

    const bottomPadding = insets.bottom > 0 ? insets.bottom + scale(16) : scale(32);

    return (
        <>
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={onClose}
            >
                <Box flex={1} justifyContent="flex-end">
                    <AnimatePresence>
                        {isOpen && (
                            <TouchableWithoutFeedback onPress={onClose}>
                                <MotiView 
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 200 }}
                                    style={styles.overlay}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isOpen && (
                            <MotiView 
                                key={transaction.id}
                                from={{ translateY: 400 }}
                                animate={{ translateY: 0 }}
                                exit={{ translateY: 400 }}
                                transition={{ type: 'timing', duration: 250 }}
                                style={styles.modalWrapper}
                            >
                                <TouchableWithoutFeedback>
                                    <Box
                                        backgroundColor="card"
                                        borderTopLeftRadius="xl"
                                        borderTopRightRadius="xl"
                                        paddingHorizontal="m"
                                        paddingTop="s"
                                        style={{ paddingBottom: bottomPadding }}
                                    >
                                        <Box width={38} height={5} backgroundColor="inputBorder" borderRadius="m" alignSelf="center" marginBottom="m" />

                                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                                            <Text variant="body" fontWeight="600" color="textSecondary">{t('transactions.detailsTitle')}</Text>
                                            <TouchableOpacity onPress={onClose} style={{ padding: scale(4) }}>
                                                <Feather name="x" size={20} color={theme.colors.textSecondary} />
                                            </TouchableOpacity>
                                        </Box>

                                        <Box alignItems="center" marginBottom="l">
                                            <Box width={56} height={56} borderRadius="xl" justifyContent="center" alignItems="center" marginBottom="s" style={{ backgroundColor: `${statusColorHex}1A` }}>
                                                <Feather name={iconName} size={24} color={statusColorHex} />
                                            </Box>
                                            <Text variant="titleMedium" fontWeight="700" color="textPrimary" marginBottom="xs">{transaction.title}</Text>
                                            <Text variant="titleLarge" fontWeight="800" style={{ color: statusColorHex }}>
                                                {isVisible ? `${isExpense ? '-' : ''}${formattedAmount}` : '••••••'}
                                            </Text>
                                        </Box>

                                        <Box borderTopWidth={scale(1)} borderBottomWidth={scale(1)} borderColor="inputBorder" paddingVertical="m" marginBottom="l" style={{ gap: scale(12) }}>
                                            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                <Text variant="body" color="textSecondary">{t('transactions.type')}</Text>
                                                <Text variant="body" fontWeight="600" style={{ color: statusColorHex }}>{isExpense ? t('transactions.expense') : t('transactions.income')}</Text>
                                            </Box>
                                            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                <Text variant="body" color="textSecondary">{t('transactions.statusLabel')}</Text>
                                                <Box style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
                                                    <Text variant="caption" fontWeight="700" style={{ color: statusColor }}>
                                                        {t(`transactions.status.${status}`)}
                                                    </Text>
                                                </Box>
                                            </Box>
                                            {transaction.description && (
                                                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                    <Text variant="body" color="textSecondary">{t('transactions.descriptionLabel')}</Text>
                                                    <Text variant="body" color="textPrimary" fontWeight="500" numberOfLines={1} style={{ flex: 1, textAlign: 'right', marginLeft: scale(24) }}>{transaction.description}</Text>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box flexDirection="row" style={{ gap: scale(12) }}>
                                            <TouchableOpacity style={[styles.button, { backgroundColor: `${deleteColorHex}12`, borderColor: `${deleteColorHex}33` }]} activeOpacity={0.7} onPress={() => setIsConfirmOpen(true)}>
                                                <Feather name="trash-2" size={16} color={deleteColorHex} />
                                                <Text variant="body" fontWeight="600" style={{ color: deleteColorHex }}>{t('common.delete')}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={[styles.button, { backgroundColor: editColorHex }]} activeOpacity={0.7} onPress={() => { onEdit(transaction); onClose(); }}>
                                                <Feather name="edit-3" size={16} color={theme.colors.textInverse} />
                                                <Text variant="body" fontWeight="600" color="textInverse">{t('common.edit')}</Text>
                                            </TouchableOpacity>
                                        </Box>
                                    </Box>
                                </TouchableWithoutFeedback>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </Box>
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

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalWrapper: {
        width: '100%',
    },
    button: {
        flex: 1,
        height: scale(48),
        borderRadius: scale(14),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(8),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusBadge: {
        borderRadius: scale(999),
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
    }
});
