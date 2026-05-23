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
            
            <View style={styles.chartContainer}>

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

                <View style={styles.categoryLegendHorizontal}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.categoryItemRow}>
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
    
    chartContainer: { alignItems: 'center', marginTop: 15 },
    donutContainer: { width: 150, height: 150, marginBottom: 20 },
    
    categoryLegendHorizontal: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 12, 
        width: '100%' 
    },
    categoryItemRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F5F6F8', 
        paddingVertical: 6, 
        paddingHorizontal: 10, 
        borderRadius: 20 
    },
    categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    categoryLabel: { fontSize: 12, color: '#444', marginRight: 4 },
    categoryValue: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
});