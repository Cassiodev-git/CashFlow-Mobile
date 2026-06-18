import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import notificationService from '@/features/notification/services/notificationService';
import { scheduleMonthlyReportNotification } from '@/features/notification/utils/notificationsRules';

const KEY_GENERAL = '@cashflow_notifications_enabled';
const KEY_REMINDERS = '@cashflow_reminders_enabled';
const KEY_REPORTS = '@cashflow_reports_enabled';

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
    };

    const toggleReports = async (value: boolean) => {
        if (!isEnabled) return;
        setIsReportsEnabled(value);
        await AsyncStorage.setItem(KEY_REPORTS, value.toString());

        if (value) {
            await scheduleMonthlyReportNotification();
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    const clearHistory = async () => {
        await notificationService.deleteAllNotifications();
    };

    return { isEnabled, isRemindersEnabled, isReportsEnabled, toggleGeneral, toggleReminders, toggleReports, clearHistory };
};