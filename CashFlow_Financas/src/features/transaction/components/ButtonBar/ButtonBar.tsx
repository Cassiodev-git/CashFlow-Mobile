import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
    DeviceEventEmitter,
    Pressable,
    Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import AppCategoryService from '@/services/AppCategoryService';
import { useTransactions } from '@/hooks/useTransactions';
import type { categories } from '@/features/category/schema';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/Skeleton/Skeleton';

interface ButtonBarProps {
    onTransactionCreated?: () => void | Promise<void>;
    onPress?: () => void;
    useExternalAction?: boolean;
}

type Category = typeof categories.$inferSelect;

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
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
};

export function ButtonBar({ onTransactionCreated, onPress, useExternalAction = false }: ButtonBarProps) {
    const { t, i18n } = useTranslation();
    const theme = useTheme<Theme>();
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { createTransaction } = useTransactions();
    const fullScreenModal = !useExternalAction;
    const bottomBarHeight = fullScreenModal ? scale(64) + insets.bottom : 0;
    
    const [isOpen, setIsOpen] = useState(false);
    const [externalModalOpen, setExternalModalOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [status, setStatus] = useState<'paid' | 'pending' | 'canceled'>('paid');
    
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [interval, setInterval] = useState('');
    const [endDate, setEndDate] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerError = (errorMessage: string) => {
        setError(errorMessage);
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => setError(''), 6000);
    };

    const resetForm = () => {
        setTitle(''); setDescription(''); setAmount(''); setDate(''); setCategoryId('');
        setType('expense'); setStatus('paid'); setIsRecurring(false);
        setFrequency('monthly'); setInterval(''); setEndDate(''); setError('');
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };

    const handleOpen = () => {
        if (useExternalAction) {
            onPress?.();
            return;
        }
        setIsOpen(true);
    };
    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => resetForm(), 300);
    };

    const handleBackdropPress = () => {
        Keyboard.dismiss();
        handleClose();
    };

    const handleSave = async () => {
        const normalizedTitle = title.trim();
        const normalizedAmount = Number(amount.replace(',', '.'));
        const normalizedDate = date.trim() ? formatToBackendDate(date.trim(), i18n.language) : undefined;

        if (!normalizedTitle || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
            triggerError(t("transactions.invalidCreateData"));
            return;
        }

        try {
            setLoading(true);
            Keyboard.dismiss();
            await createTransaction({
                title: normalizedTitle,
                description: description.trim() || undefined,
                amount: normalizedAmount,
                type,
                status,
                date: normalizedDate,
                category_id: categoryId.trim() || undefined,
                is_recurring: isRecurring,
                frequency: isRecurring ? frequency : undefined,
                interval: isRecurring ? (Number(interval) || 1) : undefined,
                end_date: (isRecurring && endDate) ? formatToBackendDate(endDate, i18n.language) : undefined,
            });

            DeviceEventEmitter.emit("transaction_mutated");
            setIsCompleted(true);
            handleClose();
            setTimeout(() => setIsCompleted(false), 800);
            await onTransactionCreated?.();
        } catch {
            triggerError(t("errors.unexpected"));
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((category) => category.type === type);

    useEffect(() => {
        if (isOpen) {
            setLoadingCategories(true);
            AppCategoryService.listCategories()
                .then(setCategories)
                .finally(() => setLoadingCategories(false));
        }
    }, [isOpen]);

    useEffect(() => {
        const stateSubscription = DeviceEventEmitter.addListener('transaction_form_modal_state', (event: { open: boolean; completed?: boolean }) => {
            setExternalModalOpen(event.open);
            if (event.completed) {
                setIsCompleted(true);
                setTimeout(() => setIsCompleted(false), 800);
            }
        });
        const closeSubscription = DeviceEventEmitter.addListener('transaction_form_close', () => {
            setExternalModalOpen(false);
        });
        return () => {
            stateSubscription.remove();
            closeSubscription.remove();
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        };
    }, []);

    useEffect(() => { setCategoryId(''); }, [type]);

    const showBasic = true;
    const showMiddle = true;
    const showRecurrence = true;

    return (
        <Box alignItems="center" justifyContent="center">
            <TouchableOpacity activeOpacity={0.85} onPress={() => {
                if (isOpen) handleClose();
                else if (externalModalOpen) DeviceEventEmitter.emit('transaction_form_close');
                else handleOpen();
            }}>
                <MotiView animate={{ rotate: '0deg', scale: isCompleted ? 1.12 : 1, backgroundColor: isCompleted ? theme.colors.success : (isOpen || externalModalOpen ? theme.colors.danger : theme.colors.primary) }} transition={{ type: 'timing', duration: 280 }} style={plusButtonStyle(theme)}>
                    <MotiView key={isCompleted ? 'completed' : (isOpen || externalModalOpen ? 'close' : 'add')} from={{ opacity: 0, scale: 0.5, rotate: '-45deg' }} animate={{ opacity: 1, scale: 1, rotate: '0deg' }} transition={{ type: 'timing', duration: 220 }}>
                        <Feather name={isCompleted ? 'check' : (isOpen || externalModalOpen ? 'x' : 'plus')} size={26} color={theme.colors.textInverse} />
                    </MotiView>
                </MotiView>
            </TouchableOpacity>

            <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent presentationStyle="overFullScreen" onRequestClose={handleClose}>
                <Box flex={1}>
                <BlurView intensity={70} tint="dark" style={[StyleSheet.absoluteFillObject, fullScreenModal && { bottom: bottomBarHeight }]}>
                    <Pressable style={StyleSheet.absoluteFillObject} onPress={handleBackdropPress} />
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: fullScreenModal ? 'flex-start' : 'center', paddingHorizontal: fullScreenModal ? 0 : scale(16), paddingTop: fullScreenModal ? insets.top + scale(8) : 0, paddingBottom: fullScreenModal ? 0 : scale(24) }}>
                        <AnimatePresence>
                            {isOpen && (
                                <MotiView from={{ opacity: 0, scale: fullScreenModal ? 1 : 0.9, translateY: fullScreenModal ? 0 : 30 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} exit={{ opacity: 0, scale: fullScreenModal ? 1 : 0.9, translateY: fullScreenModal ? 0 : 30 }} transition={{ type: 'timing', duration: 250 }} style={{ width: '100%', flex: fullScreenModal ? 1 : undefined, maxHeight: fullScreenModal ? undefined : Math.min(height * 0.85, 640) }}>
                                    <Box flex={fullScreenModal ? 1 : undefined} backgroundColor="card" borderRadius={fullScreenModal ? 'none' : 'xl'} borderWidth={fullScreenModal ? 0 : scale(1)} borderColor="border" overflow="hidden">
                                        <Box padding="m" borderBottomWidth={1} borderColor="inputBorder"><Text variant="titleMedium" fontWeight="700">{t("transactions.newTransaction")}</Text></Box>
                                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: scale(16) }}>
                                            {showBasic && (
                                                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 200 }}>
                                                    <Box width="100%" marginBottom="s"><Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.title")}</Text><TextInput style={inputStyle(theme)} placeholder={t("transactions.titlePlaceholder")} placeholderTextColor={theme.colors.textSecondary} value={title} onChangeText={setTitle} /></Box>
                                                    <Box width="100%" marginBottom="s"><Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.descriptionLabel")}</Text><TextInput style={[inputStyle(theme), { height: scale(80) }]} multiline placeholder={t("transactions.descriptionPlaceholder")} placeholderTextColor={theme.colors.textSecondary} value={description} onChangeText={setDescription} /></Box>
                                                </MotiView>
                                            )}
                                            {showMiddle && (
                                                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 200 }}>
                                                    <Box flexDirection="row" gap="s" marginBottom="s">
                                                        <Box flex={1}><Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.amountLabel")}</Text><TextInput style={inputStyle(theme)} placeholder={t("transactions.amountPlaceholder")} placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" value={amount} onChangeText={setAmount} /></Box>
                                                        <Box flex={1}><Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.dateLabel")}</Text><TextInput style={inputStyle(theme)} placeholder={i18n.language.startsWith('en') ? t("transactions.datePlaceholder") : t("transactions.datePlaceholderLocal")} placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" maxLength={10} value={date} onChangeText={(t) => setDate(applyDateMask(t, i18n.language))} /></Box>
                                                    </Box>
                                                    <Box marginBottom="s"><Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.typeLabel")}</Text><Box flexDirection="row" gap="s">{(['income', 'expense'] as const).map((opt) => (<TouchableOpacity key={opt} style={[choiceButtonStyle(theme), type === opt && activeChoiceStyle(theme)]} onPress={() => setType(opt)}><Text color={type === opt ? 'primary' : 'textSecondary'}>{t(`transactions.${opt}`)}</Text></TouchableOpacity>))}</Box></Box>
                                                    
                                                    <Box marginBottom="s">
                                                        <Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.statusLabel")}</Text>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: scale(8) }}>
                                                            {(['paid', 'pending', 'canceled'] as const).map((opt) => (
                                                                <TouchableOpacity key={opt} style={[choiceButtonStyle(theme), status === opt && activeChoiceStyle(theme)]} onPress={() => setStatus(opt)}>
                                                                    <Text color={status === opt ? 'primary' : 'textSecondary'}>{t(`transactions.status.${opt}`)}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    </Box>

                                                    <Box marginBottom="s">
                                                        <Text variant="body" fontWeight="600" marginBottom="xs">{t("transactions.categoryLabel")}</Text>
                                                        {loadingCategories ? <Skeleton width="60%" height={20} /> : (
                                                            <Box flexDirection="row" gap="s" flexWrap="wrap">
                                                                {filteredCategories.map((c) => (<TouchableOpacity key={c.id} style={[choiceButtonStyle(theme), categoryId === c.id && activeChoiceStyle(theme)]} onPress={() => setCategoryId(c.id)}><Text color={categoryId === c.id ? 'primary' : 'textSecondary'}>{c.name}</Text></TouchableOpacity>))}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </MotiView>
                                            )}
                                            {showRecurrence && (
                                                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 200 }} style={{ marginBottom: scale(8) }}>
                                                    <Box borderTopWidth={1} borderColor="inputBorder" paddingTop="s">
                                                        <>
                                                                <Text variant="body" fontWeight="600" marginBottom="xs">{t("recurrence.form.isRecurring")}</Text>
                                                                <TouchableOpacity style={[choiceButtonStyle(theme), isRecurring && activeChoiceStyle(theme)]} onPress={() => setIsRecurring(!isRecurring)}><Text color={isRecurring ? 'primary' : 'textSecondary'}>{isRecurring ? t("common.yes") : t("common.no")}</Text></TouchableOpacity>
                                                        </>
                                                        {isRecurring && (
                                                            <Box marginTop="s" padding="s" backgroundColor="inputBackground" borderRadius="s">
                                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: scale(8), marginBottom: scale(8) }}>{(['daily', 'weekly', 'monthly', 'yearly'] as const).map((f) => (<TouchableOpacity key={f} style={[choiceButtonStyle(theme), frequency === f && activeChoiceStyle(theme)]} onPress={() => setFrequency(f)}><Text variant="caption" color={frequency === f ? 'primary' : 'textSecondary'}>{t(`recurrence.frequency.${f}`)}</Text></TouchableOpacity>))}</ScrollView>
                                                                <TextInput style={[inputStyle(theme), { marginBottom: scale(8) }]} placeholder={t("recurrence.form.intervalPlaceholder")} placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" value={interval} onChangeText={setInterval} />
                                                                <TextInput style={inputStyle(theme)} placeholder={i18n.language.startsWith('en') ? t("recurrence.form.endDatePlaceholder") : t("recurrence.form.endDatePlaceholderLocal")} placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" maxLength={10} value={endDate} onChangeText={(t) => setEndDate(applyDateMask(t, i18n.language))} />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </MotiView>
                                            )}
                                            {error ? <Box marginBottom="s" marginTop="s"><Text color="danger" variant="caption">{error}</Text></Box> : null}
                                            <TouchableOpacity style={saveButtonStyle(theme)} onPress={handleSave} disabled={loading}><Text color="textInverse" fontWeight="600">{loading ? t("common.loading") : t("transactions.add")}</Text></TouchableOpacity>
                                        </ScrollView>
                                    </Box>
                                </MotiView>
                            )}
                        </AnimatePresence>
                    </KeyboardAvoidingView>
                </BlurView>
                {fullScreenModal && <TouchableOpacity activeOpacity={1} onPress={handleClose} accessibilityLabel={t("common.close")} style={{ position: 'absolute', alignSelf: 'center', bottom: 0, width: scale(64), height: bottomBarHeight }} />}
                </Box>
            </Modal>
        </Box>
    );
}

const plusButtonStyle = (theme: Theme) => ({ width: scale(48), height: scale(48), borderRadius: scale(24), justifyContent: 'center' as const, alignItems: 'center' as const, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 });
const inputStyle = (theme: Theme) => ({ width: '100%' as const, height: scale(48), backgroundColor: theme.colors.inputBackground, borderRadius: scale(12), paddingHorizontal: scale(16), borderWidth: 1, borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary });
const choiceButtonStyle = (theme: Theme) => ({ paddingHorizontal: scale(12), paddingVertical: scale(8), borderRadius: scale(8), borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface });
const activeChoiceStyle = (theme: Theme) => ({ backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary });
const saveButtonStyle = (theme: Theme) => ({ width: '100%' as const, height: scale(48), justifyContent: 'center' as const, alignItems: 'center' as const, borderRadius: scale(12), backgroundColor: theme.colors.primary, marginTop: scale(8) });
