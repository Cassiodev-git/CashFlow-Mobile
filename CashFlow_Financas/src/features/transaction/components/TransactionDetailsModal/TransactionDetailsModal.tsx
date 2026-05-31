import React, { useState } from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { Transactions as Transaction } from '../../types/Transactions';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal'; 
import { Box, Text, scale } from '@/theme/unistyles';

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
    const { t } = useTranslation(); // Corrigido: Chamada limpa e direta
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); 

    if (!transaction) return null;

    const isExpense = String(transaction.type).toLowerCase() === 'expense';
    
    // Mapeamento dinâmico de cores com base no tema do Unistyles
    const statusColorHex = isExpense ? "#FF4747" : "#289653"; 
    
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
                <AnimatePresence>
                    {isOpen && (
                        <TouchableWithoutFeedback onPress={onClose}>
                            <MotiView 
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'timing', duration: 200 }}
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <TouchableWithoutFeedback>
                                    <MotiView
                                        from={{ translateY: 350 }}
                                        animate={{ translateY: 0 }}
                                        exit={{ translateY: 350 }}
                                        transition={{ type: 'timing', duration: 250 }}
                                        style={{ width: '100%' }}
                                    >
                                        <Box
                                            backgroundColor="card"
                                            borderTopLeftRadius="xl"
                                            borderTopRightRadius="xl"
                                            paddingHorizontal="m"
                                            paddingTop="s"
                                            borderWidth={scale(1)}
                                            borderColor="inputBorder"
                                            style={{ paddingBottom: scale(34) }}
                                        >
                                            {/* Indicador de arrastar (Drag Indicator) */}
                                            <Box 
                                                width={38} 
                                                height={5} 
                                                backgroundColor="inputBorder" 
                                                borderRadius="m" 
                                                alignSelf="center" 
                                                marginBottom="m" 
                                            />

                                            {/* Cabeçalho */}
                                            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                                                <Text variant="body" fontWeight="600" color="textSecondary">
                                                    {t('transactions.detailsTitle')}
                                                </Text>
                                                <TouchableOpacity onPress={onClose} style={{ padding: scale(4) }}>
                                                    <Feather name="x" size={20} color="#6F7583" />
                                                </TouchableOpacity>
                                            </Box>

                                            {/* Bloco de Informações Principais */}
                                            <Box alignItems="center" marginBottom="l">
                                                <Box 
                                                    width={56} 
                                                    height={56} 
                                                    borderRadius="xl" 
                                                    justifyContent="center" 
                                                    alignItems="center" 
                                                    marginBottom="s"
                                                    style={{ backgroundColor: `${statusColorHex}1A` }}
                                                >
                                                    <Feather name={iconName} size={24} color={statusColorHex} />
                                                </Box>
                                                <Text variant="titleMedium" fontWeight="700" color="textPrimary" marginBottom="xs">
                                                    {transaction.title}
                                                </Text>
                                                <Text variant="titleLarge" fontWeight="800" style={{ color: statusColorHex, letterSpacing: -0.5 }}>
                                                    {isVisible ? `${isExpense ? '-' : ''}${formattedAmount}` : '••••••'}
                                                </Text>
                                            </Box>

                                            {/* Lista de Detalhes */}
                                            <Box 
                                                borderTopWidth={scale(1)} 
                                                borderBottomWidth={scale(1)} 
                                                borderColor="inputBorder" 
                                                paddingVertical="m" 
                                                marginBottom="l" 
                                                style={{ gap: scale(12) }}
                                            >
                                                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                    <Text variant="body" color="textSecondary">
                                                        {t('transactions.type', 'Tipo')}
                                                    </Text>
                                                    <Text variant="body" fontWeight="600" style={{ color: statusColorHex }}>
                                                        {isExpense ? t('transactions.expense') : t('transactions.income')}
                                                    </Text>
                                                </Box>
                                                
                                                {transaction.description && (
                                                    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                        <Text variant="body" color="textSecondary">
                                                            {t('transactions.description')}
                                                        </Text>
                                                        <Text 
                                                            variant="body" 
                                                            color="textPrimary" 
                                                            fontWeight="500"
                                                            numberOfLines={1} 
                                                            ellipsizeMode="tail" 
                                                            style={{ flex: 1, textAlign: 'right', marginLeft: scale(24) }}
                                                        >
                                                            {transaction.description}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Botões de Ação */}
                                            <Box flexDirection="row" style={{ gap: scale(12) }}>
                                                {/* Botão Deletar */}
                                                <TouchableOpacity 
                                                    style={[
                                                        styles.btnBase, 
                                                        { backgroundColor: `${statusColorHex}12`, borderWidth: scale(1), borderColor: `${statusColorHex}33` }
                                                    ]} 
                                                    activeOpacity={0.7}
                                                    onPress={() => setIsConfirmOpen(true)} 
                                                >
                                                    <Feather name="trash-2" size={16} color={statusColorHex} />
                                                    <Text variant="body" fontWeight="600" style={{ color: statusColorHex }}>
                                                        {t('common.delete')}
                                                    </Text>
                                                </TouchableOpacity>

                                                {/* Botão Editar */}
                                                <TouchableOpacity 
                                                    style={[styles.btnBase, { backgroundColor: isExpense ? '#FF4747' : '#289653' }]} 
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        onEdit(transaction);
                                                        onClose();
                                                    }}
                                                >
                                                    <Feather name="edit-3" size={16} color="#FFF" />
                                                    <Text variant="body" fontWeight="600" style={{ color: '#FFF' }}>
                                                        {t('common.edit')}
                                                    </Text>
                                                </TouchableOpacity>
                                            </Box>
                                        </Box>
                                    </MotiView>
                                </TouchableWithoutFeedback>
                            </MotiView>
                        </TouchableWithoutFeedback>
                    )}
                </AnimatePresence>
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
    btnBase: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
});