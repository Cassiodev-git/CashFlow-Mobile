import { TransactionRepository } from "../repository/TransactionRepository";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";
import { UserRepository } from "@/features/user/repository/UserRepository";
import notificationService from "@/features/notification/services/notificationService";
import { scheduleDueNotification, scheduleRecurringCreatedNotification } from "@/features/notification/utils/notificationsRules";
import i18n from "@/i18n";
import recurrenceService from "@/features/transaction/recurrence/services/RecurrenceService";
import { getLocalDateString } from "@/utils/date";

const transacRepo = new TransactionRepository();
const userRepo = new UserRepository();

const getLocalUserId = async () => {
    const user = await userRepo.findFirstUser();
    if (!user) throw new Error(i18n.t("errors.userNotFoundForTransactionCreate"));
    return user.id;
};

class TransactionService {
    async createTransaction(data: CreateTransactionDTO) {
        const userId = await getLocalUserId();
        const transactionData = {
            ...data,
            date: data.date || getLocalDateString(),
        };
        
        const result = await transacRepo.createTransaction(userId, transactionData);
        const transaction = Array.isArray(result) ? result[0] : result;

        if (transactionData.is_recurring && transactionData.frequency) {
            const transactionDate = transactionData.date;
            
            await recurrenceService.createRecurrence({
                frequency: transactionData.frequency,
                interval: transactionData.interval,
                date: transactionDate,
                end_date: transactionData.end_date
            }, transaction.id, userId);
            await scheduleRecurringCreatedNotification(transaction.id, transactionData.title);
        }
        
        await scheduleDueNotification(transaction.id, transactionData);
        return transaction;
    }

    async updateTransaction(id: string, data: UpdateTransactionDTO) {
        if (data.is_recurring) {
            const transactionDate = data.date || getLocalDateString();
            const existingRecurrence = await recurrenceService.findByTransactionId(id);

            if (existingRecurrence) {
                await recurrenceService.updateRecurrence(existingRecurrence.id, {
                    frequency: data.frequency,
                    interval: data.interval,
                    date: transactionDate,
                    end_date: data.end_date
                });
            } else {
                const userId = await getLocalUserId();
                await recurrenceService.createRecurrence({
                    frequency: data.frequency!,
                    interval: data.interval,
                    date: transactionDate,
                    end_date: data.end_date
                }, id, userId);
            }
        } else {
            await recurrenceService.deleteByTransactionId(id);
        }

        const result = await transacRepo.updateTransaction(id, data);

        await notificationService.deleteByTransactionId(id);
        await scheduleDueNotification(id, data);
        
        return result;
    }

    async findById(id: string) {
        return await transacRepo.findById(id);
    }

    async deleteTransaction(id: string) {
        await recurrenceService.deleteByTransactionId(id);
        await notificationService.deleteByTransactionId(id);
        return await transacRepo.deleteTransaction(id);
    }

    async deleteManyTransactions(ids: string[]) {
        for (const id of ids) {
            await recurrenceService.deleteByTransactionId(id);
            await notificationService.deleteByTransactionId(id);
        }
        return await transacRepo.deleteManyTransactions(ids);
    }

    async listTransactions(options?: { limit?: number; offset?: number }) {
        const userId = await getLocalUserId();
        await recurrenceService.processRecurrences(userId);
        const transactions = await transacRepo.listTransactions(userId, options);
        await Promise.all(transactions
            .filter((transaction) => transaction.status === 'pending')
            .map((transaction) => scheduleDueNotification(transaction.id, {
                title: transaction.title,
                date: transaction.date ?? undefined,
                status: transaction.status === 'paid' || transaction.status === 'canceled' ? transaction.status : 'pending',
            })));
        return transactions;
    }

    async sendTestNotification() {
        await notificationService.createNotification({
            type: 'due_date',
            title: i18n.t("notifications.testTitle"),
            body: i18n.t("notifications.testBody"),
            trigger_date: new Date().toISOString(),
            transaction_id: null,
            is_active: true,
            is_read: false
        });
    }
}

export default new TransactionService();
