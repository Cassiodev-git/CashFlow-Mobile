import { Modal, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';

import { SettingsItem } from '@/components/SettingsItem/SettingsItem';
import { availableCurrencies } from '@/features/settings/utils/currency';
import { useCurrency } from '@/features/settings/hooks/useCurrency';
import { Box, Text, scale, verticalScale, type Theme } from '@/theme/unistyles';
import { useAppTheme } from '@/features/settings/context/ThemeContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const theme = useTheme<Theme>();
    const { currency, saveCurrency } = useCurrency();
    const { themeMode, changeTheme } = useAppTheme();
    
    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

    const currentCurrencyLabel = useMemo(() => {
        const selectedCurrency = availableCurrencies.find((item) => item.code === currency);
        return selectedCurrency?.label ?? currency;
    }, [currency]);

    const currentThemeLabel = useMemo(() => {
        if (themeMode === 'light') return t("settings.lightMode");
        if (themeMode === 'dark') return t("settings.darkMode");
        return t("settings.systemMode");
    }, [themeMode, t]);

    const currentLanguageLabel = useMemo(() => {
        return i18n.language.startsWith('en') ? 'English' : 'Português';
    }, [i18n.language]);

    const themeOptions = useMemo(() => [
        { code: 'light' as const, label: t("settings.lightMode") },
        { code: 'dark' as const, label: t("settings.darkMode") },
        { code: 'system' as const, label: t("settings.systemMode") }
    ], [t]);

    const languageOptions = useMemo(() => [
        { code: 'pt-BR', label: 'Português' },
        { code: 'en', label: 'English' }
    ], []);

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
                    transition={{ type: 'timing', duration: 150 }}
                >
                    <Box paddingTop="xxl" marginBottom="m" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Box flex={1} marginRight="m">
                            <Text variant="titleLarge" color="textPrimary" fontWeight="700">
                                {t("settings.title")}
                            </Text>
                            <Text variant="body" color="textSecondary" marginTop="xs">
                                {t("settings.subtitle")}
                            </Text>
                        </Box>

                        <TouchableOpacity
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel={t("notifications.openList")}
                            onPress={() => router.push("/(tabs)/settings/notification-list")}
                            style={{
                                width: scale(42),
                                height: scale(42),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Feather name="bell" size={scale(20)} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
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
                        onPress={() => router.push("/(tabs)/settings/notification")} 
                    />

                    <SectionTitle title={t("settings.preferences")} />
                    <SettingsItem 
                        icon="repeat" 
                        title={t("settings.recurringTransactions")} 
                        subtitle={t("settings.recurringTransactionsSubtitle")} 
                        onPress={() => router.push("/(tabs)/settings/recurring")}
                    />
                    <SettingsItem 
                        icon="dollar-sign" 
                        title={t("settings.currency")} 
                        subtitle={currentCurrencyLabel}
                        onPress={() => setIsCurrencyModalVisible(true)}
                    />
                    <SettingsItem 
                        icon={themeMode === 'dark' ? "moon" : "sun"} 
                        title={t("settings.theme")} 
                        subtitle={currentThemeLabel} 
                        onPress={() => setIsThemeModalVisible(true)} 
                    />
                    <SettingsItem 
                        icon="globe" 
                        title={t("settings.language")} 
                        subtitle={currentLanguageLabel} 
                        onPress={() => setIsLanguageModalVisible(true)} 
                    />
                    <SettingsItem 
                        icon="list" 
                        title={t("settings.defaultCategory")} 
                        subtitle={t("settings.manageCategories")} 
                        onPress={() => router.push("/(tabs)/settings/categories")} 
                    />

                    <SectionTitle title={t("settings.data")} />

                    <SettingsItem 
                        icon="database" 
                        title={t("settings.backup")} 
                        subtitle={t("settings.backupSubtitle")} 
                        onPress={() => router.push("/(tabs)/settings/backup")} 
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

            <Modal
                visible={isCurrencyModalVisible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={() => setIsCurrencyModalVisible(false)}
            >
                <Box flex={1} justifyContent="flex-end">
                    <TouchableWithoutFeedback onPress={() => setIsCurrencyModalVisible(false)}>
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 160 }}
                            style={styles.overlay}
                        />
                    </TouchableWithoutFeedback>

                    <MotiView
                        from={{ translateY: 360 }}
                        animate={{ translateY: 0 }}
                        transition={{ type: 'timing', duration: 220 }}
                    >
                        <Box
                            backgroundColor="card"
                            borderTopLeftRadius="xl"
                            borderTopRightRadius="xl"
                            paddingHorizontal="m"
                            paddingTop="s"
                            style={{ paddingBottom: verticalScale(28) }}
                        >
                            <Box width={38} height={5} backgroundColor="inputBorder" borderRadius="m" alignSelf="center" marginBottom="m" />

                            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                                <Text variant="titleMedium" fontWeight="700">{t("settings.currency")}</Text>
                                <TouchableOpacity onPress={() => setIsCurrencyModalVisible(false)} style={{ padding: scale(4) }}>
                                    <Feather name="x" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </Box>

                            {availableCurrencies.map((item) => {
                                const isSelected = item.code === currency;

                                return (
                                    <TouchableOpacity
                                        key={item.code}
                                        activeOpacity={0.75}
                                        onPress={() => {
                                            saveCurrency(item.code).catch(() => undefined);
                                            setIsCurrencyModalVisible(false);
                                        }}
                                        style={{ paddingVertical: scale(13), borderBottomWidth: 1, borderColor: theme.colors.divider }}
                                    >
                                        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                                            <Box>
                                                <Text variant="body" fontWeight="600">{item.code}</Text>
                                                <Text variant="caption" color="textSecondary">{item.label}</Text>
                                            </Box>
                                            {isSelected && (
                                                <Feather name="check" size={20} color={theme.colors.primary} />
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                );
                            })}
                        </Box>
                    </MotiView>
                </Box>
            </Modal>

            <Modal
                visible={isThemeModalVisible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={() => setIsThemeModalVisible(false)}
            >
                <Box flex={1} justifyContent="flex-end">
                    <TouchableWithoutFeedback onPress={() => setIsThemeModalVisible(false)}>
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 160 }}
                            style={styles.overlay}
                        />
                    </TouchableWithoutFeedback>

                    <MotiView
                        from={{ translateY: 360 }}
                        animate={{ translateY: 0 }}
                        transition={{ type: 'timing', duration: 220 }}
                    >
                        <Box
                            backgroundColor="card"
                            borderTopLeftRadius="xl"
                            borderTopRightRadius="xl"
                            paddingHorizontal="m"
                            paddingTop="s"
                            style={{ paddingBottom: verticalScale(28) }}
                        >
                            <Box width={38} height={5} backgroundColor="inputBorder" borderRadius="m" alignSelf="center" marginBottom="m" />

                            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                                <Text variant="titleMedium" fontWeight="700">{t("settings.theme")}</Text>
                                <TouchableOpacity onPress={() => setIsThemeModalVisible(false)} style={{ padding: scale(4) }}>
                                    <Feather name="x" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </Box>

                            {themeOptions.map((item) => {
                                const isSelected = item.code === themeMode;

                                return (
                                    <TouchableOpacity
                                        key={item.code}
                                        activeOpacity={0.75}
                                        onPress={() => {
                                            changeTheme(item.code).catch(() => undefined);
                                            setIsThemeModalVisible(false);
                                        }}
                                        style={{ paddingVertical: scale(13), borderBottomWidth: 1, borderColor: theme.colors.divider }}
                                    >
                                        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                                            <Box>
                                                <Text variant="body" fontWeight="600">{item.label}</Text>
                                            </Box>
                                            {isSelected && (
                                                <Feather name="check" size={20} color={theme.colors.primary} />
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                );
                            })}
                        </Box>
                    </MotiView>
                </Box>
            </Modal>

            <Modal
                visible={isLanguageModalVisible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={() => setIsLanguageModalVisible(false)}
            >
                <Box flex={1} justifyContent="flex-end">
                    <TouchableWithoutFeedback onPress={() => setIsLanguageModalVisible(false)}>
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 160 }}
                            style={styles.overlay}
                        />
                    </TouchableWithoutFeedback>

                    <MotiView
                        from={{ translateY: 360 }}
                        animate={{ translateY: 0 }}
                        transition={{ type: 'timing', duration: 220 }}
                    >
                        <Box
                            backgroundColor="card"
                            borderTopLeftRadius="xl"
                            borderTopRightRadius="xl"
                            paddingHorizontal="m"
                            paddingTop="s"
                            style={{ paddingBottom: verticalScale(28) }}
                        >
                            <Box width={38} height={5} backgroundColor="inputBorder" borderRadius="m" alignSelf="center" marginBottom="m" />

                            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                                <Text variant="titleMedium" fontWeight="700">{t("settings.language")}</Text>
                                <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)} style={{ padding: scale(4) }}>
                                    <Feather name="x" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </Box>

                            {languageOptions.map((item) => {
                                const isSelected = (item.code === 'en' && i18n.language.startsWith('en')) || (item.code === 'pt-BR' && !i18n.language.startsWith('en'));

                                return (
                                    <TouchableOpacity
                                        key={item.code}
                                        activeOpacity={0.75}
                                        onPress={() => {
                                            i18n.changeLanguage(item.code);
                                            setIsLanguageModalVisible(false);
                                        }}
                                        style={{ paddingVertical: scale(13), borderBottomWidth: 1, borderColor: theme.colors.divider }}
                                    >
                                        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                                            <Box>
                                                <Text variant="body" fontWeight="600">{item.label}</Text>
                                            </Box>
                                            {isSelected && (
                                                <Feather name="check" size={20} color={theme.colors.primary} />
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                );
                            })}
                        </Box>
                    </MotiView>
                </Box>
            </Modal>
        </Box>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
});