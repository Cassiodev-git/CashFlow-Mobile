import React from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Line, Area, useChartPressState } from "victory-native";
import { Circle } from "@shopify/react-native-skia";
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';

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
    const { state, isActive } = useChartPressState({
        x: "",
        y: { revenue: 0, expense: 0 },
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatAxisY = (val: number) => {
        if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
        return `R$ ${val}`;
    };

    const xKey: "day" = "day";
    const yKeys: ["revenue", "expense"] = ["revenue", "expense"];

    if (!data || data.length < 2) {
        return (
            <View style={[styles.card, styles.emptyContainer]}>
                <Text style={styles.cardTitle}>Receitas vs Despesas</Text>
                <Text style={styles.emptyText}>Dados insuficientes para gerar a linha temporal neste período.</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardTitle}>Receitas vs Despesas</Text>
                    {isActive ? (
                        <View style={styles.tooltipRow}>
                            <Text style={[styles.tooltipValue, { color: '#2ecc71' }]}>
                                Rec: {formatCurrency(state.y.revenue.value.value)}
                            </Text>
                            <Text style={[styles.tooltipValue, { color: '#e74c3c' }]}>
                                Des: {formatCurrency(state.y.expense.value.value)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.cardSubtitle}>Pressione e arraste para inspecionar valores</Text>
                    )}
                </View>
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
                    <Text style={styles.legendText}>Receitas</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.legendText}>Despesas</Text>
                </View>
            </View>

            <View style={styles.chartHeight}>
                <CartesianChart 
                    data={data} 
                    xKey={xKey} 
                    yKeys={yKeys}
                    padding={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    chartPressState={state}
                    axisOptions={{
                        font: undefined, 
                        lineColor: '#ECEFF1', 
                        labelColor: 'transparent', 
                    }}
                >
                    {({ points, chartBounds }) => (
                        <>
                            
                            <Area points={points.revenue} y0={chartBounds.bottom} color="#2ecc71" opacity={0.06} curveType="natural" />
                            <Line points={points.revenue} color="#2ecc71" strokeWidth={3} curveType="natural" />

                            {points.revenue?.map((point, index) => {
                                if (typeof point.y !== 'number') return null;
                                return <Circle key={`rev-dot-${index}`} cx={point.x} cy={point.y} r={4} color="#2ecc71" />;
                            })}

                            <Area points={points.expense} y0={chartBounds.bottom} color="#e74c3c" opacity={0.06} curveType="natural" />
                            <Line points={points.expense} color="#e74c3c" strokeWidth={3} curveType="natural" />

                            {points.expense?.map((point, index) => {
                                if (typeof point.y !== 'number') return null;
                                return <Circle key={`exp-dot-${index}`} cx={point.x} cy={point.y} r={4} color="#e74c3c" />;
                            })}
                            {isActive && (
                                <>
                                    <Circle cx={state.x.position} cy={state.y.revenue.position} r={7} color="#2ecc71" />
                                    <Circle cx={state.x.position} cy={state.y.revenue.position} r={3} color="#FFF" />
                                    <Circle cx={state.x.position} cy={state.y.expense.position} r={7} color="#e74c3c" />
                                    <Circle cx={state.x.position} cy={state.y.expense.position} r={3} color="#FFF" />
                                </>
                            )}
                        </>
                    )}
                </CartesianChart>
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

const styles = ScaledSheet.create({
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 22, marginBottom: 20, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    cardSubtitle: { fontSize: 11, color: '#999', marginTop: 2 },
    tooltipRow: { flexDirection: 'row', gap: 12, marginTop: 4, backgroundColor: '#F8F9FB', padding: 6, borderRadius: 8 },
    tooltipValue: { fontSize: 12, fontWeight: '700' },
    legendContainer: { flexDirection: 'row', gap: 16, marginBottom: 15 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: '#666' },
    chartHeight: { height: 240, width: '100%' }, 

    
    xAxisLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 10 },
    axisLabelText: { fontSize: 10, color: '#888888', fontWeight: '600' },

    emptyContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 15, paddingHorizontal: 20 }
});