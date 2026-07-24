import { SettingsService } from '../services/settingsService';
import notificationService from '../services/notificationService';
import i18n from '@/i18n';
import type { CreateNotificationInput } from '../validation';

export const NotificationManager = {
    async scheduleDueDate(transactionId: string, title: string, dueDate: Date, diffDays: number) {
        const enabled = await SettingsService.areRemindersEnabled();
        if (!enabled) return;

        const now = new Date();
        const reminders = [3, 1, 0]
            .map((daysBefore) => {
                const triggerDate = new Date(dueDate);
                triggerDate.setDate(triggerDate.getDate() - daysBefore);
                triggerDate.setHours(9, 0, 0, 0);
                return { triggerDate, overdue: false };
            })
            .filter(({ triggerDate }) => triggerDate > now);

        if (diffDays < 0) {
            const overdueDate = new Date(now);
            overdueDate.setDate(overdueDate.getDate() + 1);
            overdueDate.setHours(9, 0, 0, 0);
            reminders.push({ triggerDate: overdueDate, overdue: true });
        }

        const desiredNotifications: CreateNotificationInput[] = reminders.map(({ triggerDate, overdue }) => ({
            transaction_id: transactionId,
            type: overdue ? 'overdue' : 'due_date',
            title: overdue ? i18n.t('notifications.overdueTitle') : i18n.t("notifications.dueDateTitle"),
            body: overdue ? i18n.t('notifications.overdueBody', { title }) : i18n.t("notifications.dueDateBody", { title }),
            trigger_date: triggerDate.toISOString(),
            is_active: true,
            is_read: false,
        }));

        await notificationService.syncDueDateNotifications(transactionId, desiredNotifications);
    },

    async cancelSpecificNotification(transactionId: string) {
        await notificationService.deleteByTransactionId(transactionId);
    }
};
