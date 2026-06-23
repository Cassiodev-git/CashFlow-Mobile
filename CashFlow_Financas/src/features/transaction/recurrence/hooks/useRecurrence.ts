import { useCallback, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { useTranslation } from "react-i18next";
import AppRecurrenceService from "@/services/AppRecurrenceService";
import AppUserService from "@/services/AppUserService";
import type { RecurrencePayload } from "../repository/RecurrenceRepository";

type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";
type TransactionType = "income" | "expense";
type TransactionStatus = "paid" | "pending" | "canceled";

export interface RecurringTransaction {
    rule: {
        id: string;
        transaction_id: string;
        frequency: RecurrenceFrequency;
        interval: number;
        last_generated_date: string;
        end_date?: string;
        created_at: string;
        updated_at: string;
    };
    transaction: {
        id: string;
        title: string;
        description?: string;
        amount: number;
        type: TransactionType;
        status?: TransactionStatus;
        date?: string;
        user_id: string;
        category_id?: string;
        is_recurring: boolean;
        recurrence_id?: string;
        created_at: string;
        updated_at: string;
        frequency: RecurrenceFrequency;
        interval: number;
        end_date?: string;
    } | null;
}

const getCurrentUserId = async () => {
    const user = await AppUserService.findFirstUser();
    return user?.id;
};

export function useRecurrence() {
    const { t } = useTranslation();
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizeError = useCallback((err: unknown) => {
        if (err instanceof Error && err.message) return err.message;
        return t("recurrence.errors.unexpected");
    }, [t]);

    const requireUserId = useCallback(async () => {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error(t("errors.userNotFoundForTransactionRead"));
        return userId;
    }, [t]);

    const listRecurringTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userId = await requireUserId();
            const data = await AppRecurrenceService.listRecurringTransactions(userId);
            const formattedData: RecurringTransaction[] = data.map((item) => ({
                rule: {
                    id: item.rule.id,
                    transaction_id: item.rule.transaction_id,
                    frequency: item.rule.frequency as RecurrenceFrequency,
                    interval: item.rule.interval ?? 1,
                    last_generated_date: item.rule.last_generated_date,
                    end_date: item.rule.end_date ?? undefined,
                    created_at: item.rule.created_at,
                    updated_at: item.rule.updated_at,
                },
                transaction: item.transaction ? {
                    id: item.transaction.id,
                    title: item.transaction.title,
                    description: item.transaction.description ?? undefined,
                    amount: item.transaction.amount,
                    type: item.transaction.type as TransactionType,
                    status: item.transaction.status ? item.transaction.status as TransactionStatus : undefined,
                    date: item.transaction.date ?? undefined,
                    user_id: item.transaction.user_id,
                    category_id: item.transaction.category_id ?? undefined,
                    is_recurring: item.transaction.is_recurring,
                    recurrence_id: item.transaction.recurrence_id ?? undefined,
                    created_at: item.transaction.created_at,
                    updated_at: item.transaction.updated_at,
                    frequency: item.rule.frequency as RecurrenceFrequency,
                    interval: item.rule.interval ?? 1,
                    end_date: item.rule.end_date ?? undefined,
                } : null,
            }));
            setRecurringTransactions(formattedData);
            return formattedData;
        } catch (err) {
            const message = normalizeError(err);
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [normalizeError, requireUserId]);

    const createRecurrence = useCallback(async (payload: RecurrencePayload, transactionId: string) => {
        setSaving(true);
        setError(null);
        try {
            const userId = await requireUserId();
            const result = await AppRecurrenceService.createRecurrence(payload, transactionId, userId);
            DeviceEventEmitter.emit("transaction_mutated");
            return result;
        } catch (err) {
            const message = normalizeError(err);
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [normalizeError, requireUserId]);

    const updateRecurrence = useCallback(async (id: string, payload: RecurrencePayload) => {
        setSaving(true);
        setError(null);
        try {
            const result = await AppRecurrenceService.updateRecurrence(id, payload);
            DeviceEventEmitter.emit("transaction_mutated");
            return result;
        } catch (err) {
            const message = normalizeError(err);
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [normalizeError]);

    const deleteRecurrence = useCallback(async (id: string) => {
        setSaving(true);
        setError(null);
        try {
            const result = await AppRecurrenceService.deleteRecurrence(id);
            DeviceEventEmitter.emit("transaction_mutated");
            return result;
        } catch (err) {
            const message = normalizeError(err);
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [normalizeError]);

    const processRecurrences = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            const userId = await requireUserId();
            return await AppRecurrenceService.processRecurrences(userId);
        } catch (err) {
            const message = normalizeError(err);
            setError(message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [normalizeError, requireUserId]);

    return {
        recurringTransactions,
        loading,
        saving,
        error,
        createRecurrence,
        updateRecurrence,
        deleteRecurrence,
        listRecurringTransactions,
        processRecurrences,
    };
}
