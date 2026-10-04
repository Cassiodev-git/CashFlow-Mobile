import React, { useState } from 'react';
import { TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { AVAILABLE_ICONS } from '@/utils/categoryIcons'; 

interface CategoryFormProps {
    onSubmit: (data: { name: string; type: 'income' | 'expense'; icon: string }) => Promise<void> | void;
    initialData?: { name: string; type: 'income' | 'expense'; icon: string };
    loading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 5; 
const HORIZONTAL_PADDING = scale(16); 
const GRID_GAP = scale(10); 

const AVAILABLE_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const ITEM_SIZE = (AVAILABLE_WIDTH - (GRID_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export default function CategoryForm({ onSubmit, initialData, loading }: CategoryFormProps) {
    const theme = useTheme<Theme>();
    const { t } = useTranslation();
    
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
    const [icon, setIcon] = useState(initialData?.icon || 'dots-horizontal');

    const handleSave = async () => {
        if (!name.trim()) {
            Toast.show({ type: 'error', text1: t('feedback.validation.title'), text2: t('validation.category.nameRequired') });
            return;
        }
        await onSubmit({ name: name.trim(), type, icon });
    };

    return (
        <Box flex={1} backgroundColor="background" paddingHorizontal="m" paddingTop="xl">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: scale(140) }}>
                
                <Box marginBottom="m">
                    <Text variant="body" fontWeight="600" marginBottom="xs" color="textPrimary">
                        {t('categoryManagement.form.name')}
                    </Text>
                    <Box 
                        backgroundColor="surface" 
                        borderRadius="m" 
                        borderWidth={1} 
                        borderColor="border"
                        paddingHorizontal="m"
                        height={scale(54)}
                        justifyContent="center"
                    >
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder={t('categoryManagement.form.namePlaceholder')}
                            placeholderTextColor={theme.colors.textSecondary}
                            style={{
                                color: theme.colors.textPrimary,
                                fontSize: scale(16),
                            }}
                        />
                    </Box>
                </Box>

                <Box marginBottom="m">
                    <Text variant="body" fontWeight="600" marginBottom="xs" color="textPrimary">
                        {t('categoryManagement.form.type')}
                    </Text>
                    <Box flexDirection="row" style={{ gap: scale(10) }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setType('income')}
                            style={{
                                flex: 1,
                                height: scale(46),
                                borderRadius: scale(10),
                                borderWidth: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: type === 'income' ? theme.colors.successLight : theme.colors.surface,
                                borderColor: type === 'income' ? theme.colors.success : theme.colors.border,
                            }}
                        >
                            <Text 
                                variant="body" 
                                fontWeight="600" 
                                color={type === 'income' ? 'success' : 'textSecondary'}
                            >
                                {t('transactions.income')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setType('expense')}
                            style={{
                                flex: 1,
                                height: scale(46),
                                borderRadius: scale(10),
                                borderWidth: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: type === 'expense' ? theme.colors.dangerLight : theme.colors.surface,
                                borderColor: type === 'expense' ? theme.colors.danger : theme.colors.border,
                            }}
                        >
                            <Text 
                                variant="body" 
                                fontWeight="600" 
                                color={type === 'expense' ? 'danger' : 'textSecondary'}
                            >
                                {t('transactions.expense')}
                            </Text>
                        </TouchableOpacity>
                    </Box>
                </Box>

                <Box marginBottom="m">
                    <Text variant="body" fontWeight="600" marginBottom="s" color="textPrimary">
                        {t('categoryManagement.form.icon')}
                    </Text>
                    <Box 
                        flexDirection="row" 
                        flexWrap="wrap" 
                        style={{ gap: GRID_GAP }}
                    >
                        {AVAILABLE_ICONS.map((item) => {
                            const isSelected = icon === item.icon;
                            const activeColor = type === 'income' ? theme.colors.success : theme.colors.danger;
                            const activeBg = type === 'income' ? theme.colors.successLight : theme.colors.dangerLight;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.7}
                                    onPress={() => setIcon(item.icon)}
                                    style={{
                                        width: ITEM_SIZE,
                                        height: ITEM_SIZE,
                                        borderRadius: scale(12),
                                        borderWidth: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isSelected ? activeBg : theme.colors.surface,
                                        borderColor: isSelected ? activeColor : theme.colors.border,
                                    }}
                                >
                                    <MaterialCommunityIcons 
                                        name={item.icon} 
                                        size={scale(22)} 
                                        color={isSelected ? activeColor : theme.colors.textSecondary} 
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </Box>
                </Box>

            </ScrollView>

            <Box position="absolute" bottom={24} left={16} right={16}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={loading || !name.trim()}
                    onPress={handleSave}
                    style={{
                        backgroundColor: theme.colors.success,
                        height: scale(56),
                        borderRadius: scale(16),
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: !name.trim() || loading ? 0.6 : 1,
                    }}
                >
                    <Text variant="body" fontWeight="700" color="background">
                        {loading ? t('categoryManagement.form.saving') : t('categoryManagement.form.save')}
                    </Text>
                </TouchableOpacity>
            </Box>
        </Box>
    );
}
