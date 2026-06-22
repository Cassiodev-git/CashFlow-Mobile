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
            await recurrenceService.createRecurrence({
                transaction_id: transaction.id,
                frequency: data.frequency,
                interval: data.interval || 1,
                next_occurrence: data.date || new Date().toISOString(),
                end_date: data.end_date
            });
        }

        await scheduleDueNotification(transaction.id, data);
        return transaction;
    }

    async updateTransaction(id: string, data: UpdateTransactionDTO) {
        const result = await transacRepo.updateTransaction(id, data);
        
        const existingRecurrence = await recurrenceService.findByTransactionId(id);

        if (data.is_recurring) {
            if (existingRecurrence) {
                await recurrenceService.updateRecurrence(existingRecurrence.id, {
                    frequency: data.frequency,
                    interval: data.interval,
                    end_date: data.end_date
                });
            } else {
                await recurrenceService.createRecurrence({
                    transaction_id: id,
                    frequency: data.frequency!,
                    interval: data.interval || 1,
                    next_occurrence: data.date || new Date().toISOString(),
                    end_date: data.end_date
                });
            }
        } else {
            if (existingRecurrence) {
                await recurrenceService.deleteRecurrence(existingRecurrence.id);
            }
        }

        await notificationService.deleteNotification(id);
        await scheduleDueNotification(id, data);
        
        return result;
    }

    async deleteTransaction(id: string) {
        await recurrenceService.deleteByTransactionId(id);
        await notificationService.deleteNotification(id);
        return await transacRepo.deleteTransaction(id);
    }

    async deleteManyTransactions(ids: string[]) {
        for (const id of ids) {
            await recurrenceService.deleteByTransactionId(id);
            await notificationService.deleteNotification(id);
        }
        return await transacRepo.deleteManyTransactions(ids);
    }

    async listTransactions(options?: { limit?: number; offset?: number }) {
        const userId = await getLocalUserId();
        return await transacRepo.listTransactions(userId, options);
    }

    async sendTestNotification() {
        await notificationService.createNotification({
            type: 'due_date',
            title: "Teste de Notificação",
            body: "Isso é um teste do sistema de notificações!",
            trigger_date: new Date().toISOString(),
            transaction_id: 'test-id',
            is_active: true,
            is_read: false
        });
    }
}

export default new TransactionService();