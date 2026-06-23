import { RecurrenceRepository, type RecurrencePayload } from "../repository/RecurrenceRepository";
import { TransactionRepository } from "../../repository/TransactionRepository";
import { addMonths, addWeeks, addDays, addYears, isAfter, startOfDay } from 'date-fns';
import i18n from "@/i18n";

const recurrenceRepo = new RecurrenceRepository();
const transacRepo = new TransactionRepository();

type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

class RecurrenceService {
    async createRecurrence(data: RecurrencePayload, transactionId: string, userId: string) {
        const currentList = await this.listRecurringTransactions(userId);
        if (currentList.length >= 15) {
            throw new Error(i18n.t("recurrence.errors.limitReached"));
        }
        return await recurrenceRepo.createRecurrence(data, transactionId);
    }

    async updateRecurrence(id: string, data: RecurrencePayload) {
        return await recurrenceRepo.updateRecurrence(id, data);
    }

    async deleteRecurrence(id: string) {
        const recurrence = await recurrenceRepo.findById(id);
        if (recurrence?.transaction_id) {
            await transacRepo.updateTransaction(recurrence.transaction_id, {
                is_recurring: false,
                recurrence_id: null,
            });
        }

        return await recurrenceRepo.deleteRecurrence(id);
    }

    async listRecurringTransactions(userId: string) {
        return await recurrenceRepo.listRecurringTransactions(userId);
    }

    async findByTransactionId(id: string) {
        return await recurrenceRepo.findByTransactionId(id);
    }

    async deleteByTransactionId(id: string) {
        return await recurrenceRepo.deleteByTransactionId(id);
    }

    async processRecurrences(userId: string) {
        const list = await recurrenceRepo.listRecurringTransactions(userId);
        const today = startOfDay(new Date());

        for (const item of list) {
            const rule = item.rule;
            const parentTransaction = item.transaction;

            if (!parentTransaction) continue;

            let lastDate = new Date(rule.last_generated_date);

            while (true) {
                const nextDate = this.calculateNextDate(lastDate, rule.frequency as RecurrenceFrequency, rule.interval ?? 1);
                const nextDateStart = startOfDay(nextDate);

                if (isAfter(nextDateStart, today)) {
                    break;
                }

                if (rule.end_date && isAfter(nextDateStart, startOfDay(new Date(rule.end_date)))) {
                    break;
                }

                const formattedNextDate = nextDate.toISOString().split('T')[0];

                await transacRepo.createTransaction(userId, {
                    title: parentTransaction.title,
                    amount: parentTransaction.amount,
                    type: parentTransaction.type as "income" | "expense",
                    category_id: parentTransaction.category_id ?? undefined,
                    description: parentTransaction.description ?? undefined,
                    status: "pending",
                    date: formattedNextDate,
                    is_recurring: false,
                });

                await recurrenceRepo.updateLastGeneratedDate(rule.id, formattedNextDate);

                lastDate = nextDate;
            }
        }
    }

    private calculateNextDate(date: Date, frequency: RecurrenceFrequency, interval: number): Date {
        switch (frequency) {
            case 'daily': return addDays(date, interval);
            case 'weekly': return addWeeks(date, interval);
            case 'monthly': return addMonths(date, interval);
            case 'yearly': return addYears(date, interval);
            default: return addMonths(date, 1);
        }
    }
}

export default new RecurrenceService();
