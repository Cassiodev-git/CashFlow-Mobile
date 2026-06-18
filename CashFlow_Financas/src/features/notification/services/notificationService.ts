import * as Notifications from 'expo-notifications';
import { NotificationRepository } from '../repository/NotificationRepository';
import { createNotificationSchema, updateNotificationSchema, type CreateNotificationInput, type UpdateNotificationInput } from '../validation';
import { logger } from '@/utils/logger';

const notificationRepo = new NotificationRepository();

class NotificationService {
    async createNotification(data: CreateNotificationInput) {
        const validatedData = createNotificationSchema.parse(data);
        
        const result = await notificationRepo.createNotification(validatedData);
        
        const dbId = (result as any).lastInsertRowId || (result as any).id;

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
        return result;
    }

    async updateNotification(id: string, data: UpdateNotificationInput) {
        const validatedData = updateNotificationSchema.parse(data);
        return await notificationRepo.updateNotification(id, validatedData);
    }

    async markAsRead(id: string) {
        return await notificationRepo.updateNotification(id, { is_read: true });
    }

    async listUnread() {
        return await notificationRepo.listUnreadNotifications();
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
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (error) {
            logger.error("Erro ao cancelar agendamento:", error);
        }

        return await notificationRepo.deleteNotification(id);
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