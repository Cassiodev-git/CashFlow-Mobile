import { SettingsService } from '../services/settingsService';
import notificationService from '../services/notificationService';
import i18n from '@/i18n';

export const NotificationManager = {
    async scheduleDueDate(transactionId: string, title: string, triggerDate: Date) {
        const enabled = await SettingsService.areRemindersEnabled();
        if (!enabled) return;

        await notificationService.deleteByTransactionId(transactionId);

        await notificationService.createNotification({
            transaction_id: transactionId,
            type: 'due_date',
            title: i18n.t("notifications.dueDateTitle"),
            body: i18n.t("notifications.dueDateBody", { title }),
            trigger_date: triggerDate.toISOString(),
            is_active: true,
            is_read: false,
        });
    },

    async cancelSpecificNotification(transactionId: string) {
        await notificationService.deleteByTransactionId(transactionId);
    }
};
