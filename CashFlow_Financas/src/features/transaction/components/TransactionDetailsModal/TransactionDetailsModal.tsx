import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { MotiView, AnimatePresence } from 'moti';
import { Transactions as Transaction } from '../../types/Transactions';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal'; 

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    isVisible?: boolean;
}

export function TransactionDetailsModal({ 
    isOpen, 
    onClose, 
    transaction, 
    onEdit, 
    onDelete,
    isVisible = true 
}: TransactionDetailsModalProps) {
    const { t } = useTranslation();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    if (!transaction) return null;

    const isExpense = String(transaction.type).toLowerCase() === 'expense';
    const statusColor = isExpense ? colors.expense : colors.income;
    
    const iconName = isExpense ? 'arrow-down-left' : 'arrow-up-right';

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
                    <View style={styles.backdrop}>
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
                                from={{ translateY: 300 }}
                                animate={{ translateY: 0 }}
                                exit={{ translateY: 300 }}
                                transition={{ type: 'timing', duration: 250 }}
                                style={styles.sheetContainer}
                            >
                                <View style={styles.dragIndicator} />

                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>{t('transactions.detailsTitle')}</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                        <Feather name="x" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.infoBlock}>
                                    <View style={[styles.iconBg, { backgroundColor: `${statusColor}1A` }]}>
                                        <Feather name={iconName} size={24} color={statusColor} />
                                    </View>
                                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                                    <Text style={[styles.transactionAmount, { color: statusColor }]}>
                                        {isVisible ? `${isExpense ? '-' : ''}${formattedAmount}` : '••••••'}
                                    </Text>
                                </View>

                                <View style={styles.detailsList}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{t('transactions.type', 'Tipo')}</Text>
                                        <Text style={[styles.detailValue, { color: statusColor, fontWeight: '600' }]}>
                                            {isExpense ? t('transactions.expense') : t('transactions.income')}
                                        </Text>
                                    </View>
                                    
                                    {transaction.description && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{t('transactions.description')}</Text>
                                            <Text 
                                                style={[styles.detailValue, styles.descriptionValue]}
                                                numberOfLines={1} 
                                                ellipsizeMode="tail" 
                                            >
                                                {transaction.description}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity 
                                        style={[styles.btn, styles.btnDelete]} 
                                        activeOpacity={0.7}
                                        onPress={() => setIsConfirmOpen(true)} 
                                    >
                                        <Feather name="trash-2" size={16} color={colors.expense} />
                                        <Text style={styles.btnDeleteText}>{t('common.delete')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.btn, styles.btnEdit]} 
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            onEdit(transaction);
                                            onClose();
                                        }}
                                    >
                                        <Feather name="edit-3" size={16} color="#FFF" />
                                        <Text style={styles.btnEditText}>{t('common.edit')}</Text>
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

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: 34,
        paddingTop: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.inputBorder,
    },
    dragIndicator: {
        width: 38,
        height: 5,
        backgroundColor: colors.inputBorder,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    closeBtn: {
        padding: 4,
    },
    infoBlock: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    transactionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 6,
    },
    transactionAmount: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    detailsList: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.inputBorder,
        paddingVertical: 16,
        marginBottom: 28,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    descriptionValue: {
        flex: 1,              
        textAlign: 'right',  
        marginLeft: 24,       
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    btnEdit: {
        backgroundColor: colors.income,
    },
    btnEditText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    btnDelete: {
        backgroundColor: `${colors.expense}12`, 
        borderWidth: 1,
        borderColor: `${colors.expense}33`,
    },
    btnDeleteText: {
        color: colors.expense,
        fontSize: 15,
        fontWeight: '600',
    },
});