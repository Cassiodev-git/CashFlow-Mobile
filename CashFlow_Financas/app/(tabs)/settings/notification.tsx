import React from 'react';
import { ScrollView, Switch } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { Box, Text, scale } from '@/theme/unistyles';
import { useNotification } from '@/hooks/useNotification';

export default function NotificationScreen() {
    const { t } = useTranslation();
    const { 
        isEnabled, isRemindersEnabled, isReportsEnabled, 
        toggleGeneral, toggleReminders, toggleReports, clearHistory 
    } = useNotification();

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: scale(24) }}>
                <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 220 }}>
                    <Box paddingTop="xxl" />

                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border" marginBottom="m">
                        <Box flex={1} marginRight="m">
                            <Text variant="body" fontWeight="600">{t("notifications.enable")}</Text>
                        </Box>
                        <Switch value={isEnabled} onValueChange={toggleGeneral} />
                    </Box>

                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border" marginBottom="m" opacity={isEnabled ? 1 : 0.5}>
                        <Box flex={1} marginRight="m">
                            <Text variant="body" fontWeight="600">{t("notifications.reminders")}</Text>
                        </Box>
                        <Switch value={isRemindersEnabled} onValueChange={toggleReminders} disabled={!isEnabled} />
                    </Box>

                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border" marginBottom="m" opacity={isEnabled ? 1 : 0.5}>
                        <Box flex={1} marginRight="m">
                            <Text variant="body" fontWeight="600">{t("notifications.reports")}</Text>
                        </Box>
                        <Switch value={isReportsEnabled} onValueChange={toggleReports} disabled={!isEnabled} />
                    </Box>

                    <Box backgroundColor="surface" padding="m" borderRadius="l" borderWidth={1} borderColor="border">
                        <Text variant="body" onPress={clearHistory} color="danger">{t("notifications.clearHistory")}</Text>
                    </Box>
                </MotiView>
            </ScrollView>
        </Box>
    );
}