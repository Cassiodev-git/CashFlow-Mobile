import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, InteractionManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';

import { RevenueExpenseChart, RevenueExpenseChartSkeleton } from '@/features/transaction/components/RevenueExpenseChart/RevenueExpenseChart';
import { ExpensesDistributionChart, ExpensesDistributionChartSkeleton } from '@/features/category/components/ExpensesDistributionChart/ExpensesDistributionChart';
import { GraphInsights } from '@/features/transaction/components/GraphInsights/GraphInsights';
import { MonthlyComparisonChart } from '@/features/transaction/components/MonthlyComparisonChart/MonthlyComparisonChart';
import { ErrorState } from '@/components/ErrorState/ErrorState'; 
import { ReportPeriod, useReports } from '@/hooks/useReports'; 
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

export default function GraphScreen() {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    
    const [selectedTab, setSelectedTab] = useState<ReportPeriod>('month');
    const [isReady, setIsReady] = useState(false); // 1. Controle para aguardar a transição de tela terminar

    const { loading, error, lineChartData, pieChartData, insights, refresh } = useReports(selectedTab);

    // 1. Só libera a renderização do Skia APÓS o término da animação de navegação
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });
        return () => task.cancel();
    }, []);

    const tabs: { id: ReportPeriod; label: string }[] = [
        { id: 'week', label: t("common.week") },
        { id: 'month', label: t("common.month") },
        { id: 'year', label: t("common.year") },
    ];

    // 2. Trava de cliques repetidos durante a busca ou transição
    const handleTabPress = (tabId: ReportPeriod) => {
        if (loading || selectedTab === tabId) return;
        setSelectedTab(tabId);
    };

    if (error) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background" style={{ paddingHorizontal: scale(22) }}>
                <ErrorState onRetry={refresh} />
            </Box>
        );
    }

    return (
        // 3. Removido MotiView do contêiner raiz para não conflitar quadros com o Skia Canvas
        <Box flex={1} backgroundColor="card">
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: scale(24) }}
                showsVerticalScrollIndicator={false}
            >
                <Box style={{ marginTop: scale(20), marginBottom: scale(15) }}>
                    <Text variant="titleLarge" color="textPrimary" fontWeight="700">{t("graph.title")}</Text>
                    <Text variant="body" color="textSecondary" style={{ marginTop: scale(4) }}>{t("graph.titleDescription")}</Text>
                </Box>

                <Box flexDirection="row" borderRadius="m" padding="s" marginBottom="s" backgroundColor="surface">
                    {tabs.map((tab) => {
                        const isActive = selectedTab === tab.id;
                        return (
                            <TouchableOpacity 
                                key={tab.id} 
                                onPress={() => handleTabPress(tab.id)}
                                activeOpacity={0.7}
                                disabled={loading || !isReady} // Desabilita o clique enquanto carrega
                                style={{
                                    flex: 1,
                                    paddingVertical: scale(8),
                                    alignItems: 'center',
                                    borderRadius: scale(10),
                                    backgroundColor: isActive ? theme.colors.primaryDark : 'transparent',
                                    opacity: loading ? 0.6 : 1,
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
                {!isReady || loading ? (
                    <>
                        <RevenueExpenseChartSkeleton />
                        <ExpensesDistributionChartSkeleton />
                    </>
                ) : (
                    <>
                        {selectedTab === 'year' && <MonthlyComparisonChart data={lineChartData} />}
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
                        {insights && <GraphInsights data={insights} />}
                    </>
                )}
            </ScrollView>
        </Box>
    );
}