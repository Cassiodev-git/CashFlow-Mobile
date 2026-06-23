import { TransactionRepository } from "../repository/TransactionRepository";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";
import { UserRepository } from "@/features/user/repository/UserRepository";
import notificationService from "@/features/notification/services/notificationService";
import { scheduleDueNotification } from "@/features/notification/utils/notificationsRules";
import i18n from "@/i18n";
import recurrenceService from "@/features/transaction/recurrence/services/RecurrenceService";

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
        
        const result = await transacRepo.createTransaction(userId, data);
        const transaction = Array.isArray(result) ? result[0] : result;

        if (data.is_recurring && data.frequency) {
            const transactionDate = data.date || new Date().toISOString().split('T')[0];
            
            await recurrenceService.createRecurrence({
                frequency: data.frequency,
                interval: data.interval,
                date: transactionDate,
                end_date: data.end_date
            }, transaction.id, userId);
        }
        
        await scheduleDueNotification(transaction.id, data);
        return transaction;
    }

    async updateTransaction(id: string, data: UpdateTransactionDTO) {
        if (data.is_recurring) {
            const transactionDate = data.date || new Date().toISOString().split('T')[0];
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
        return await transacRepo.listTransactions(userId, options);
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
