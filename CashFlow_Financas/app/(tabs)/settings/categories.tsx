import React, { useState, ComponentProps } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';

interface StaticCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
}

const MOCK_CATEGORIES: StaticCategory[] = [
    { id: '1', name: 'Alimentação', type: 'expense', icon: 'coffee' },
    { id: '2', name: 'Salário', type: 'income', icon: 'dollar-sign' },
    { id: '3', name: 'Transporte', type: 'expense', icon: 'truck' },
    { id: '4', name: 'Lazer', type: 'expense', icon: 'smile' },
    { id: '5', name: 'Investimentos', type: 'income', icon: 'trending-up' },
];

export default function CategoriesScreen() {
    const theme = useTheme<Theme>();
    const [categories] = useState<StaticCategory[]>(MOCK_CATEGORIES);

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: scale(24), paddingBottom: scale(110) }}
            >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingTop="xxl" marginBottom="m">
                    <Text variant="titleMedium" fontWeight="700">Categorias</Text>
                </Box>

                <Box backgroundColor="surface" padding="s" borderRadius="m" marginBottom="m" borderWidth={1} borderColor="border" alignItems="center">
                    <Text variant="caption" fontWeight="600" color="textSecondary">
                        Usando {categories.length} de 50 categorias
                    </Text>
                </Box>

                {categories.map((item, index) => {
                    const isIncome = item.type === 'income';
                    const iconName = (item.icon as ComponentProps<typeof Feather>['name']) || 'tag';

                    return (
                        <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 250, delay: index * 50 }}
                        >
                            <Box backgroundColor="surface" padding="m" borderRadius="m" marginBottom="m" borderWidth={1} borderColor="border">
                                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                    <Box flexDirection="row" alignItems="center" flex={1} paddingRight="s">
                                        <Box 
                                            width={scale(40)} 
                                            height={scale(40)} 
                                            borderRadius="m" 
                                            backgroundColor={isIncome ? 'successLight' : 'dangerLight'} 
                                            alignItems="center" 
                                            justifyContent="center"
                                            marginRight="m"
                                        >
                                            <Feather 
                                                name={iconName} 
                                                size={20} 
                                                color={isIncome ? theme.colors.success : theme.colors.danger} 
                                            />
                                        </Box>
                                        <Box flex={1}>
                                            <Text variant="body" fontWeight="700">{item.name}</Text>
                                            <Text variant="caption" color="textSecondary">
                                                {isIncome ? 'Receita' : 'Despesa'}
                                            </Text>
                                        </Box>
                                    </Box>

                                    <Box flexDirection="row" style={{ gap: scale(14) }}>
                                        <TouchableOpacity activeOpacity={0.7}>
                                            <Feather name="edit-2" size={18} color={theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.7}>
                                            <Feather name="trash-2" size={18} color={theme.colors.danger} />
                                        </TouchableOpacity>
                                    </Box>
                                </Box>
                            </Box>
                        </MotiView>
                    );
                })}
            </ScrollView>

            <Box position="absolute" bottom={24} left={0} right={0} alignItems="center">
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: theme.colors.primary,
                        paddingVertical: scale(14),
                        paddingHorizontal: scale(32),
                        borderRadius: scale(24),
                        shadowColor: theme.colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 5
                    }}
                >
                    <Text variant="body" fontWeight="700" color="textPrimary">
                        Criar Categoria
                    </Text>
                </TouchableOpacity>
            </Box>
        </Box>
    );
}