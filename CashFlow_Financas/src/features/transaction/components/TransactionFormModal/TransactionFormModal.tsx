import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    useWindowDimensions,
    DeviceEventEmitter
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import AppTransactionsService from '@/services/AppTransactionsService';
import AppCategoryService from '@/services/AppCategoryService';

// Types
import { Transactions as Transaction } from '../../types/Transactions';
import { logger } from '@/utils/logger';
import { Box, Text, scale, verticalScale, type Theme } from '@/theme/unistyles';

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction | null; 
}

const applyDateMask = (value: string, lang: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (lang.startsWith('en')) {
        if (cleanValue.length <= 4) return cleanValue;
        if (cleanValue.length <= 6) return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4)}`;
        return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 6)}-${cleanValue.slice(6, 8)}`;
    } else {
        if (cleanValue.length <= 2) return cleanValue;
        if (cleanValue.length <= 4) return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
        return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
    }
};

const formatToBackendDate = (dateStr: string, lang: string): string => {
    if (!dateStr) return '';
    if (lang.startsWith('en')) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
    }
    return dateStr;
};

const formatFromBackendDate = (dateStr: string | null | undefined, lang: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (lang.startsWith('en')) {
        return `${year}-${month}-${day}`;
    }
    return `${day}/${month}/${year}`;
};

export function TransactionFormModal({ isOpen, onClose, transaction }: TransactionFormModalProps) {
    const { t, i18n } = useTranslation();
    const theme = useTheme<Theme>();
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const styles = createStyles(theme);
    
    const isEditMode = !!transaction;

    // Estados do Formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [status, setStatus] = useState<'paid' | 'pending' | 'canceled'>('pending');
    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (transaction) {
                setTitle(transaction.title);
                setDescription(transaction.description || '');
                setAmount(String(transaction.amount).replace('.', ','));
                
                const fallbackDate = transaction.date || (transaction as any).created_at || (transaction as any).createdAt;
                setDate(formatFromBackendDate(fallbackDate, i18n.language));
                
                setCategoryId(transaction.category_id || '');
                setType(transaction.type as 'income' | 'expense');
                setStatus(transaction.status as 'paid' | 'pending' | 'canceled');
            } else {
                setTitle('');
                setDescription('');
                setAmount('');
                setDate('');
                setCategoryId('');
                setType('expense');
                setStatus('pending');
            }
            setError('');
        }
    }, [isOpen, transaction, i18n.language]);

    useEffect(() => {
        async function loadCategories() {
            if (!isOpen) return;
            try {
                setLoadingCategories(true);
                const result = await AppCategoryService.listCategories();
                setCategories(result);
            } catch (err) {
                logger.error("Erro ao listar categorias:", err);
            } finally {
                setLoadingCategories(false);
            }
        }
        loadCategories();
    }, [isOpen]);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 6000); 

            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSave = async () => {
        const normalizedTitle = title.trim();
        const normalizedDescription = description.trim();
        const normalizedAmount = Number(amount.replace(',', '.'));
        const trimmedDate = date.trim();
        const normalizedDate = trimmedDate ? formatToBackendDate(trimmedDate, i18n.language) : undefined;
        const normalizedCategoryId = categoryId.trim();

        if (!normalizedTitle || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
            setError(t("transactions.invalidCreateData"));
            return;
        }

        if (normalizedDate) {
            if (normalizedDate.length !== 10) {
                setError(t("transactions.invalidDate"));
                return;
            }

            const partesAno = normalizedDate.split('-');
            const anoDigitado = Number(partesAno[0]);
            const mesDigitado = Number(partesAno[1]);
            const diaDigitado = Number(partesAno[2]);

            if (anoDigitado < 2000 || anoDigitado > new Date().getFullYear() + 2 || mesDigitado > 12 || diaDigitado > 31) {
                setError(t("transactions.dateOutRange"));
                return;
            }
        }

        try {
            setLoading(true);
            setError('');

            const payload = {
                title: normalizedTitle,
                description: normalizedDescription || undefined,
                amount: normalizedAmount,
                type,
                status,
                date: normalizedDate || undefined,
                category_id: normalizedCategoryId || undefined,
            };

            if (isEditMode && transaction) {
                await AppTransactionsService.updateTransaction(transaction.id, payload);
            } else {
                await AppTransactionsService.createTransaction(payload);
            }

            onClose();
            await new Promise(resolve => setTimeout(resolve, 120));
            DeviceEventEmitter.emit("transaction_mutated");
            
        } catch {
            setError(t("errors.unexpected"));
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((cat) => cat.type === type);

    const modalMaxHeight = isKeyboardVisible ? height * 0.52 : height * 0.75;

    const dynamicButtonBottom = insets.bottom > 0 ? insets.bottom + scale(12) : scale(16);

    return (
        <Modal visible={isOpen} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <BlurView intensity={70} tint="dark" style={styles.fullScreenOverlay}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
                        style={[
                            styles.modalCenteredContainer,
                            isKeyboardVisible && { justifyContent: 'flex-start', paddingTop: verticalScale(30) }
                        ]}
                    >
                        <AnimatePresence>
                            {isOpen && (
                                <MotiView
                                    from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, translateY: 30 }}
                                    transition={{ type: 'timing', duration: 220 }}
                                    style={[styles.formCard, { maxHeight: modalMaxHeight }]}
                                >
                                    <Box style={[styles.header, isKeyboardVisible && styles.headerCompact]}>
                                        <Text style={styles.formTitle}>
                                            {isEditMode ? t("transactions.editTitle", "Editar Transação") : t("transactions.newTransaction")}
                                        </Text>
                                    </Box>

                                    <ScrollView 
                                        style={styles.formContent} 
                                        contentContainerStyle={[styles.formContentContainer, isKeyboardVisible && styles.formContentContainerCompact]} 
                                        showsVerticalScrollIndicator={true} 
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        <Box style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>{t("transactions.title", "Título")}</Text>
                                            <TextInput style={styles.input} placeholder={t("transactions.titlePlaceholder")} placeholderTextColor={theme.colors.placeholder} value={title} onChangeText={setTitle} maxLength={20} />
                                        </Box>

                                        <Box style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>{t("transactions.descriptionLabel")}</Text>
                                            <TextInput style={[styles.input, styles.multilineInput, isKeyboardVisible && styles.multilineInputCompact]} placeholder={t("transactions.descriptionPlaceholder", "Opcional")} placeholderTextColor={theme.colors.placeholder} value={description} onChangeText={setDescription} multiline textAlignVertical="top" maxLength={120} />
                                        </Box>

                                        <Box style={styles.row}>
                                            <Box style={[styles.inputGroup, styles.halfInputLeft]}>
                                                <Text style={styles.inputLabel}>{t("transactions.amountLabel")}</Text>
                                                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor={theme.colors.placeholder} keyboardType="numeric" value={amount} onChangeText={setAmount} />
                                            </Box>

                                            <Box style={[styles.inputGroup, styles.halfInputRight]}>
                                                <Text style={styles.inputLabel}>{t("transactions.dateLabel")}</Text>
                                                <TextInput style={styles.input} placeholder={i18n.language.startsWith('en') ? "YYYY-MM-DD" : "DD/MM/YYYY"} placeholderTextColor={theme.colors.placeholder} keyboardType="numeric" maxLength={10} value={date} onChangeText={(text) => setDate(applyDateMask(text, i18n.language))} />
                                            </Box>
                                        </Box>

                                        {!isKeyboardVisible && (
                                            <>
                                                <Box style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>{t("transactions.typeLabel")}</Text>
                                                    <Box style={styles.choiceRow}>
                                                        {(['income', 'expense'] as const).map((option) => {
                                                            const isSelected = type === option;
                                                            return (
                                                                <TouchableOpacity key={option} style={[styles.choiceButton, isSelected && styles.choiceButtonActive]} onPress={() => { setType(option); setCategoryId(''); }}>
                                                                    <Text style={[styles.choiceButtonText, isSelected && styles.choiceButtonTextActive]}>{t(`transactions.${option}`)}</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </Box>
                                                </Box>

                                                <Box style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>{t("transactions.statusLabel")}</Text>
                                                    <Box style={styles.choiceRow}>
                                                        {(['pending', 'paid', 'canceled'] as const).map((option) => {
                                                            const isSelected = status === option;
                                                            return (
                                                                <TouchableOpacity key={option} style={[styles.choiceButton, isSelected && styles.choiceButtonActive]} onPress={() => setStatus(option)}>
                                                                    <Text style={[styles.choiceButtonText, isSelected && styles.choiceButtonTextActive]}>{t(`transactions.status.${option}`)}</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </Box>
                                                </Box>

                                                <Box style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>{t("transactions.categoryLabel")}</Text>
                                                    {loadingCategories ? (
                                                        <Text style={styles.helperText}>{t("common.loading")}</Text>
                                                    ) : filteredCategories.length > 0 ? (
                                                        <Box style={styles.choiceRow}>
                                                            {filteredCategories.map((cat) => {
                                                                const isSelected = categoryId === cat.id;
                                                                return (
                                                                    <TouchableOpacity key={cat.id} style={[styles.choiceButton, isSelected && styles.choiceButtonActive]} onPress={() => setCategoryId(cat.id)}>
                                                                        <Text style={[styles.choiceButtonText, isSelected && styles.choiceButtonTextActive]}>{cat.name}</Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </Box>
                                                    ) : (
                                                        <Text style={styles.helperText}>{t("categories.createCategory")}</Text>
                                                    )}
                                                </Box>
                                            </>
                                        )}
                                        {!!error && <Text style={styles.errorText}>{error}</Text>}

                                        <Box style={styles.buttonRow}>
                                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
                                                <Text style={styles.saveButtonText}>
                                                    {loading ? t("common.loading") : isEditMode ? t("common.save") : t("transactions.add")}
                                                </Text>
                                            </TouchableOpacity>
                                        </Box>
                                    </ScrollView>
                                </MotiView>
                            )}
                        </AnimatePresence>

                        {!isKeyboardVisible && (
                            <TouchableOpacity 
                                activeOpacity={0.85} 
                                onPress={onClose} 
                                style={[styles.bottomBarCloseButton, { bottom: dynamicButtonBottom }]}
                            >
                                <MotiView style={styles.plusButtonCircle} from={{ rotate: '0deg' }} animate={{ rotate: '135deg' }} transition={{ type: 'timing', duration: 220 }}>
                                    <Feather name="plus" size={26} color={theme.colors.textInverse} />
                                </MotiView>
                            </TouchableOpacity>
                        )}
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </BlurView>
        </Modal>
    );
}

const createStyles = (theme: Theme) => ({
    fullScreenOverlay: { flex: 1, justifyContent: 'center' },
    modalCenteredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16), width: '100%' },
    plusButtonCircle: { width: scale(48), height: scale(48), borderRadius: scale(24), backgroundColor: theme.colors.danger, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.danger, shadowOffset: { width: 0, height: scale(4) }, shadowOpacity: 0.3, shadowRadius: scale(5), elevation: 5 },
    bottomBarCloseButton: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', zIndex: 30 },
    formCard: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: scale(24), borderWidth: scale(1), borderColor: theme.colors.border, shadowColor: theme.colors.textPrimary, shadowOffset: { width: 0, height: scale(10) }, shadowOpacity: 0.15, shadowRadius: scale(14), elevation: 10, overflow: 'hidden' },
    header: { paddingHorizontal: scale(24), paddingTop: scale(24), paddingBottom: scale(16), borderBottomWidth: scale(1), borderBottomColor: theme.colors.divider, backgroundColor: theme.colors.surface },
    headerCompact: { paddingTop: scale(14), paddingBottom: scale(8) },
    formContent: { width: '100%' },
    formContentContainer: { paddingHorizontal: scale(24), paddingTop: scale(16), paddingBottom: scale(24) },
    formContentContainerCompact: { paddingHorizontal: scale(24), paddingTop: scale(8), paddingBottom: scale(16) },
    formTitle: { fontSize: scale(20), fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'left' },
    inputGroup: { width: '100%', marginBottom: scale(16) },
    row: { flexDirection: 'row', gap: scale(12), alignItems: 'flex-start' },
    halfInputLeft: { flex: 1 },
    halfInputRight: { flex: 1 },
    multilineInput: { minHeight: scale(90), paddingTop: scale(12), height: scale(90) },
    multilineInputCompact: { minHeight: scale(48), height: scale(48) },
    errorText: { color: theme.colors.danger, fontSize: scale(12), marginBottom: scale(8), marginTop: scale(4), textAlign: "center" },
    inputLabel: { fontSize: scale(14), fontWeight: '600', color: theme.colors.textPrimary, marginBottom: scale(6) },
    input: { width: '100%', height: scale(46), backgroundColor: theme.colors.inputBackground, borderRadius: scale(12), paddingHorizontal: scale(16), borderWidth: scale(1), borderColor: theme.colors.inputBorder, fontSize: scale(15), color: theme.colors.textPrimary },
    helperText: { color: theme.colors.textSecondary, fontSize: scale(13), paddingVertical: scale(2) },
    choiceRow: { flexDirection: 'row', gap: scale(8), flexWrap: 'wrap' },
    choiceButton: { paddingHorizontal: scale(14), paddingVertical: scale(10), borderRadius: scale(12), borderWidth: scale(1), borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface },
    choiceButtonActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
    choiceButtonText: { color: theme.colors.textSecondary, fontSize: scale(14), fontWeight: '600' },
    choiceButtonTextActive: { color: theme.colors.primaryDark },
    buttonRow: { width: '100%', marginTop: scale(12) },
    saveButton: { width: '100%', height: scale(48), justifyContent: 'center', alignItems: 'center', borderRadius: scale(12), backgroundColor: theme.colors.primaryDark },
    saveButtonText: { fontSize: scale(15), fontWeight: '600', color: theme.colors.textInverse }
} as const);
