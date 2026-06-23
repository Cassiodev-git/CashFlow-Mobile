import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';

import notificationService from '@/features/notification/services/notificationService';
import type { Notification } from '@/features/notification/validation';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

const getNotificationIcon = (type: string) => {
    if (type === 'due_date' || type === 'overdue') return 'clock';
    if (type === 'monthly_summary' || type === 'report') return 'bar-chart-2';
    if (type === 'goal_reached') return 'check-circle';
    if (type === 'goal_warning') return 'alert-circle';
    return 'bell';
};

export function NotificationList() {
    const theme = useTheme<Theme>();
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.listNotifications();
            setNotifications(data as Notification[]);
        } catch {
            setError(t("notifications.loadError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const formatDate = useCallback((value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString(i18n.language, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [i18n.language]);

    const handleMarkAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications((current) => current.map((item) => (
            item.id === id ? { ...item, is_read: true } : item
        )));
    };

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: scale(24), paddingBottom: scale(80) }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />}
            >
                {error ? (
                    <Box backgroundColor="surface" padding="m" borderRadius="m" borderWidth={1} borderColor="danger" marginBottom="m">
                        <Text variant="caption" color="danger">{error}</Text>
                    </Box>
                ) : null}

                {!loading && notifications.length === 0 ? (
                    <Box backgroundColor="surface" padding="m" borderRadius="m" borderWidth={1} borderColor="border" alignItems="center" marginTop="xxl">
                        <Feather name="bell-off" size={scale(24)} color={theme.colors.textSecondary} />
                        <Text color="textSecondary" marginTop="s">{t("notifications.empty")}</Text>
                    </Box>
                ) : null}

                {notifications.map((item, index) => {
                    const icon = getNotificationIcon(item.type);

                    return (
                        <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: 8 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 180, delay: index * 35 }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => handleMarkAsRead(item.id)}
                                style={{
                                    paddingVertical: scale(14),
                                    borderBottomWidth: 1,
                                    borderColor: theme.colors.divider,
                                }}
                            >
                                <Box flexDirection="row" alignItems="flex-start">
                                    <Box
                                        width={scale(38)}
                                        height={scale(38)}
                                        borderRadius="m"
                                        backgroundColor={item.is_read ? 'surface' : 'primaryLight'}
                                        alignItems="center"
                                        justifyContent="center"
                                        marginRight="m"
                                    >
                                        <Feather name={icon as any} size={scale(18)} color={item.is_read ? theme.colors.textSecondary : theme.colors.primary} />
                                    </Box>

                                    <Box flex={1}>
                                        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                            <Text variant="body" fontWeight="700" color="textPrimary">{item.title}</Text>
                                            <Text variant="caption" color={item.is_read ? 'textSecondary' : 'primary'}>
                                                {item.is_read ? t("notifications.read") : t("notifications.unread")}
                                            </Text>
                                        </Box>
                                        <Text variant="caption" color="textSecondary" marginTop="xs">{item.body}</Text>
                                        <Text variant="caption" color="textSecondary" marginTop="xs">
                                            {formatDate(item.trigger_date)}
                                        </Text>
                                    </Box>
                                </Box>
                            </TouchableOpacity>
                        </MotiView>
                    );
                })}
            </ScrollView>
        </Box>
    );
}
