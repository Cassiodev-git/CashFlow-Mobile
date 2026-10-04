import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import notificationService from '@/features/notification/services/notificationService';
import { scheduleMonthlyReportNotification, scheduleWeeklyReportNotification, scheduleBackupReminderNotification } from '@/features/notification/utils/notificationsRules';

const KEY_GENERAL = '@cashflow_notifications_enabled';
const KEY_REMINDERS = '@cashflow_reminders_enabled';
const KEY_REPORTS = '@cashflow_reports_enabled';
const KEY_REPORT_NOTIFICATION = '@cashflow_monthly_report_notification_id';
const KEY_WEEKLY_NOTIFICATION = '@cashflow_weekly_summary_notification_id';
const KEY_BACKUP_NOTIFICATION = '@cashflow_backup_reminder_notification_id';

export const useNotification = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isRemindersEnabled, setIsRemindersEnabled] = useState(false);
    const [isReportsEnabled, setIsReportsEnabled] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const [general, reminders, reports] = await Promise.all([
            AsyncStorage.getItem(KEY_GENERAL),
            AsyncStorage.getItem(KEY_REMINDERS),
            AsyncStorage.getItem(KEY_REPORTS)
        ]);
        
        setIsEnabled(general === 'true');
        setIsRemindersEnabled(reminders === 'true');
        setIsReportsEnabled(reports === 'true');
    };

    const toggleGeneral = async (value: boolean) => {
        setIsEnabled(value);
        await AsyncStorage.setItem(KEY_GENERAL, value.toString());
        
        if (!value) {
            setIsRemindersEnabled(false);
            setIsReportsEnabled(false);
            await AsyncStorage.setItem(KEY_REMINDERS, 'false');
            await AsyncStorage.setItem(KEY_REPORTS, 'false');
            await AsyncStorage.removeItem(KEY_REPORT_NOTIFICATION);
            await AsyncStorage.removeItem(KEY_WEEKLY_NOTIFICATION);
            await AsyncStorage.removeItem(KEY_BACKUP_NOTIFICATION);
            await Notifications.cancelAllScheduledNotificationsAsync();
        } else {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                setIsEnabled(false);
                await AsyncStorage.setItem(KEY_GENERAL, 'false');
            }
        }
    };

    const toggleReminders = async (value: boolean) => {
        if (!isEnabled) return;
        setIsRemindersEnabled(value);
        await AsyncStorage.setItem(KEY_REMINDERS, value.toString());

        if (!value) {
            await notificationService.deleteDueDateNotifications();
        }
    };

    const toggleReports = async (value: boolean) => {
        if (!isEnabled) return;
        setIsReportsEnabled(value);
        await AsyncStorage.setItem(KEY_REPORTS, value.toString());

        if (value) {
            const currentReportId = await AsyncStorage.getItem(KEY_REPORT_NOTIFICATION);
            if (currentReportId) {
                await Notifications.cancelScheduledNotificationAsync(currentReportId);
            }

            const reportId = await scheduleMonthlyReportNotification();
            if (reportId) {
                await AsyncStorage.setItem(KEY_REPORT_NOTIFICATION, reportId);
            }
            const weeklyId = await scheduleWeeklyReportNotification();
            const backupId = await scheduleBackupReminderNotification();
            if (weeklyId) await AsyncStorage.setItem(KEY_WEEKLY_NOTIFICATION, weeklyId);
            if (backupId) await AsyncStorage.setItem(KEY_BACKUP_NOTIFICATION, backupId);
        } else {
            for (const key of [KEY_REPORT_NOTIFICATION, KEY_WEEKLY_NOTIFICATION, KEY_BACKUP_NOTIFICATION]) {
                const scheduledId = await AsyncStorage.getItem(key);
                if (scheduledId) await Notifications.cancelScheduledNotificationAsync(scheduledId);
                await AsyncStorage.removeItem(key);
            }
        }
    };

    const clearHistory = async () => {
        await notificationService.deleteAllNotifications();
    };

    return { isEnabled, isRemindersEnabled, isReportsEnabled, toggleGeneral, toggleReminders, toggleReports, clearHistory };
};
