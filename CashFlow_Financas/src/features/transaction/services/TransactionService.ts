import { TransactionRepository } from "../repository/TransactionRepository";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";
import { UserRepository } from "@/features/user/repository/UserRepository";
import notificationService from "@/features/notification/services/notificationService";
import { scheduleDueNotification, scheduleRecurringCreatedNotification } from "@/features/notification/utils/notificationsRules";
import i18n from "@/i18n";
import recurrenceService from "@/features/transaction/recurrence/services/RecurrenceService";
import { getLocalDateString } from "@/utils/date";
import { db } from "@/db";
import { logger } from "@/utils/logger";

const transacRepo = new TransactionRepository();
const userRepo = new UserRepository();

const getLocalUserId = async () => {
    const user = await userRepo.findFirstUser();
    if (!user) throw new Error(i18n.t("errors.userNotFoundForTransactionCreate"));
    return user.id;
};

class TransactionService {
    private async runNotificationTask(task: () => Promise<unknown>, context: string): Promise<void> {
        try {
            await task();
        } catch (error) {
            // Notificações são um recurso auxiliar: falhas não podem desfazer
            // nem mascarar uma operação financeira já persistida.
            logger.warn(`Falha ao sincronizar notificação (${context}).`, error);
        }
    }

    async createTransaction(data: CreateTransactionDTO) {
        const userId = await getLocalUserId();
        const transactionData = {
            ...data,
            date: data.date || getLocalDateString(),
        };
        
        const transaction = await db.transaction(async (tx) => {
            const result = await transacRepo.createTransaction(userId, transactionData, tx);
            const createdTransaction = Array.isArray(result) ? result[0] : result;

            if (transactionData.is_recurring && transactionData.frequency) {
                const recurrenceResult = await recurrenceService.createRecurrence({
                    frequency: transactionData.frequency,
                    interval: transactionData.interval,
                    date: transactionData.date,
                    end_date: transactionData.end_date,
                }, createdTransaction.id, userId, tx);
                const recurrence = Array.isArray(recurrenceResult) ? recurrenceResult[0] : recurrenceResult;

                await transacRepo.updateTransaction(createdTransaction.id, {
                    recurrence_id: recurrence.id,
                }, tx);
                createdTransaction.recurrence_id = recurrence.id;
            }

            return createdTransaction;
        });

        if (transactionData.is_recurring && transactionData.frequency) {
            await this.runNotificationTask(
                () => scheduleRecurringCreatedNotification(transaction.id, transactionData.title),
                'recorrência criada',
            );
        }
        
        await this.runNotificationTask(
            () => scheduleDueNotification(transaction.id, transactionData),
            'vencimento criado',
        );
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

        await this.runNotificationTask(
            () => notificationService.deleteByTransactionId(id),
            'limpeza da notificação atualizada',
        );
        await this.runNotificationTask(
            () => scheduleDueNotification(id, data),
            'vencimento atualizado',
        );
        
        return result;
    }

    async findById(id: string) {
        return await transacRepo.findById(id);
    }

    async deleteTransaction(id: string) {
        await recurrenceService.deleteByTransactionId(id);
        await this.runNotificationTask(
            () => notificationService.deleteByTransactionId(id),
            'exclusão de transação',
        );
        return await transacRepo.deleteTransaction(id);
    }

    async deleteManyTransactions(ids: string[]) {
        for (const id of ids) {
            await recurrenceService.deleteByTransactionId(id);
        }
        await Promise.all(ids.map((id) => this.runNotificationTask(
            () => notificationService.deleteByTransactionId(id),
            'exclusão de transação em lote',
        )));
        return await transacRepo.deleteManyTransactions(ids);
    }

    async listTransactions(options?: { limit?: number; offset?: number }) {
        const userId = await getLocalUserId();
        await recurrenceService.processRecurrences(userId);
        const transactions = await transacRepo.listTransactions(userId, options);
        await Promise.all(transactions
            .filter((transaction) => transaction.status === 'pending')
            .map((transaction) => this.runNotificationTask(() => scheduleDueNotification(transaction.id, {
                title: transaction.title,
                date: transaction.date ?? undefined,
                status: transaction.status === 'paid' || transaction.status === 'canceled' ? transaction.status : 'pending',
            }), 'sincronização da lista')));
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
