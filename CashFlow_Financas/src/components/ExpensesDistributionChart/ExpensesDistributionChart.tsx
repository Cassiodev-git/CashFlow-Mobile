import React from 'react';
import { View, Text } from 'react-native';
import { PolarChart, Pie } from "victory-native";
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';

interface CategoryItem {
    label: string;
    value: number;
    color: string;
    [key: string]: string | number; 
}

interface ExpensesDistributionChartProps {
    data: CategoryItem[];
}

export function ExpensesDistributionChart({ data }: ExpensesDistributionChartProps) {
    const colorKey: "color" = "color";
    const valueKey: "value" = "value";
    const labelKey: "label" = "label";

    return (
        <View style={[styles.card, styles.cardMarginBottom]}>
            <Text style={styles.cardTitle}>Distribuição de despesas</Text>
            
            <View style={styles.row}>
                <View style={styles.donutContainer}>
                    <PolarChart
                        data={data}
                        colorKey={colorKey}
                        valueKey={valueKey}
                        labelKey={labelKey}
                    >
                        <Pie.Chart innerRadius={50} />
                    </PolarChart>
                </View>

                <View style={styles.categoryLegend}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.categoryItem}>
                            <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                            <Text style={styles.categoryLabel} numberOfLines={1}>
                                {item.label}
                            </Text>
                            <Text style={styles.categoryValue}>{item.value}%</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    card: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 20, elevation: 2 },
    cardMarginBottom: { marginBottom: 100 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    donutContainer: { width: 140, height: 140 },
    categoryLegend: { flex: 1, marginLeft: 20, gap: 10 },
    categoryItem: { flexDirection: 'row', alignItems: 'center' },
    categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    categoryLabel: { flex: 1, fontSize: 13, color: '#444' },
    categoryValue: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
});