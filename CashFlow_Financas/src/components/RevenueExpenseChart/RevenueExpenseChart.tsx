import React from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Line, Area } from "victory-native";
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
interface DataItem {
    day: string;
    revenue: number;
    expense: number;
    [key: string]: string | number; 
}

interface RevenueExpenseChartProps {
    data: DataItem[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
    const {t} = useTranslation()
    const xKey = "day";
    const yKeys: ("revenue" | "expense")[] = ["revenue", "expense"];

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("graph.cardTitlerRevenue")}</Text>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.dotRevenue]} />
                    <Text style={styles.legendText}>{t("graph.expense")}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.dotExpense]} />
                    <Text style={styles.legendText}>{t("graph.revenue")}</Text>
                </View>
            </View>

            <View style={styles.chartHeight}>
                <CartesianChart<DataItem, "day", "revenue" | "expense">
                    data={data} 
                    xKey={xKey} 
                    yKeys={yKeys}
                    padding={10}
                >
                    {({ points, chartBounds }) => (
                        <>
                            <Area 
                                points={points.revenue} 
                                y0={chartBounds.bottom} 
                                color="#2ecc71" 
                                opacity={0.1} 
                                curveType="natural"
                            />
                            <Line points={points.revenue} color="#2ecc71" strokeWidth={3} curveType="natural" />

                            <Area 
                                points={points.expense} 
                                y0={chartBounds.bottom} 
                                color="#e74c3c" 
                                opacity={0.1} 
                                curveType="natural"
                            />
                            <Line points={points.expense} color="#e74c3c" strokeWidth={3} curveType="natural" />
                        </>
                    )}
                </CartesianChart>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    card: { backgroundColor: colors.card, borderRadius: 24, padding: 9, marginBottom: 10, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 15 },
    legendContainer: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    dotRevenue: { backgroundColor: '#2ecc71' },
    dotExpense: { backgroundColor: '#e74c3c' },
    legendText: { fontSize: 12, color: '#666' },
    chartHeight: { height: 220, width: '100%' },
});