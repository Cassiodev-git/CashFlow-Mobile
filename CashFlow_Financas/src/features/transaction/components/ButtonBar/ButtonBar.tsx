import React, { useEffect, useState } from 'react';
import {
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
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import AppTransactionsService from '@/services/AppTransactionsService';
import AppCategoryService from '@/services/AppCategoryService';
import type { categories } from '@/features/category/schema';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

interface ButtonBarProps {
    onTransactionCreated?: () => void | Promise<void>;
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
    
    if (lang.startsWith('en')) {
        return dateStr;
    } else {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    }
};

export function ButtonBar({ onTransactionCreated }: ButtonBarProps) {
    const { t, i18n } = useTranslation();
    const theme = useTheme<Theme>();
    const { height } = useWindowDimensions();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [status, setStatus] = useState<'paid' | 'pending' | 'canceled'>('pending');
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setAmount('');
        setDate('');
        setCategoryId('');
        setType('expense');
        setStatus('pending');
        setError('');
    };

    const handleOpen = () => {
        setIsOpen(true);
        setDate('');
    };

    const handleClose = () => {
        resetForm();
        setIsOpen(false);
    };

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
                setError(t("transactions.invalidDate", "Insira uma data válida no formato DD/MM/AAAA."));
                return;
            }

            const partesAno = normalizedDate.split('-'); 
            const anoDigitado = Number(partesAno[0]);
            const mesDigitado = Number(partesAno[1]);
            const diaDigitado = Number(partesAno[2]);

            if (anoDigitado < 2000 || anoDigitado > new Date().getFullYear() + 2 || mesDigitado > 12 || diaDigitado > 31) {
                setError(t("transactions.dateOutRange", "Por favor, insira uma data válida a partir do ano 2000."));
                return;
            }
        }

        try {
            setLoading(true);
            setError('');

            const result = await AppTransactionsService.createTransaction({
                title: normalizedTitle,
                description: normalizedDescription || undefined,
                amount: normalizedAmount,
                type,
                status,
                date: normalizedDate || undefined,
                category_id: normalizedCategoryId || undefined,
            });

            if (!result) {
                setError(t("errors.unexpected"));
                return;
            }

            handleClose();

            await new Promise(resolve => setTimeout(resolve, 120));

            DeviceEventEmitter.emit("transaction_mutated");

            await onTransactionCreated?.();
            
        } catch {
            setError(t("errors.unexpected"));
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((category) => category.type === type);
    const shouldHideSecondaryFields = isKeyboardVisible;

    useEffect(() => {
        async function loadCategories() {
            if (!isOpen) return;

            try {
                setLoadingCategories(true);
                const result = await AppCategoryService.listCategories();
                setCategories(result);
            } finally {
                setLoadingCategories(false);
            }
        }

        loadCategories();
    }, [isOpen]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true);
        });

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 6000); 

            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <Box alignItems="center" justifyContent="center">
            {!isOpen && (
                <TouchableOpacity activeOpacity={0.85} onPress={handleOpen}>
                    <MotiView
                        animate={{ rotate: '0deg', backgroundColor: theme.colors.primary }}
                        transition={{ type: 'timing', duration: 220 }}
                        style={plusButtonStyle}
                    >
                        <Feather name="plus" size={26} color={theme.colors.textInverse} />
                    </MotiView>
                </TouchableOpacity>
            )}

            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                statusBarTranslucent
                presentationStyle="overFullScreen"
                onRequestClose={handleClose}
            >
                <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFillObject}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16), width: '100%' }}
                        >
                            <AnimatePresence>
                                {isOpen && (
                                    <MotiView
                                        from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                                        animate={{
                                            opacity: 1,
                                            scale: isKeyboardVisible ? 0.96 : 1,
                                            translateY: 0, 
                                        }}
                                        exit={{ opacity: 0, scale: 0.9, translateY: 30 }}
                                        transition={{ type: 'timing', duration: 250 }}
                                        style={{
                                            width: '100%',
                                            maxHeight: isKeyboardVisible ? Math.min(height * 0.55, 420) : Math.min(height * 0.84, 700),
                                        }}
                                    >
                                        <Box
                                            backgroundColor="card"
                                            borderRadius="xl"
                                            borderWidth={scale(1)}
                                            borderColor="border"
                                            overflow="hidden"
                                            style={{
                                                shadowColor: '#191D29',
                                                shadowOffset: { width: 0, height: 10 },
                                                shadowOpacity: 0.15,
                                                shadowRadius: 14,
                                                elevation: 10,
                                            }}
                                        >
                                            <Box 
                                                paddingHorizontal="m" 
                                                paddingTop="s" 
                                                paddingBottom="xs" 
                                                borderBottomWidth={scale(1)} 
                                                borderColor="inputBorder"
                                                backgroundColor="card"
                                                style={isKeyboardVisible ? { paddingTop: 14, paddingBottom: 4 } : {}}
                                            >
                                                <Text variant="titleMedium" color="textPrimary" fontWeight="700">
                                                    {t("transactions.newTransaction")}
                                                </Text>
                                            </Box>

                                            <ScrollView
                                                style={{ width: '100%' }}
                                                contentContainerStyle={{
                                                    paddingHorizontal: scale(24),
                                                    paddingTop: isKeyboardVisible ? scale(8) : scale(16),
                                                    paddingBottom: isKeyboardVisible ? scale(12) : scale(24),
                                                }}
                                                showsVerticalScrollIndicator={false}
                                                keyboardShouldPersistTaps="handled"
                                            >
                                                {/* Campo: Título */}
                                                <Box width="100%" marginBottom="s">
                                                    <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 4 }}>
                                                        {t("transactions.title")}
                                                    </Text>
                                                    <TextInput 
                                                        style={[inputStyle(theme), { fontSize: scale(15), color: theme.colors.textPrimary }]}
                                                        placeholder={t("transactions.titlePlaceholder")}
                                                        placeholderTextColor={theme.colors.placeholder}
                                                        value={title}
                                                        onChangeText={setTitle}
                                                        maxLength={20}
                                                    />
                                                </Box>

                                                {/* Campo: Descrição */}
                                                <Box width="100%" marginBottom="s">
                                                    <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 4 }}>
                                                        {t("transactions.descriptionLabel")}
                                                    </Text>
                                                    <TextInput 
                                                        style={[
                                                            inputStyle(theme), 
                                                            { fontSize: scale(15), color: theme.colors.textPrimary, textAlignVertical: 'top', paddingTop: scale(14) },
                                                            isKeyboardVisible ? { minHeight: scale(48), height: scale(48) } : { minHeight: scale(104), height: scale(100) }
                                                        ]}
                                                        placeholder={t("transactions.descriptionPlaceholder")}
                                                        placeholderTextColor={theme.colors.placeholder}
                                                        value={description}
                                                        onChangeText={setDescription}
                                                        multiline
                                                        maxLength={120}
                                                    />
                                                </Box>

                                                {/* Linha: Valor e Data (Mudado aqui de "flat" para "stretch") */}
                                                <Box flexDirection="row" style={{ gap: scale(12) }} alignItems="stretch" marginBottom="s">
                                                    <Box flex={1}>
                                                        <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 4 }}>
                                                            {t("transactions.amountLabel")}
                                                        </Text>
                                                        <TextInput 
                                                            style={[inputStyle(theme), { fontSize: scale(15), color: theme.colors.textPrimary }]}
                                                            placeholder={t("transactions.amountPlaceholder")}
                                                            placeholderTextColor={theme.colors.placeholder}
                                                            keyboardType="numeric"
                                                            value={amount}
                                                            onChangeText={setAmount}
                                                        />
                                                    </Box>

                                                    <Box flex={1}>
                                                        <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 4 }}>
                                                            {t("transactions.dateLabel")}
                                                        </Text>
                                                        <TextInput
                                                            style={[inputStyle(theme), { fontSize: scale(15), color: theme.colors.textPrimary }]}
                                                            placeholder={i18n.language.startsWith('en') ? "YYYY-MM-DD" : "DD/MM/YYYY"}
                                                            placeholderTextColor={theme.colors.placeholder}
                                                            keyboardType="numeric"
                                                            maxLength={10}
                                                            value={date}
                                                            onChangeText={(text) => setDate(applyDateMask(text, i18n.language))}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Campos Secundários (Escondem com teclado aberto) */}
                                                {!shouldHideSecondaryFields && (
                                                    <>
                                                        {/* Tipo */}
                                                        <Box width="100%" marginBottom="s">
                                                            <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 6 }}>
                                                                {t("transactions.typeLabel")}
                                                            </Text>
                                                            <Box flexDirection="row" style={{ gap: scale(8) }} flexWrap="wrap">
                                                                {(['income', 'expense'] as const).map((option) => {
                                                                    const isSelected = type === option;
                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={option}
                                                                            style={[choiceButtonStyle(theme), isSelected && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}
                                                                            onPress={() => setType(option)}
                                                                        >
                                                                            <Text variant="body" fontWeight="600" color={isSelected ? 'primary' : 'textSecondary'}>
                                                                                {t(`transactions.${option}`)}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    );
                                                                })}
                                                            </Box>
                                                        </Box>

                                                        {/* Status */}
                                                        <Box width="100%" marginBottom="s">
                                                            <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 6 }}>
                                                                {t("transactions.statusLabel")}
                                                            </Text>
                                                            <Box flexDirection="row" style={{ gap: scale(8) }} flexWrap="wrap">
                                                                {(['pending', 'paid', 'canceled'] as const).map((option) => {
                                                                    const isSelected = status === option;
                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={option}
                                                                            style={[choiceButtonStyle(theme), isSelected && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}
                                                                            onPress={() => setStatus(option)}
                                                                        >
                                                                            <Text variant="body" fontWeight="600" color={isSelected ? 'primary' : 'textSecondary'}>
                                                                                {t(`transactions.status.${option}`)}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    );
                                                                })}
                                                            </Box>
                                                        </Box>

                                                        {/* Categoria */}
                                                        <Box width="100%" marginBottom="s">
                                                            <Text variant="body" fontWeight="600" color="textPrimary" style={{ marginBottom: 6 }}>
                                                                {t("transactions.categoryLabel")}
                                                            </Text>
                                                            {loadingCategories ? (
                                                                <Text variant="body" color="textSecondary" style={{ paddingVertical: 2 }}>{t("common.loading")}</Text>
                                                            ) : filteredCategories.length > 0 ? (
                                                                <Box flexDirection="row" style={{ gap: scale(8) }} flexWrap="wrap">
                                                                    {filteredCategories.map((category) => {
                                                                        const isSelected = categoryId === category.id;
                                                                        return (
                                                                            <TouchableOpacity
                                                                                key={category.id}
                                                                                style={[choiceButtonStyle(theme), isSelected && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}
                                                                                onPress={() => setCategoryId(category.id)}
                                                                            >
                                                                                <Text variant="body" fontWeight="600" color={isSelected ? 'primary' : 'textSecondary'}>
                                                                                    {category.name}
                                                                                </Text>
                                                                            </TouchableOpacity>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            ) : (
                                                                <Text variant="body" color="textSecondary" style={{ paddingVertical: 2 }}>{t("categories.createCategory")}</Text>
                                                            )}
                                                        </Box>
                                                    </>
                                                )}

                                                {/* Exibição do Erro */}
                                                {!!error && (
                                                    <Text variant="caption" color="danger" style={{ marginBottom: scale(12), textAlign: 'center' }}>
                                                        {error}
                                                    </Text>
                                                )}

                                                {/* Botão Salvar */}
                                                <Box width="100%">
                                                    <TouchableOpacity 
                                                        style={saveButtonStyle(theme)}
                                                        onPress={handleSave}
                                                        disabled={loading}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text variant="body" fontWeight="600" color="textInverse">
                                                            {loading ? t("common.loading") : t("transactions.add")}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </Box>
                                            </ScrollView>
                                        </Box>
                                    </MotiView>
                                )}
                            </AnimatePresence>

                            {/* Botão de Fechar Dinâmico */}
                            {!isKeyboardVisible && (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={handleClose}
                                    style={{ position: 'absolute', bottom: scale(40), left: 0, right: 0, alignItems: 'center', justifyContent: 'center', zIndex: 30 }}
                                >
                                    <MotiView
                                        from={{ rotate: '0deg', backgroundColor: theme.colors.primary }}
                                        animate={{ rotate: '135deg', backgroundColor: theme.colors.danger }}
                                        transition={{ type: 'timing', duration: 220 }}
                                        style={plusButtonStyle}
                                    >
                                        <Feather name="plus" size={26} color={theme.colors.textInverse} />
                                    </MotiView>
                                </TouchableOpacity>
                            )}
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </BlurView>
            </Modal>
        </Box>
    );
}

const plusButtonStyle = {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24), 
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    elevation: 5,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(5),
};

const inputStyle = (theme: Theme) => ({
    width: '100%' as const,
    height: scale(48),
    backgroundColor: theme.colors.inputBackground, 
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    borderWidth: scale(1),
    borderColor: theme.colors.inputBorder, 
});

const choiceButtonStyle = (theme: Theme) => ({
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surface,
});

const saveButtonStyle = (theme: Theme) => ({
    width: '100%' as const,
    height: scale(48),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: scale(12),
    backgroundColor: theme.colors.primary,
});
