import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { Box, Text, scale } from '@/theme/unistyles';

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
    
    const confirmButtonBg = isDestructive ? "expense" : "primary"; 

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Box 
                flex={1} 
                backgroundColor="modalOverlay" 
                justifyContent="center" 
                alignItems="center" 
                paddingHorizontal="m"
            >
                <Box
                    backgroundColor="card"
                    borderRadius="xl"
                    padding="m"
                    width="100%"
                    style={{
                        maxWidth: scale(340),
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                    }}
                    alignItems="center"
                >
                    <Text variant="titleMedium" fontWeight="700" color="textPrimary" marginBottom="xs" style={{ textAlign: 'center' }}>
                        {title}
                    </Text>
                    
                    <Text variant="body" color="textSecondary" marginBottom="l" style={{ textAlign: 'center', lineHeight: scale(20) }}>
                        {description}
                    </Text>
                    
                    <Box flexDirection="row" style={{ gap: scale(12) }}>
                        {/* Botão Cancelar */}
                        <TouchableOpacity 
                            style={{ flex: 1, paddingVertical: scale(12), alignItems: 'center' }} 
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text variant="body" fontWeight="600" color="textSecondary">
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{ flex: 1 }} 
                            activeOpacity={0.85} 
                            onPress={onConfirm}
                        >
                            <Box
                                backgroundColor={confirmButtonBg}
                                paddingVertical="s"
                                borderRadius="m"
                                alignItems="center"
                                justifyContent="center"
                                style={{ height: scale(44) }}
                            >
                                <Text variant="body" fontWeight="600" style={{ color: '#FFF' }}>
                                    {confirmText}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}