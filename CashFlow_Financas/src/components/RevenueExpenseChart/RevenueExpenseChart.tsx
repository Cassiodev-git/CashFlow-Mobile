import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { CartesianChart, Line, Area, useChartPressState } from "victory-native";
import { Circle, useFont } from "@shopify/react-native-skia";
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Skeleton } from '../Skeleton/Skeleton';

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
            <View style={[styles.card, styles.emptyContainer]}>
                <Text style={styles.cardTitle}>{t("graph.cardTitleRevenue")}</Text>
                <Text style={styles.emptyText}>{t("graph.titleDescription")}</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardTitle}>{t("graph.titleDescription")}</Text>
                    {showTooltip ? (
                        <View style={styles.tooltipRow}>
                            <Text style={[styles.tooltipValue, { color: '#2ecc71' }]}>
                                Rec: {formatCurrency(state.y.revenue.value.value)}
                            </Text>
                            <Text style={[styles.tooltipValue, { color: '#e74c3c' }]}>
                                Des: {formatCurrency(state.y.expense.value.value)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.cardSubtitle}>{t("graph.cardSubtitle")}</Text>
                    )}
                </View>
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
                    <Text style={styles.legendText}>{t("graph.revenue")}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.legendText}>{t("graph.expense")}</Text>
                </View>
            </View>

            <View style={styles.chartWrapper}>

                <View style={[styles.yAxisColumn, {
                    paddingTop: CHART_PADDING_TOP,
                    paddingBottom: CHART_PADDING_BOTTOM,
                }]}>
                    {yLabels.map((label, index) => (
                        <Text key={`y-lbl-${index}`} style={styles.yAxisLabel}>
                            {label}
                        </Text>
                    ))}
                </View>

                <View style={styles.chartHeight}>
                    <CartesianChart
                        data={data}
                        xKey={xKey}
                        yKeys={yKeys}
                        padding={{ top: CHART_PADDING_TOP, bottom: CHART_PADDING_BOTTOM, left: 1, right: 12 }}

                        domainPadding={{ top: 90, bottom: 20, left: 8, right: 8 }}
                        chartPressState={state}
                        axisOptions={{
                            font: font || undefined,
                            lineColor: '#ECEFF1',
                            labelColor: 'transparent',
                            formatYLabel: () => '',
                        }}
                    >
                        {({ points, chartBounds }) => (
                            <>
                                <Area points={points.revenue} y0={chartBounds.bottom} color="#2ecc71" opacity={0.06} curveType="natural" />
                                <Area points={points.expense} y0={chartBounds.bottom} color="#e74c3c" opacity={0.06} curveType="natural" />

                                <Line points={points.revenue} color="#2ecc71" strokeWidth={3} curveType="natural" />
                                <Line points={points.expense} color="#e74c3c" strokeWidth={3} curveType="natural" />

                                {points.revenue?.map((point, index) => {
                                    if (typeof point.y !== 'number') return null;
                                    return <Circle key={`rev-dot-${index}`} cx={point.x} cy={point.y} r={5} color="#2ecc71" />;
                                })}

                                {points.expense?.map((point, index) => {
                                    if (typeof point.y !== 'number') return null;
                                    return <Circle key={`exp-dot-${index}`} cx={point.x} cy={point.y} r={5} color="#e74c3c" />;
                                })}

                                {showTooltip && (
                                    <>
                                        <Circle cx={state.x.position} cy={state.y.revenue.position} r={8} color="#2ecc71" />
                                        <Circle cx={state.x.position} cy={state.y.revenue.position} r={3} color="#FFF" />
                                        <Circle cx={state.x.position} cy={state.y.expense.position} r={8} color="#e74c3c" />
                                        <Circle cx={state.x.position} cy={state.y.expense.position} r={3} color="#FFF" />
                                    </>
                                )}
                            </>
                        )}
                    </CartesianChart>
                </View>
            </View>

            <View style={styles.xAxisLabelsRow}>
                {data.map((item, index) => (
                    <Text key={`x-lbl-${index}`} style={styles.axisLabelText}>
                        {item.day}
                    </Text>
                ))}
            </View>
        </View>
    );
}

export function RevenueExpenseChartSkeleton() {
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
            style={styles.card}
        >
            <View style={[styles.cardHeader, { marginBottom: 16 }]}>
                <View style={{ gap: 6 }}>
                    <Skeleton width={160} height={18} borderRadius={4} />
                    <Skeleton width={110} height={12} borderRadius={4} />
                </View>
            </View>

            <View style={[styles.legendContainer, { marginBottom: 24 }]}>
                <View style={styles.legendItem}>
                    <Skeleton width={60} height={14} borderRadius={4} />
                </View>
                <View style={styles.legendItem}>
                    <Skeleton width={60} height={14} borderRadius={4} />
                </View>
            </View>

            <View style={[styles.chartWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                <Skeleton width="100%" height={210} borderRadius={12} />
            </View>

            <View style={[styles.xAxisLabelsRow, { paddingLeft: 0, paddingRight: 0, marginTop: 16 }]}>
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
                <Skeleton width={24} height={10} borderRadius={2} />
            </View>
        </MotiView>
    );
}

const styles = ScaledSheet.create({
    card: { backgroundColor: colors.card, borderRadius: 24, padding: 22, marginBottom: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    cardSubtitle: { fontSize: 11, color: '#999', marginTop: 2 },
    tooltipRow: { flexDirection: 'row', gap: 12, marginTop: 4, backgroundColor: colors.surface, padding: 6, borderRadius: 8 },
    tooltipValue: { fontSize: 12, fontWeight: '700' },
    legendContainer: { flexDirection: 'row', gap: 16, marginBottom: 15 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: '#666' },
    chartWrapper: { flexDirection: 'row', alignItems: 'stretch' },
    yAxisColumn: { width: 44, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8 },
    yAxisLabel: { fontSize: 9, color: colors.textSecondary },
    chartHeight: { flex: 1, height: 240 },
    xAxisLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingLeft: 44, paddingRight: 15 },
    axisLabelText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
    emptyContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 15, paddingHorizontal: 20 },
});
