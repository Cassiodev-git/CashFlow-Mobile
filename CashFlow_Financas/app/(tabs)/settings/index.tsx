import { ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SettingsItem } from '@/components/SettingsItem/SettingsItem';
import { Box, Text, scale, verticalScale } from '@/theme/unistyles';


export default function SettingsScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const SectionTitle = ({ title }: { title: string }) => (
        <Text variant="body" fontWeight="700" color="primary" marginTop="m" marginBottom="s">
            {title}
        </Text>
    );

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{
                    padding: scale(24),
                    paddingBottom: verticalScale(70),
                }}
            >
                <MotiView
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 220 }}
                >
                    <Box paddingTop="xxl" marginBottom="m">
                        <Text variant="titleLarge" color="textPrimary" fontWeight="700">
                            {t("settings.title")}
                        </Text>
                        <Text variant="body" color="textSecondary" marginTop="xs">
                            {t("settings.subtitle")}
                        </Text>
                    </Box>

                    <SectionTitle title={t("settings.account")} />
                    <SettingsItem 
                        icon="user" 
                        title={t("settings.profile")} 
                        subtitle={t("settings.profileSubtitle")} 
                        onPress={() => router.push('/(tabs)/settings/profile')} 
                    />
                    <SettingsItem 
                        icon="lock" 
                        title={t("settings.security")} 
                        subtitle={t("settings.securitySubtitle")} 
                        onPress={() => router.push("/(tabs)/settings/security")} 
                    />
                    <SettingsItem 
                        icon="bell" 
                        title={t("settings.notifications")} 
                        subtitle={t("settings.notificationsSubtitle")} 
                        onPress={() => {}} 
                    />

                    <SectionTitle title={t("settings.preferences")} />
                    <SettingsItem 
                        icon="dollar-sign" 
                        title={t("settings.currency")} 
                        subtitle={t("settings.currencySubtitle")} 
                        onPress={() => {}} 
                    />
                    <SettingsItem 
                        icon="sun" 
                        title={t("settings.theme")} 
                        subtitle={t("settings.lightMode")} 
                        onPress={() => {}} 
                    />
                    <SettingsItem 
                        icon="globe" 
                        title={t("settings.language")} 
                        subtitle={t("settings.languageSubtitle")} 
                        onPress={() => {}} 
                    />
                    <SettingsItem 
                        icon="list" 
                        title={t("settings.defaultCategory")} 
                        subtitle={t("settings.manageCategories")} 
                        onPress={() => {}} 
                    />

                    <SectionTitle title={t("settings.data")} />
                    <SettingsItem 
                        icon="download" 
                        title={t("settings.exportData")} 
                        subtitle={t("settings.exportDataSubtitle")} 
                        onPress={() => {}} 
                    />
                    <SettingsItem 
                        icon="database" 
                        title={t("settings.backup")} 
                        subtitle={t("settings.backupSubtitle")} 
                        onPress={() => {}} 
                    />

                    <SectionTitle title={t("settings.about")} />
                    <SettingsItem 
                        icon="info" 
                        title={t("settings.aboutApp")} 
                        subtitle={t("settings.appVersion", { version: "1.0.0" })} 
                        onPress={() => {}} 
                    />
                </MotiView>
            </ScrollView>
        </Box>
    );
}
