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
        
        let recurrenceId: string | null = null;

        if (data.is_recurring && data.frequency) {
            const transactionDate = data.date || new Date().toISOString().split('T')[0];
            
            const recurrenceResult = await recurrenceService.createRecurrence({
                frequency: data.frequency,
                interval: data.interval || 1,
                last_generated_date: transactionDate,
                end_date: data.end_date
            });
            
            const recurrence = Array.isArray(recurrenceResult) ? recurrenceResult[0] : recurrenceResult;
            recurrenceId = recurrence?.id || null;
        }
        
        const result = await transacRepo.createTransaction(userId, {
            ...data,
            recurrence_id: recurrenceId
        });
        const transaction = Array.isArray(result) ? result[0] : result;

        await scheduleDueNotification(transaction.id, data);
        return transaction;
    }

    async updateTransaction(id: string, data: UpdateTransactionDTO) {
        const currentTransaction = await transacRepo.findById(id);
        let recurrenceId = currentTransaction?.recurrence_id || null;

        if (data.is_recurring) {
            const transactionDate = data.date || new Date().toISOString().split('T')[0];

            if (recurrenceId) {
                await recurrenceService.updateRecurrence(recurrenceId, {
                    frequency: data.frequency,
                    interval: data.interval,
                    last_generated_date: transactionDate,
                    end_date: data.end_date
                });
            } else {
                const newRecurrenceResult = await recurrenceService.createRecurrence({
                    frequency: data.frequency!,
                    interval: data.interval || 1,
                    last_generated_date: transactionDate,
                    end_date: data.end_date
                });
                
                const newRecurrence = Array.isArray(newRecurrenceResult) ? newRecurrenceResult[0] : newRecurrenceResult;
                recurrenceId = newRecurrence?.id || null;
            }
        } else {
            if (recurrenceId) {
                await recurrenceService.deleteRecurrence(recurrenceId);
                recurrenceId = null;
            }
        }

        const result = await transacRepo.updateTransaction(id, {
            ...data,
            recurrence_id: recurrenceId
        });

        await notificationService.deleteNotification(id);
        await scheduleDueNotification(id, data);
        
        return result;
    }

    async findById(id: string) {
        return await transacRepo.findById(id);
    }

    async deleteTransaction(id: string) {
        const transaction = await transacRepo.findById(id);
        if (transaction?.recurrence_id) {
            await recurrenceService.deleteRecurrence(transaction.recurrence_id);
        }
        await notificationService.deleteNotification(id);
        return await transacRepo.deleteTransaction(id);
    }

    async deleteManyTransactions(ids: string[]) {
        for (const id of ids) {
            const transaction = await transacRepo.findById(id);
            if (transaction?.recurrence_id) {
                await recurrenceService.deleteRecurrence(transaction.recurrence_id);
            }
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