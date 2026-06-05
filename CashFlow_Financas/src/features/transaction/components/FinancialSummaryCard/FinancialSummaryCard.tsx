import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box, Text, scale } from '@/theme/unistyles';
import { Skeleton } from '@/components/Skeleton/Skeleton'; 
import { useTranslation } from 'react-i18next'; 

interface FinancialSummaryCardProps {
    periodo: string;
    receitas: string;
    despesas: string;
    saldo: string;
    onPrev: () => void;
    onNext: () => void;
    loading?: boolean;
}

export function FinancialSummaryCard({ 
    periodo, 
    receitas, 
    despesas, 
    saldo, 
    onPrev, 
    onNext,
    loading = false
}: FinancialSummaryCardProps) {
    const { t } = useTranslation();
    
    // Normaliza o mês: pega a primeira palavra, minúscula e remove o 'ç' para casar com a chave 'marco'
    const mesNormalizado = periodo.split(' ')[0].toLowerCase().replace('ç', 'c');
    const ano = periodo.split(' ')[1];

    return (
        <Box 
            backgroundColor="primary" 
            padding="m" 
            borderRadius="l" 
            style={{ 
                shadowColor: "modalOverlay",
                shadowOffset: { width: 0, height: scale(2) },
                shadowOpacity: 0.1,
                shadowRadius: scale(4),
                elevation: 3 
            }}
        >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                <Text variant="body" color="card" fontWeight="600">
                    {t(`date.months.${mesNormalizado}`)} {ano}
                </Text>
                <Box flexDirection="row" alignItems="center">
                    <TouchableOpacity onPress={onPrev} style={{ padding: scale(4) }}>
                        <Feather name="chevron-left" size={18} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onNext} style={{ padding: scale(4) }}>
                        <Feather name="chevron-right" size={18} color="white" />
                    </TouchableOpacity>
                </Box>
            </Box>

            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box flex={1}>
                    <Text variant="caption" color="card" opacity={0.8} marginBottom="xs">{t("graph.revenue")}</Text>
                    {loading ? (
                        <Skeleton width="80%" height={16} borderRadius={4} />
                    ) : (
                        <Text variant="body" color="incomeLight" fontWeight="700" numberOfLines={1} adjustsFontSizeToFit>{receitas}</Text>
                    )}
                </Box>
                
                <Box height={30} width={1} backgroundColor="card" opacity={0.3} marginHorizontal="s" />

                <Box flex={1} alignItems="center">
                    <Text variant="caption" color="card" opacity={0.8} marginBottom="xs">{t("graph.expense")}</Text>
                    {loading ? (
                        <Skeleton width="80%" height={16} borderRadius={4} />
                    ) : (
                        <Text variant="body" color="expense" fontWeight="700" numberOfLines={1} adjustsFontSizeToFit>{despesas}</Text>
                    )}
                </Box>
                
                <Box height={30} width={1} backgroundColor="card" opacity={0.3} marginHorizontal="s" />

                <Box flex={1} alignItems="flex-end">
                    <Text variant="caption" color="card" opacity={0.8} marginBottom="xs">{t("report.balance")}</Text>
                    {loading ? (
                        <Skeleton width="80%" height={16} borderRadius={4} />
                    ) : (
                        <Text variant="body" color="card" fontWeight="700"  numberOfLines={1} adjustsFontSizeToFit>{saldo}</Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
}