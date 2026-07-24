import * as Notifications from 'expo-notifications';
import { NotificationRepository } from '../repository/NotificationRepository';
import { createNotificationSchema, updateNotificationSchema, type CreateNotificationInput, type UpdateNotificationInput } from '../validation';
import { logger } from '@/utils/logger';

const notificationRepo = new NotificationRepository();

class NotificationService {
    private dueSyncPromises = new Map<string, Promise<void>>();

    async createNotification(data: CreateNotificationInput) {
        const validatedData = createNotificationSchema.parse(data);
        
        const result = await notificationRepo.createNotification({
            ...validatedData,
            is_active: false,
            is_read: false,
        });
        
        const notification = Array.isArray(result) ? result[0] : result;
        const dbId = notification.id;

        const triggerDate = new Date(validatedData.trigger_date);
        const now = new Date();
        const finalTrigger = triggerDate > now ? triggerDate : new Date(now.getTime() + 1000);

        const expoNotificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: validatedData.title,
                body: validatedData.body,
                data: { 
                    transaction_id: validatedData.transaction_id, 
                    type: validatedData.type,
                    db_id: dbId
                },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: finalTrigger,
            },
        });

        await notificationRepo.updateNotification(String(dbId), { expo_id: expoNotificationId });

        logger.log(`Notificação agendada: ${expoNotificationId}`);
        return notification;
    }

    async updateNotification(id: string, data: UpdateNotificationInput) {
        const validatedData = updateNotificationSchema.parse(data);
        return await notificationRepo.updateNotification(id, validatedData);
    }

    async syncDueDateNotifications(transactionId: string, desiredNotifications: CreateNotificationInput[]) {
        const runningSync = this.dueSyncPromises.get(transactionId);
        if (runningSync) return runningSync;

        const syncPromise = this.syncDueDateNotificationsInternal(transactionId, desiredNotifications);
        this.dueSyncPromises.set(transactionId, syncPromise);

        try {
            await syncPromise;
        } finally {
            if (this.dueSyncPromises.get(transactionId) === syncPromise) {
                this.dueSyncPromises.delete(transactionId);
            }
        }
    }

    private async syncDueDateNotificationsInternal(transactionId: string, desiredNotifications: CreateNotificationInput[]) {
        const existing = await notificationRepo.findByTransactionId(transactionId);
        const existingDue = existing.filter((item) => item.type === 'due_date' || item.type === 'overdue');
        const getKey = (item: { type: string; trigger_date: string; title: string; body: string }) => (
            `${item.type}|${item.trigger_date}|${item.title}|${item.body}`
        );
        const desiredKeys = new Set(desiredNotifications.map(getKey));
        const keptKeys = new Set<string>();

        for (const item of existingDue) {
            const key = getKey(item);
            if (!desiredKeys.has(key) || keptKeys.has(key)) {
                await this.deleteNotification(item.id);
            } else {
                keptKeys.add(key);
            }
        }

        for (const desired of desiredNotifications) {
            const key = getKey(desired);
            if (!keptKeys.has(key)) {
                await this.createNotification(desired);
                keptKeys.add(key);
            }
        }
    }

    async deleteDueDateNotifications() {
        const all = await notificationRepo.listAllNotifications();
        const dueNotifications = all.filter((item) => item.type === 'due_date' || item.type === 'overdue');

        for (const item of dueNotifications) {
            await this.deleteNotification(item.id);
        }
    }

    async markAsRead(id: string) {
        return await notificationRepo.updateNotification(id, { is_read: true });
    }

    async markAsOpened(id: string) {
        return await notificationRepo.updateNotification(id, { is_active: true });
    }

    async listUnread() {
        return await notificationRepo.listUnreadNotifications();
    }

    async listNotifications() {
        return await notificationRepo.listNotifications();
    }

    async linkNotificationToTransaction(transactionId: string, expoId: string) {
        await notificationRepo.updateTransactionNotificationLink(transactionId, expoId);
    }

    async getNotificationId(transactionId: string): Promise<string | null> {
        return await notificationRepo.getExpoIdByTransactionId(transactionId);
    }

    async removeNotificationLink(transactionId: string) {
        await notificationRepo.clearTransactionNotificationLink(transactionId);
    }

    async deleteNotification(id: string) {
        const notification = await notificationRepo.findById(id);
        try {
            if (notification?.expo_id) {
                await Notifications.cancelScheduledNotificationAsync(notification.expo_id);
            }
        } catch (error) {
            logger.error("Erro ao cancelar agendamento:", error);
        }

        return await notificationRepo.deleteNotification(id);
    }

    async deleteByTransactionId(transactionId: string) {
        const notificationIds = await notificationRepo.getExpoIdsByTransactionId(transactionId);
        for (const notificationId of notificationIds) {
            try {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            } catch (error) {
                logger.error("Erro ao cancelar agendamento da transação:", error);
            }
        }

        return await notificationRepo.deleteByTransactionId(transactionId);
    }

    async deleteAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await notificationRepo.deleteAll();
        } catch (error) {
            logger.error("Erro ao deletar todas as notificações:", error);
        }
    }
}

export default new NotificationService();
