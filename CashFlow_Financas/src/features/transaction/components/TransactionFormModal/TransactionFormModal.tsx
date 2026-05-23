import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
import { colors } from '@/theme';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import AppTransactionsService from '@/services/AppTransactionsService';
import AppCategoryService from '@/services/AppCategoryService';

// Types
import { Transactions as Transaction } from '../../types/Transactions';
import { ScaledSheet, verticalScale } from '@/utils/responsive'; 

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
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    
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
                console.error("Erro ao listar categorias:", err);
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

    const dynamicButtonBottom = insets.bottom > 0 ? insets.bottom + 12 : 16;

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
                                    <View style={[styles.header, isKeyboardVisible && styles.headerCompact]}>
                                        <Text style={styles.formTitle}>
                                            {isEditMode ? t("transactions.editTitle", "Editar Transação") : t("transactions.newTransaction")}
                                        </Text>
                                    </View>

                                    <ScrollView 
                                        style={styles.formContent} 
                                        contentContainerStyle={[styles.formContentContainer, isKeyboardVisible && styles.formContentContainerCompact]} 
                                        showsVerticalScrollIndicator={true} 
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>{t("transactions.title", "Título")}</Text>
                                            <TextInput style={styles.input} placeholder={t("transactions.titlePlaceholder")} placeholderTextColor={colors.placeholder} value={title} onChangeText={setTitle} maxLength={20} />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>{t("transactions.descriptionLabel")}</Text>
                                            <TextInput style={[styles.input, styles.multilineInput, isKeyboardVisible && styles.multilineInputCompact]} placeholder={t("transactions.descriptionPlaceholder", "Opcional")} placeholderTextColor={colors.placeholder} value={description} onChangeText={setDescription} multiline textAlignVertical="top" maxLength={120} />
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.inputGroup, styles.halfInputLeft]}>
                                                <Text style={styles.inputLabel}>{t("transactions.amountLabel")}</Text>
                                                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor={colors.placeholder} keyboardType="numeric" value={amount} onChangeText={setAmount} />
                                            </View>

                                            <View style={[styles.inputGroup, styles.halfInputRight]}>
                                                <Text style={styles.inputLabel}>{t("transactions.dateLabel")}</Text>
                                                <TextInput style={styles.input} placeholder={i18n.language.startsWith('en') ? "YYYY-MM-DD" : "DD/MM/YYYY"} placeholderTextColor={colors.placeholder} keyboardType="numeric" maxLength={10} value={date} onChangeText={(text) => setDate(applyDateMask(text, i18n.language))} />
                                            </View>
                                        </View>

                                        {!isKeyboardVisible && (
                                            <>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>{t("transactions.typeLabel")}</Text>
                                                    <View style={styles.choiceRow}>
                                                        {(['income', 'expense'] as const).map((option) => {
                                                            const isSelected = type === option;
                                                            return (
                                                                <TouchableOpacity key={option} style={[styles.choiceButton, isSelected && styles.choiceButtonActive]} onPress={() => { setType(option); setCategoryId(''); }}>
                                                                    <Text style={[styles.choiceButtonText, isSelected && styles.choiceButtonTextActive]}>{t(`transactions.${option}`)}</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>

                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>{t("transactions.statusLabel")}</Text>
                                                    <View style={styles.choiceRow}>
                                                        {(['pending', 'paid', 'canceled'] as const).map((option) => {
                                                            const isSelected = status === option;
                                                            return (
                                                                <TouchableOpacity key={option} style={[styles.choiceButton, isSelected && styles.choiceButtonActive]} onPress={() => setStatus(option)}>
                                                                    <Text style={[styles.choiceButtonText, isSelected && styles.choiceButtonTextActive]}>{t(`transactions.status.${option}`)}</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>

                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>{t("transactions.categoryLabel")}</Text>
                                                    {loadingCategories ? (
                                                        <Text style={styles.helperText}>{t("common.loading")}</Text>
                                                    ) : filteredCategories.length > 0 ? (
                                                        <View style={styles.choiceRow}>
                                                            {filteredCategories.map((cat) => {
                                                                const isSelected = categoryId === cat.id;
                                                                return (
                                                                    <TouchableOpacity key={cat.id} style={[styles.choiceButton, isSelected && styles.choiceButtonActive]} onPress={() => setCategoryId(cat.id)}>
                                                                        <Text style={[styles.choiceButtonText, isSelected && styles.choiceButtonTextActive]}>{cat.name}</Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    ) : (
                                                        <Text style={styles.helperText}>{t("categories.createCategory")}</Text>
                                                    )}
                                                </View>
                                            </>
                                        )}
                                        {!!error && <Text style={styles.errorText}>{error}</Text>}

                                        <View style={styles.buttonRow}>
                                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
                                                <Text style={styles.saveButtonText}>
                                                    {loading ? t("common.loading") : isEditMode ? t("common.save") : t("transactions.add")}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
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
                                    <Feather name="plus" size={26} color={colors.textInverse} />
                                </MotiView>
                            </TouchableOpacity>
                        )}
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </BlurView>
        </Modal>
    );
}

const styles = ScaledSheet.create({
    fullScreenOverlay: { flex: 1, justifyContent: 'center' },
    modalCenteredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, width: '100%' },
    plusButtonCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', shadowColor: colors.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    bottomBarCloseButton: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', zIndex: 30 },
    formCard: { width: '100%', backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 10, overflow: 'hidden' },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: colors.surface },
    headerCompact: { paddingTop: 14, paddingBottom: 8 },
    formContent: { width: '100%' },
    formContentContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
    formContentContainerCompact: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
    formTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, textAlign: 'left' },
    inputGroup: { width: '100%', marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    halfInputLeft: { flex: 1 },
    halfInputRight: { flex: 1 },
    multilineInput: { minHeight: 90, paddingTop: 12, height: 90 },
    multilineInputCompact: { minHeight: 48, height: 48 },
    errorText: { color: colors.danger, fontSize: 12, marginBottom: 8, marginTop: 4, textAlign: "center" },
    inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
    input: { width: '100%', height: 46, backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.inputBorder, fontSize: 15, color: colors.textPrimary },
    helperText: { color: colors.textSecondary, fontSize: 13, paddingVertical: 2 },
    choiceRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    choiceButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.surface },
    choiceButtonActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    choiceButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
    choiceButtonTextActive: { color: colors.primaryDark },
    buttonRow: { width: '100%', marginTop: 12 },
    saveButton: { width: '100%', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: colors.primaryDark },
    saveButtonText: { fontSize: 15, fontWeight: '600', color: colors.textInverse }
});