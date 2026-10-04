import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal';
import { HelpModal } from '@/features/transaction/recurrence/components/helpModal/helpModal';
import { ButtonBar } from '@/features/transaction/components/ButtonBar/ButtonBar';
import { TransactionFormModal } from '@/features/transaction/components/TransactionFormModal/TransactionFormModal';
import { useRecurrence, type RecurringTransaction } from '@/features/transaction/recurrence/hooks/useRecurrence';
import { useCurrency } from '@/features/settings/hooks/useCurrency';
import { parseDateOnly, parseDatabaseTimestamp } from '@/utils/date';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const calculateNextDate = (date: string, frequency: Frequency, interval: number) => {
    const nextDate = parseDateOnly(date) ?? parseDatabaseTimestamp(date) ?? new Date(Number.NaN);
    const safeInterval = interval || 1;

    if (frequency === 'daily') nextDate.setDate(nextDate.getDate() + safeInterval);
    if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + (safeInterval * 7));
    if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + safeInterval);
    if (frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + safeInterval);

    return nextDate;
};

export default function RecurringTransactionsScreen() {
    const theme = useTheme<Theme>();
    const { t, i18n } = useTranslation();
    const { formatCurrency } = useCurrency();
    const {
        recurringTransactions,
        loading,
        saving,
        error,
        deleteRecurrence,
        listRecurringTransactions,
        processRecurrences,
    } = useRecurrence();

    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);
    const [recurrenceToDelete, setRecurrenceToDelete] = useState<RecurringTransaction | null>(null);

    const loadRecurrences = useCallback(async () => {
        await processRecurrences();
        await listRecurringTransactions();
    }, [listRecurringTransactions, processRecurrences]);

    useFocusEffect(
        useCallback(() => {
            loadRecurrences().catch(() => undefined);
        }, [loadRecurrences])
    );

    const usageLabel = useMemo(
        () => t("recurrence.usage", { count: recurringTransactions.length, limit: 30 }),
        [recurringTransactions.length, t]
    );

    const formatDate = useCallback((date: Date) => (
        date.toLocaleDateString(i18n.language)
    ), [i18n.language]);

    const handleCreate = () => {
        setSelectedTransaction(null);
        setIsFormVisible(true);
    };

    const handleEdit = (item: RecurringTransaction) => {
        setSelectedTransaction(item);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setSelectedTransaction(null);
    };

    const handleDelete = async () => {
        if (!recurrenceToDelete) return;
        await deleteRecurrence(recurrenceToDelete.rule.id);
        setRecurrenceToDelete(null);
        await listRecurringTransactions();
    };

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: scale(24), paddingBottom: scale(110) }}
            >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingTop="xxl" marginBottom="m">
                    <Text variant="titleMedium" fontWeight="700">{t("recurrence.title")}</Text>
                    <TouchableOpacity onPress={() => setIsHelpVisible(true)} accessibilityLabel={t("recurrence.help.open")}>
                        <Feather name="help-circle" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </Box>

                <Box backgroundColor="surface" padding="s" borderRadius="m" marginBottom="m" borderWidth={1} borderColor="border" alignItems="center">
                    <Text variant="caption" fontWeight="600" color="textSecondary">
                        {saving ? t("recurrence.syncing") : usageLabel}
                    </Text>
                </Box>

                {error ? (
                    <Box backgroundColor="surface" padding="s" borderRadius="m" marginBottom="m" borderWidth={1} borderColor="danger">
                        <Text variant="caption" color="danger">{error}</Text>
                    </Box>
                ) : null}

                {loading && recurringTransactions.length === 0 ? (
                    <Box padding="m" alignItems="center">
                        <Text color="textSecondary">{t("common.loading")}</Text>
                    </Box>
                ) : null}

                {!loading && recurringTransactions.length === 0 ? (
                    <Box backgroundColor="surface" padding="m" borderRadius="m" borderWidth={1} borderColor="border" alignItems="center">
                        <Text color="textSecondary">{t("recurrence.empty")}</Text>
                    </Box>
                ) : null}

                {recurringTransactions.map((item, index) => {
                    if (!item.transaction) return null;

                    const nextDate = calculateNextDate(item.rule.last_generated_date, item.rule.frequency, item.rule.interval);
                    const isIncome = item.transaction.type === 'income';

                    return (
                        <MotiView
                            key={item.rule.id}
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 250, delay: index * 50 }}
                        >
                            <Box backgroundColor="surface" padding="m" borderRadius="m" marginBottom="m" borderWidth={1} borderColor="border">
                                <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box flex={1} paddingRight="s">
                                        <Text variant="body" fontWeight="700">{item.transaction.title}</Text>
                                        <Text variant="caption" color="textSecondary">
                                            {t(`recurrence.frequency.${item.rule.frequency}`)} - {t("recurrence.interval", { count: item.rule.interval })}
                                        </Text>
                                        <Text variant="caption" color="textSecondary">
                                            {t("recurrence.nextDate", { date: formatDate(nextDate) })}
                                        </Text>
                                    </Box>

                                    <Box alignItems="flex-end">
                                        <Text fontWeight="700" color={isIncome ? 'success' : 'danger'}>
                                            {isIncome ? '' : '-'} {formatCurrency(item.transaction.amount)}
                                        </Text>
                                        <Box flexDirection="row" marginTop="s" style={{ gap: scale(10) }}>
                                            <TouchableOpacity onPress={() => handleEdit(item)} accessibilityLabel={t("common.edit")}>
                                                <Feather name="edit-2" size={18} color={theme.colors.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setRecurrenceToDelete(item)} accessibilityLabel={t("common.delete")}>
                                                <Feather name="trash-2" size={18} color={theme.colors.danger} />
                                            </TouchableOpacity>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </MotiView>
                    );
                })}
            </ScrollView>

            <Box position="absolute" bottom={24} left={0} right={0} alignItems="center">
                <ButtonBar useExternalAction onPress={handleCreate} />
            </Box>

            <TransactionFormModal
                isOpen={isFormVisible}
                onClose={handleCloseForm}
                transaction={selectedTransaction?.transaction ?? null}
                defaultIsRecurring
                onSaved={loadRecurrences}
            />

            <ConfirmationModal
                visible={!!recurrenceToDelete}
                title={t("recurrence.deleteTitle")}
                description={t("recurrence.deleteDescription")}
                confirmText={t("common.delete")}
                cancelText={t("common.cancel")}
                onClose={() => setRecurrenceToDelete(null)}
                onConfirm={() => {
                    handleDelete().catch(() => undefined);
                }}
            />

            <HelpModal isVisible={isHelpVisible} onClose={() => setIsHelpVisible(false)} />
        </Box>
    );
}
