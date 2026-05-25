import React from 'react';
import { View, Text } from 'react-native';
import { PolarChart, Pie } from "victory-native";
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Skeleton } from '../Skeleton/Skeleton';

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
    const {t} = useTranslation()
    const colorKey: "color" = "color";
    const valueKey: "value" = "value";
    const labelKey: "label" = "label";

    return (
        <View style={[styles.card, styles.cardMarginBottom]}>
            <Text style={styles.cardTitle}>{t("graph.cardTitleExpense")}</Text>
            
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

export function ExpensesDistributionChartSkeleton() {
    return (
        <MotiView
            from={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
                type: 'timing',
                duration: 600,
                loop: true,
                repeatReverse: true,
            }}
            style={[styles.card, styles.cardMarginBottom]}
        >
            <Text style={styles.cardTitle}>
                <Skeleton width={180} height={18} borderRadius={4} />
            </Text>
            
            <View style={styles.chartContainer}>
                <View style={[styles.donutContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Skeleton width={130} height={130} borderRadius={65} />
                </View>

                <View style={styles.categoryLegendHorizontal}>
                    <View style={styles.categoryItemRow}>
                        <Skeleton width={75} height={14} borderRadius={10} />
                    </View>
                    <View style={styles.categoryItemRow}>
                        <Skeleton width={60} height={14} borderRadius={10} />
                    </View>
                    <View style={styles.categoryItemRow}>
                        <Skeleton width={85} height={14} borderRadius={10} />
                    </View>
                    <View style={styles.categoryItemRow}>
                        <Skeleton width={55} height={14} borderRadius={10} />
                    </View>
                </View>
            </View>
        </MotiView>
    );
}

const styles = ScaledSheet.create({
    card: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 20, elevation: 2 },
    cardMarginBottom: { marginBottom: 100 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    
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
        paddingVertical: 6, 
        paddingHorizontal: 10, 
        borderRadius: 20 
    },
    categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    categoryLabel: { fontSize: 12, color: colors.textSecondary, marginRight: 4 },
    categoryValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
});