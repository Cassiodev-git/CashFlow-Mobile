import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CartesianChart, Line, Area, useChartPressState } from "victory-native";
import { Circle, useFont } from "@shopify/react-native-skia";
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { MotiView } from 'moti';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

interface ChartItem {
    day: string;
    revenue: number;
    expense: number;
    [key: string]: string | number;
}

interface RevenueExpenseChartProps {
    data: ChartItem[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const { state, isActive } = useChartPressState({
        x: "",
        y: { revenue: 0, expense: 0 },
    });

    const [showTooltip, setShowTooltip] = useState(false);

    const systemFont = Platform.select({
        ios: "Helvetica",
        android: "sans-serif",
        default: "sans-serif",
    });
    const font = useFont(systemFont, 10);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isActive) {
            setShowTooltip(true);
        } else if (showTooltip) {
            timer = setTimeout(() => {
                setShowTooltip(false);
            }, 4000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isActive, showTooltip]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatYLabel = (val: number): string => {
        if (val >= 1_000_000) return `R$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 500) return `R$${(val / 1_000).toFixed(1)}k`;
        return `R$${Math.round(val)}`;
    };

    const TICK_COUNT = 5;
    const CHART_PADDING_TOP = 5;
    const CHART_PADDING_BOTTOM = 5;

    const yLabels = React.useMemo(() => {
        if (!data || data.length < 2) return [];

        const allValues = data.flatMap(d => [d.revenue, d.expense]);
        const minVal = Math.min(...allValues);
        const maxVal = Math.max(...allValues);
        const range = maxVal - minVal || 1;
        const paddedMax = maxVal + range * 0.18;
        const paddedMin = Math.max(0, minVal - range * 0.05);

        return Array.from({ length: TICK_COUNT }, (_, i) => {
            const val = paddedMax - (i * (paddedMax - paddedMin) / (TICK_COUNT - 1));
            return formatYLabel(val);
        });
    }, [data]);

    const xKey: "day" = "day";
    const yKeys: ["revenue", "expense"] = ["revenue", "expense"];

    if (!data || data.length < 2) {
        return (
            <Box backgroundColor="card" borderRadius="xl" padding="l" marginBottom="s" height={scale(200)} justifyContent="center" alignItems="center" style={{ elevation: 2 }}>
                <Text variant="body" color="textPrimary" fontWeight="700">{t("graph.cardTitleRevenue")}</Text>
                <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: scale(15), paddingHorizontal: scale(20) }}>{t("graph.titleDescription")}</Text>
            </Box>
        );
    }

    return (
        <Box backgroundColor="card" borderRadius="xl" padding="l" marginBottom="s" style={{ elevation: 2 }}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                <Box>
                    <Text variant="body" color="textPrimary" fontWeight="700">{t("graph.titleDescription")}</Text>
                    {showTooltip ? (
                        <Box flexDirection="row" backgroundColor="surface" padding="s" borderRadius="s" style={{ gap: scale(12), marginTop: scale(4) }}>
                            <Text variant="caption" fontWeight="700" color="income">
                                Rec: {formatCurrency(state.y.revenue.value.value)}
                            </Text>
                            <Text variant="caption" fontWeight="700" color="expense">
                                Des: {formatCurrency(state.y.expense.value.value)}
                            </Text>
                        </Box>
                    ) : (
                        <Text variant="caption" color="textSecondary" style={{ marginTop: scale(2) }}>{t("graph.cardSubtitle")}</Text>
                    )}
                </Box>
            </Box>

            <Box flexDirection="row" marginBottom="m" style={{ gap: scale(16) }}>
                <Box flexDirection="row" alignItems="center" style={{ gap: scale(6) }}>
                    <Box width={scale(8)} height={scale(8)} style={{ borderRadius: scale(4), backgroundColor: theme.colors.income }} />
                    <Text variant="caption" color="textSecondary">{t("graph.revenue")}</Text>
                </Box>
                <Box flexDirection="row" alignItems="center" style={{ gap: scale(6) }}>
                    <Box width={scale(8)} height={scale(8)} style={{ borderRadius: scale(4), backgroundColor: theme.colors.expense }} />
                    <Text variant="caption" color="textSecondary">{t("graph.expense")}</Text>
                </Box>
            </Box>

            <Box flexDirection="row" alignItems="stretch">

                <Box style={{
                    width: scale(44),
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    paddingRight: scale(8),
                    paddingTop: scale(CHART_PADDING_TOP),
                    paddingBottom: scale(CHART_PADDING_BOTTOM),
                }}>
                    {yLabels.map((label, index) => (
                        <Text key={`y-lbl-${index}`} variant="caption" color="textSecondary" style={{ fontSize: scale(9) }}>
                            {label}
                        </Text>
                    ))}
                </Box>

                <Box flex={1} height={scale(240)}>
                    <CartesianChart
                        data={data}
                        xKey={xKey}
                        yKeys={yKeys}
                        padding={{ top: CHART_PADDING_TOP, bottom: CHART_PADDING_BOTTOM, left: 1, right: 12 }}

                        domainPadding={{ top: 90, bottom: 20, left: 8, right: 8 }}
                        chartPressState={state}
                        axisOptions={{
                            font: font || undefined,
                            lineColor: theme.colors.divider,
                            labelColor: 'transparent',
                            formatYLabel: () => '',
                        }}
                    >
                        {({ points, chartBounds }) => (
                            <>
                                <Area points={points.revenue} y0={chartBounds.bottom} color={theme.colors.income} opacity={0.06} curveType="natural" />
                                <Area points={points.expense} y0={chartBounds.bottom} color={theme.colors.expense} opacity={0.06} curveType="natural" />

                                <Line points={points.revenue} color={theme.colors.income} strokeWidth={3} curveType="natural" />
                                <Line points={points.expense} color={theme.colors.expense} strokeWidth={3} curveType="natural" />

                                {points.revenue?.map((point, index) => {
                                    if (typeof point.y !== 'number') return null;
                                    return <Circle key={`rev-dot-${index}`} cx={point.x} cy={point.y} r={5} color={theme.colors.income} />;
                                })}

                                {points.expense?.map((point, index) => {
                                    if (typeof point.y !== 'number') return null;
                                    return <Circle key={`exp-dot-${index}`} cx={point.x} cy={point.y} r={5} color={theme.colors.expense} />;
                                })}

                                {showTooltip && (
                                    <>
                                        <Circle cx={state.x.position} cy={state.y.revenue.position} r={8} color={theme.colors.income} />
                                        <Circle cx={state.x.position} cy={state.y.revenue.position} r={3} color={theme.colors.surface} />
                                        <Circle cx={state.x.position} cy={state.y.expense.position} r={8} color={theme.colors.expense} />
                                        <Circle cx={state.x.position} cy={state.y.expense.position} r={3} color={theme.colors.surface} />
                                    </>
                                )}
                            </>
                        )}
                    </CartesianChart>
                </Box>
            </Box>

            <Box flexDirection="row" justifyContent="space-between" style={{ marginTop: scale(8), paddingLeft: scale(44), paddingRight: scale(15) }}>
                {data.map((item, index) => (
                    <Text key={`x-lbl-${index}`} variant="caption" color="textSecondary" fontWeight="600" style={{ fontSize: scale(10) }}>
                        {item.day}
                    </Text>
                ))}
            </Box>
        </Box>
    );
}

export function RevenueExpenseChartSkeleton() {
    const theme = useTheme<Theme>();
    const transition = React.useMemo(() => ({
        type: 'timing' as const,
        duration: 1000,
        loop: true,
        repeatReverse: true,
    }), []);

    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={transition}
            style={{
                backgroundColor: theme.colors.card,
                borderRadius: scale(24),
                padding: scale(22),
                marginBottom: scale(10),
                elevation: 2,
            }}
        >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" style={{ marginBottom: scale(16) }}>
                <Box style={{ gap: scale(6) }}>
                    <Skeleton width={160} height={18} borderRadius={4} />
                    <Skeleton width={110} height={12} borderRadius={4} />
                </Box>
            </Box>

            <Box flexDirection="row" style={{ gap: scale(16), marginBottom: scale(24) }}>
                <Box flexDirection="row" alignItems="center" style={{ gap: scale(6) }}>
                    <Skeleton width={60} height={14} borderRadius={4} />
                </Box>
                <Box flexDirection="row" alignItems="center" style={{ gap: scale(6) }}>
                    <Skeleton width={60} height={14} borderRadius={4} />
                </Box>
            </Box>

            <Box flexDirection="row" alignItems="center" justifyContent="center">
                <Skeleton width="100%" height={210} borderRadius={12} />
            </Box>

            <Box flexDirection="row" justifyContent="space-between" style={{ marginTop: scale(16) }}>
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
            </Box>
        </MotiView>
    );
}
