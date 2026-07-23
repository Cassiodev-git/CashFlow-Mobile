import { ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { Box, Text, type Theme } from '@/theme/unistyles';

const aboutItems = [
    { icon: 'smartphone', key: 'offline' },
    { icon: 'shield', key: 'privacy' },
    { icon: 'database', key: 'localFirst' },
] as const;

export default function AboutScreen() {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView contentContainerStyle={{ padding: theme.spacing.l }} showsVerticalScrollIndicator={false}>
                <Box paddingTop="l" alignItems="center" marginBottom="xl">
                    <Box width={56} height={56} borderRadius="xl" backgroundColor="primaryLight" justifyContent="center" alignItems="center" marginBottom="m">
                        <Feather name="circle" size={28} color={theme.colors.primary} />
                    </Box>
                    <Text variant="titleLarge" fontWeight="700">{t('aboutFinno.name')}</Text>
                    <Text variant="caption" marginTop="xs">{t('settings.appVersion', { version: '1.0.0' })}</Text>
                </Box>

                <Text variant="body" color="textSecondary" marginBottom="xl">{t('aboutFinno.introduction')}</Text>
                {aboutItems.map(({ icon, key }) => (
                    <Box key={key} flexDirection="row" backgroundColor="card" borderRadius="l" padding="m" borderWidth={1} borderColor="border" marginBottom="m">
                        <Box width={40} height={40} borderRadius="m" backgroundColor="primaryLight" alignItems="center" justifyContent="center" marginRight="m">
                            <Feather name={icon} size={20} color={theme.colors.primary} />
                        </Box>
                        <Box flex={1}>
                            <Text variant="body" fontWeight="700">{t(`aboutFinno.items.${key}.title`)}</Text>
                            <Text variant="caption" marginTop="xs">{t(`aboutFinno.items.${key}.description`)}</Text>
                        </Box>
                    </Box>
                ))}
                <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }}>{t('aboutFinno.footer')}</Text>
            </ScrollView>
        </Box>
    );
}
