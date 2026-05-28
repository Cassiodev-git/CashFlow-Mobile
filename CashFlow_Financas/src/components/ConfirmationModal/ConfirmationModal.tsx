import { colors } from '@/theme';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onClose: () => void;
    onConfirm: () => void;
    isDestructive?: boolean;
}

export function ConfirmationModal({
    visible,
    title,
    description,
    confirmText,
    cancelText,
    onClose,
    onConfirm,
    isDestructive = true,
}: ConfirmationModalProps) {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                style={[
                    styles.confirmButton, 
                    isDestructive ? styles.bgDestructive : styles.bgPrimary
                ]} 
                onPress={onConfirm}
                >
                <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>
    );
    }

    const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    bgDestructive: {
        backgroundColor: colors.danger,
    },
    bgPrimary: {
        backgroundColor: colors.chartBlue, 
    },
    confirmText: {
        color: colors.surface,
        fontWeight: '600',
        fontSize: 14,
    },
});