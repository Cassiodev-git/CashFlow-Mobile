import { SettingsService } from '../services/settingsService';
import { NotificationManager } from '../managers/scheduleManager';
import type { CreateTransactionDTO, UpdateTransactionDTO } from '@/features/transaction/validation';
import * as Notifications from 'expo-notifications';
import i18n from '@/i18n';
import notificationService from '@/features/notification/services/notificationService';

export const scheduleDueNotification = async (
    transactionId: string, 
    data: CreateTransactionDTO | UpdateTransactionDTO
) => {
    const title = data.title;
    const date = data.date;

    if (!title || !date) return;

    const canNotify = await SettingsService.areRemindersEnabled();
    
    if (!canNotify || data.status !== 'pending') return;

    const dueDate = new Date(date);
    const now = new Date();
    
    const compareDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const compareNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = compareDate.getTime() - compareNow.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    await NotificationManager.scheduleDueDate(transactionId, title, compareDate, diffDays);
};

export const scheduleMonthlyReportNotification = async () => {
    const isEnabled = await SettingsService.areReportsEnabled();
    if (!isEnabled) return null;

    return await Notifications.scheduleNotificationAsync({
        content: {
            title: i18n.t("notifications.monthlyReportTitle"),
            body: i18n.t("notifications.monthlyReportBody", {
                month: new Date().toLocaleString(i18n.language, { month: 'long' }),
            }),
            data: { type: 'monthly_report' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
            day: 1,
            hour: 8,
            minute: 0,
        },
    });
};

export const scheduleWeeklyReportNotification = async () => {
    if (!(await SettingsService.areReportsEnabled())) return null;
    return Notifications.scheduleNotificationAsync({
        content: { title: i18n.t('notifications.weeklySummaryTitle'), body: i18n.t('notifications.weeklySummaryBody'), data: { type: 'weekly_summary' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: 8, minute: 0 },
    });
};

export const scheduleBackupReminderNotification = async () => {
    if (!(await SettingsService.areReportsEnabled())) return null;
    return Notifications.scheduleNotificationAsync({
        content: { title: i18n.t('notifications.backupReminderTitle'), body: i18n.t('notifications.backupReminderBody'), data: { type: 'backup_reminder' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: 15, hour: 9, minute: 0 },
    });
};

export const scheduleRecurringCreatedNotification = async (transactionId: string, title: string) => {
    if (!(await SettingsService.areRemindersEnabled())) return;
    await notificationService.createNotification({
        transaction_id: transactionId,
        type: 'recurring_created',
        title: i18n.t('notifications.recurringCreatedTitle'),
        body: i18n.t('notifications.recurringCreatedBody', { title }),
        trigger_date: new Date().toISOString(),
        is_active: true,
        is_read: false,
    });
};
