import * as Notifications from 'expo-notifications';
import { SettingsService } from '../services/settingsService';
import notificationService from '../services/notificationService';

export const NotificationManager = {
    async scheduleDueDate(transactionId: string, title: string, triggerDate: Date) {
        const enabled = await SettingsService.areRemindersEnabled();
        if (!enabled) return;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Atenção ao Vencimento",
                body: `Sua conta '${title}' está com vencimento próximo.`,
                data: { transactionId },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });
        
        await notificationService.linkNotificationToTransaction(transactionId, notificationId);
    },

    async cancelSpecificNotification(transactionId: string) {
        const notificationId = await notificationService.getNotificationId(transactionId);
        
        if (notificationId) {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            await notificationService.removeNotificationLink(transactionId);
        }
    }
};