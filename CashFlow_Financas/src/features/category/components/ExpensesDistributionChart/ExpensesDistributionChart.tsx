import React, { useMemo } from 'react';
import { PolarChart, Pie } from "victory-native";
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { MotiView } from 'moti';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

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
        <Box backgroundColor="card" borderRadius="xl" padding="m" style={{ marginBottom: scale(100), elevation: 2 }}>
            <Text variant="body" color="textPrimary" fontWeight="700">{t("graph.cardTitleExpense")}</Text>
            
            <Box alignItems="center" style={{ marginTop: scale(15) }}>

                <Box width={scale(150)} height={scale(150)} style={{ marginBottom: scale(20) }}>
                    <PolarChart
                        data={data}
                        colorKey={colorKey}
                        valueKey={valueKey}
                        labelKey={labelKey}
                    >
                        <Pie.Chart innerRadius={50} />
                    </PolarChart>
                </Box>

                <Box flexDirection="row" flexWrap="wrap" justifyContent="center" width="100%" style={{ gap: scale(12) }}>
                    {data.map((item, index) => (
                        <Box key={index} flexDirection="row" alignItems="center" style={{ paddingVertical: scale(6), paddingHorizontal: scale(10), borderRadius: scale(20) }}>
                            <Box width={scale(8)} height={scale(8)} style={{ borderRadius: scale(4), marginRight: scale(6), backgroundColor: item.color }} />
                            <Text variant="caption" color="textSecondary" numberOfLines={1}>
                                {item.label}
                            </Text>
                        </Box>
                    ))}
                </Box>

            </Box>
        </Box>
    );
}

export function ExpensesDistributionChartSkeleton() {
    const theme = useTheme<Theme>();
    const transition = useMemo(() => ({
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
                padding: scale(20),
                marginBottom: scale(100),
                elevation: 2,
            }}
        >
            <Text variant="body" color="textPrimary" fontWeight="700">
                <Skeleton width={180} height={18} borderRadius={4} />
            </Text>
            
            <Box alignItems="center" style={{ marginTop: scale(15) }}>
                <Box width={scale(150)} height={scale(150)} justifyContent="center" alignItems="center" style={{ marginBottom: scale(20) }}>
                    <Skeleton width={130} height={130} borderRadius={65} />
                </Box>

                <Box flexDirection="row" flexWrap="wrap" justifyContent="center" width="100%" style={{ gap: scale(12) }}>
                    <Box flexDirection="row" alignItems="center" style={{ paddingVertical: scale(6), paddingHorizontal: scale(10), borderRadius: scale(20) }}>
                        <Skeleton width={75} height={14} borderRadius={10} />
                    </Box>
                    <Box flexDirection="row" alignItems="center" style={{ paddingVertical: scale(6), paddingHorizontal: scale(10), borderRadius: scale(20) }}>
                        <Skeleton width={60} height={14} borderRadius={10} />
                    </Box>
                    <Box flexDirection="row" alignItems="center" style={{ paddingVertical: scale(6), paddingHorizontal: scale(10), borderRadius: scale(20) }}>
                        <Skeleton width={85} height={14} borderRadius={10} />
                    </Box>
                    <Box flexDirection="row" alignItems="center" style={{ paddingVertical: scale(6), paddingHorizontal: scale(10), borderRadius: scale(20) }}>
                        <Skeleton width={55} height={14} borderRadius={10} />
                    </Box>
                </Box>
            </Box>
        </MotiView>
    );
}
