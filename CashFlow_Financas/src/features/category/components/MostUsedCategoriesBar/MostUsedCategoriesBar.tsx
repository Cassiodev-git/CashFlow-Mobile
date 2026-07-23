import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import { Box, Text, type Theme } from '@/theme/unistyles';
import { useMostUsedCategories } from '@/hooks/useMostUsedCategories';

interface MostUsedCategoriesBarProps {
    selectedCategoryId: string;
    transactionType: 'income' | 'expense';
    onSelect: (categoryId: string) => void;
}

export function MostUsedCategoriesBar({ selectedCategoryId, transactionType, onSelect }: MostUsedCategoriesBarProps) {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    const { categories, loading } = useMostUsedCategories(10);
    const visibleCategories = categories.filter((category) => category.type === transactionType);

    if (loading || visibleCategories.length === 0) return null;

    return (
        <Box marginBottom="s">
            <Text variant="caption" fontWeight="600" marginBottom="xs">
                {t('categories.mostUsed')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.s }}>
                {visibleCategories.map((category) => {
                    const selected = selectedCategoryId === category.id;
                    const icon = (category.icon as keyof typeof MaterialCommunityIcons.glyphMap) || 'tag';
                    return (
                        <TouchableOpacity key={category.id} activeOpacity={0.75} onPress={() => onSelect(category.id)}>
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                paddingHorizontal="s"
                                paddingVertical="xs"
                                borderRadius="m"
                                borderWidth={1}
                                borderColor={selected ? 'primary' : 'border'}
                                backgroundColor={selected ? 'primaryLight' : 'surface'}
                            >
                                <MaterialCommunityIcons name={icon} size={16} color={selected ? theme.colors.primary : theme.colors.iconMuted} />
                                <Text variant="caption" color={selected ? 'primary' : 'textSecondary'} marginLeft="xs" fontWeight="600">
                                    {category.name}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Box>
    );
}
