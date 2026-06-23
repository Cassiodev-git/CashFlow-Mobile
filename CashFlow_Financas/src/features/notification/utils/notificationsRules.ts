import { SettingsService } from '../services/settingsService';
import { NotificationManager } from '../managers/scheduleManager';
import type { CreateTransactionDTO, UpdateTransactionDTO } from '@/features/transaction/validation';
import * as Notifications from 'expo-notifications';
import i18n from '@/i18n';

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

    if (diffDays !== 2 && diffDays !== 1 && diffDays !== -1) return;

    let triggerDate = new Date();
    triggerDate.setHours(9, 0, 0, 0); 
    if (triggerDate <= now) {
        triggerDate = new Date(now.getTime() + 1000);
    }

    await NotificationManager.scheduleDueDate(transactionId, title, triggerDate);
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
