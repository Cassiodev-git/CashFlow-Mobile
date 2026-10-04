import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';

import { scale, Theme } from '@/theme/unistyles';

export default function SettingsLayout() {
    const router = useRouter();
    const theme = useTheme<Theme>();
    const { t } = useTranslation();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: 'transparent' },
                headerStyle: { backgroundColor: theme.colors.background },
                headerShadowVisible: false,
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    color: theme.colors.textPrimary,
                    fontSize: scale(16),
                    fontWeight: '700',
                },
                headerBackVisible: false,
                headerLeft: () => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={t("common.back")}
                        onPress={() => router.back()}
                        style={{
                            width: scale(40),
                            height: scale(40),
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: scale(4),
                        }}
                    >
                        <Feather name="arrow-left" size={scale(24)} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                ),
            }}
        >
            <Stack.Screen name="index" options={{ animation: 'none', headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: t("profile.title") }} />
            <Stack.Screen name="security" options={{ title: t("settings.security") }} />
            <Stack.Screen name="notification" options={{ title: t("settings.notifications") }} />
            <Stack.Screen name="notification-list" options={{ title: t("notifications.historyTitle") }} />
            <Stack.Screen name="recurring" options={{ title: t("settings.recurringTransactions") }} />
            <Stack.Screen name="about" options={{ title: t("settings.aboutApp") }} />
        </Stack>
    );
}
