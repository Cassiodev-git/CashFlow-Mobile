import { Pressable, ScrollView } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { Box, Text, type Theme } from '@/theme/unistyles';
import AppCategoryService from '@/services/AppCategoryService';
import AppTransactionsService from '@/services/AppTransactionsService';
import { getLocalDateString } from '@/utils/date';

// Remova ou altere para false antes da versão final para ocultar o recurso.
const ENABLE_LOCAL_STRESS_TEST = true;

const aboutItems = [
    { icon: 'smartphone', key: 'offline' },
    { icon: 'shield', key: 'privacy' },
    { icon: 'database', key: 'localFirst' },
] as const;

export default function AboutScreen() {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const navigation = useNavigation();
    const [stressTestVisible, setStressTestVisible] = useState(false);
    const [stressTestStatus, setStressTestStatus] = useState('');
    const titleTapCount = useRef(0);
    const titleTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeStressTests = useRef(0);

    useEffect(() => () => {
        if (titleTapTimeout.current) clearTimeout(titleTapTimeout.current);
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Pressable onPress={handleAboutTitlePress} hitSlop={8}>
                    <Text variant="body" fontWeight="700">{t('settings.aboutApp')}</Text>
                </Pressable>
            ),
            headerRight: ENABLE_LOCAL_STRESS_TEST && stressTestVisible ? () => (
                <Pressable
                    onPress={() => { void createStressTransactions(); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Executar teste local de transações"
                    style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Feather name="zap" size={20} color={theme.colors.primary} />
                </Pressable>
            ) : undefined,
        });
    }, [navigation, stressTestVisible, t, theme.colors.primary]);

    const handleAboutTitlePress = () => {
        if (!ENABLE_LOCAL_STRESS_TEST) return;

        titleTapCount.current += 1;
        if (titleTapTimeout.current) clearTimeout(titleTapTimeout.current);
        titleTapTimeout.current = setTimeout(() => {
            titleTapCount.current = 0;
        }, 1200);

        if (titleTapCount.current >= 3) {
            titleTapCount.current = 0;
            setStressTestVisible(true);
        }
    };

    const createStressTransactions = async () => {
        activeStressTests.current += 1;
        const runNumber = activeStressTests.current;
        let created = 0;
        let failed = 0;

        setStressTestStatus(`Gerando lote ${runNumber}...`);

        try {
            const categories = await AppCategoryService.listCategories();
            const categoryIdsByType = {
                income: categories.filter((category) => category.type === 'income').map((category) => category.id),
                expense: categories.filter((category) => category.type === 'expense').map((category) => category.id),
            };
            const titles = ['Mercado', 'Transporte', 'Salario', 'Aluguel', 'Restau', 'Freelance', 'Farmacia', 'Invest'];
            const frequencies = ['daily', 'weekly', 'monthly', 'yearly'] as const;

            for (let index = 0; index < 100; index += 1) {
                const type = index % 4 === 0 ? 'income' : Math.random() < 0.65 ? 'expense' : 'income';
                const date = new Date();
                date.setDate(date.getDate() - 90 + Math.floor(Math.random() * 181));
                const categoryIds = categoryIdsByType[type];
                const statuses = ['paid', 'pending', 'canceled'] as const;
                const status = index < 3 ? statuses[index] : statuses[Math.floor(Math.random() * statuses.length)];
                const isRecurring = index % 7 === 0;
                const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
                const interval = 1 + Math.floor(Math.random() * 3);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 90 + Math.floor(Math.random() * 366));

                try {
                    await AppTransactionsService.createTransaction({
                        title: `Teste ${String(index + 1).padStart(3, '0')} ${titles[Math.floor(Math.random() * titles.length)]}`,
                        description: `Transação de estresse local ${index + 1}`,
                        amount: Number((5 + Math.random() * 995).toFixed(2)),
                        type,
                        status,
                        date: getLocalDateString(date),
                        category_id: categoryIds.length > 0 ? categoryIds[index % categoryIds.length] : undefined,
                        is_recurring: isRecurring,
                        frequency: isRecurring ? frequency : undefined,
                        interval: isRecurring ? interval : undefined,
                        end_date: isRecurring ? getLocalDateString(endDate) : undefined,
                    });
                    created += 1;
                } catch {
                    failed += 1;
                }
            }

            setStressTestStatus(`Lote ${runNumber}: ${created} criadas${failed > 0 ? `, ${failed} falharam` : ''}.`);
        } catch {
            setStressTestStatus(`Lote ${runNumber}: falha ao iniciar o teste.`);
        } finally {
            activeStressTests.current -= 1;
        }
    };

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

                {ENABLE_LOCAL_STRESS_TEST && stressTestVisible && stressTestStatus ? (
                    <Text variant="caption" color="textSecondary" marginBottom="xl" style={{ textAlign: 'center' }}>{stressTestStatus}</Text>
                ) : null}

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
