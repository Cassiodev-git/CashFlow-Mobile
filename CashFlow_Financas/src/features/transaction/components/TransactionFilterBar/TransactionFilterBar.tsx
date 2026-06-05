import React, { useState } from 'react';
import { TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box, Text, type Theme } from '@/theme/unistyles';
import { FilterOptions } from '@/hooks/useTransactionFilter';
import { FiltersModal } from '../FiltersModal/FiltersModal';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useTranslation } from 'react-i18next'; // Import adicionado

interface Props {
    filters: FilterOptions;
    onUpdate: (newFilters: Partial<FilterOptions>) => void;
    onReset: () => void;
    loading?: boolean;
}

export function TransactionFilterBar({ filters, onUpdate, onReset, loading = false }: Props) {
    const theme = useTheme<Theme>();
    const { t } = useTranslation(); // Hook adicionado
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <Box paddingHorizontal="m" marginTop="s">
            {loading ? (
                <Skeleton width="100%" height={48} borderRadius={8} />
            ) : (
                <Box
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor="inputBackground"
                    borderRadius="s"
                    paddingHorizontal="m"
                    height={48}
                >
                    <Feather 
                        name="search" 
                        size={20} 
                        color={theme.colors.textSecondary} 
                        style={{ marginRight: 8 }} 
                    />
                    <TextInput
                        placeholder={t("transaction.searchPlaceholder")} // Traduzido
                        placeholderTextColor={theme.colors.textSecondary}
                        value={filters.searchQuery}
                        onChangeText={(text) => onUpdate({ searchQuery: text })}
                        style={{ flex: 1, color: theme.colors.textPrimary }}
                    />
                </Box>
            )}

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={{ marginTop: 8 }}
                contentContainerStyle={{ paddingRight: 16, alignItems: 'center' }}
            >
                <Box flexDirection="row" style={{ gap: 8 }}>
                    {loading ? (
                        <>
                            <Skeleton width={60} height={36} borderRadius={6} />
                            <Skeleton width={75} height={36} borderRadius={6} />
                            <Skeleton width={80} height={36} borderRadius={6} />
                            <Skeleton width={95} height={36} borderRadius={6} />
                        </>
                    ) : (
                        <>
                            {['all', 'income', 'expense'].map((type) => {
                                const isActive = filters.type === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => onUpdate({ type: type as any })}
                                    >
                                        <Box
                                            paddingHorizontal="m"
                                            height={36}
                                            borderRadius="s"
                                            justifyContent="center"
                                            alignItems="center"
                                            borderWidth={isActive ? 0 : 1}
                                            borderColor="border"
                                            backgroundColor={isActive ? 'primary' : 'card'}
                                        >
                                            <Text 
                                                color={isActive ? 'textInverse' : 'textSecondary'}
                                                style={{ fontSize: 14, fontWeight: '500' }}
                                            >
                                                {t(`transaction.types.${type}`)} {/* Traduzido dinamicamente */}
                                            </Text>
                                        </Box>
                                    </TouchableOpacity>
                                );
                            })}

                            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                                <Box 
                                    flexDirection="row" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    paddingHorizontal="m" 
                                    height={36} 
                                    borderRadius="s" 
                                    borderWidth={1}
                                    borderColor="border"
                                    backgroundColor="card"
                                >
                                    <Text color="textSecondary" style={{ marginRight: 4, fontSize: 14, fontWeight: '500' }}>
                                        {t("transaction.moreFilters")} {/* Traduzido */}
                                    </Text>
                                    <Feather name="chevron-down" size={16} color={theme.colors.textSecondary} />
                                </Box>
                            </TouchableOpacity>
                        </>
                    )}
                </Box>
            </ScrollView>

            <FiltersModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                currentFilters={filters}
                onApply={onUpdate}
                onReset={onReset}
            />
        </Box>
    );
}