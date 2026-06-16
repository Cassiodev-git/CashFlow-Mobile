import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { MotiView } from 'moti';

import { RevenueExpenseChart, RevenueExpenseChartSkeleton } from '@/features/transaction/components/RevenueExpenseChart/RevenueExpenseChart';
import { ExpensesDistributionChart, ExpensesDistributionChartSkeleton } from '@/features/category/components/ExpensesDistributionChart/ExpensesDistributionChart';
import { ErrorState } from '@/components/ErrorState/ErrorState'; 
import { ReportPeriod, useReports } from '@/hooks/useReports'; 
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

export default function GraphScreen() {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    
    const [selectedTab, setSelectedTab] = useState<ReportPeriod>('month');
    const { loading, error, lineChartData, pieChartData, refresh } = useReports(selectedTab);

    const tabs: { id: ReportPeriod; label: string }[] = [
        { id: 'week', label: t("common.week") },
        { id: 'month', label: t("common.month") },
        { id: 'year', label: t("common.year") },
    ];

    if (error) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background" style={{ paddingHorizontal: scale(22) }}>
                <ErrorState onRetry={refresh} />
            </Box>
        );
    }

    return (
        <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={{ flex: 1, backgroundColor: theme.colors.card }}
                contentContainerStyle={{ padding: scale(24) }}
                showsVerticalScrollIndicator={false}
            >
                <Box style={{ marginTop: scale(40), marginBottom: scale(15) }}>
                    <Text variant="titleLarge" color="textPrimary" fontWeight="700">{t("graph.title")}</Text>
                    <Text variant="body" color="textSecondary" style={{ marginTop: scale(4) }}>{t("graph.titleDescription")}</Text>
                </Box>
                <Box flexDirection="row" borderRadius="m" padding="s" marginBottom="s" backgroundColor="surface">
                    {tabs.map((tab) => {
                        const isActive = selectedTab === tab.id;
                        return (
                            <TouchableOpacity 
                                key={tab.id} 
                                onPress={() => setSelectedTab(tab.id)}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: scale(8),
                                    alignItems: 'center',
                                    borderRadius: scale(10),
                                    backgroundColor: isActive ? theme.colors.primaryDark : 'transparent',
                                    elevation: isActive ? 2 : 0,
                                }}
                            >
                                <Text variant="caption" fontWeight="600" color={isActive ? 'textInverse' : 'textSecondary'}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Box>

                {loading ? (
                    <>
                        <RevenueExpenseChartSkeleton />
                        <ExpensesDistributionChartSkeleton />
                    </>
                ) : (
                    <>
                        {lineChartData.length > 0 ? (
                            <RevenueExpenseChart data={lineChartData} />
                        ) : (
                            <Box backgroundColor="card" borderRadius="xl" padding="xxl" marginBottom="m" alignItems="center" justifyContent="center" style={{ elevation: 1 }}>
                                <Text variant="body" color="textSecondary" fontWeight="600" style={{ textAlign: 'center' }}>{t("graph.empty")}</Text>
                            </Box>
                        )}

                        {pieChartData.length > 0 ? (
                            <ExpensesDistributionChart data={pieChartData} />
                        ) : (
                            <Box backgroundColor="card" borderRadius="xl" padding="xxl" marginBottom="m" alignItems="center" justifyContent="center" style={{ elevation: 1 }}>
                                <Text variant="body" color="textSecondary" fontWeight="600" style={{ textAlign: 'center' }}>{t("graph.empty")}</Text>
                            </Box>
                        )}
                    </>
                )}
            </ScrollView>
        </MotiView>
    );
}
