import React, { ComponentProps, useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box, Text, scale, type Theme } from '@/theme/unistyles';
import { useCategories } from '@/hooks/useCategories';
import CategoryForm from '@/features/category/components/CategoryForm/CategoryForm'; 
import { ConfirmationModal } from '@/components/ConfirmationModal/ConfirmationModal'; 

interface CategoryItem {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
}

export default function CategoriesScreen() {
    const theme = useTheme<Theme>();
    const { categories, loading, deleteCategory, createCategory, updateCategory } = useCategories();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleSaveCategory = async (data: { name: string; type: 'income' | 'expense'; icon: string }) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data);
            } else {
                await createCategory(data);
            }
            handleCloseForm();
        } catch (err) {
            console.log(err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCategory(null);
    };

    const handleLongPress = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handlePress = (id: string) => {
        if (selectedIds.length > 0) {
            handleLongPress(id);
        }
    };

    const handleDeletePress = () => {
        if (selectedIds.length > 10) {
            setIsConfirmModalOpen(true);
        } else {
            executeDelete();
        }
    };

    const executeDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => deleteCategory(id)));
            setSelectedIds([]);
            setIsConfirmModalOpen(false);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Box flex={1} backgroundColor="background">
            {selectedIds.length > 0 && (
                <Box position="absolute" top={scale(20)} right={scale(24)} zIndex={10}>
                    <TouchableOpacity activeOpacity={0.7} onPress={handleDeletePress}>
                        <MaterialCommunityIcons name="trash-can" size={26} color={theme.colors.danger} />
                    </TouchableOpacity>
                </Box>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: scale(24), paddingBottom: scale(110), paddingTop: scale(60) }}
            >
                {loading && categories.length === 0 && (
                    <Box justifyContent="center" alignItems="center" padding="m">
                        <ActivityIndicator color={theme.colors.primary} />
                    </Box>
                )}

                {categories.map((item, index) => {
                    const isIncome = item.type === 'income';
                    const iconName = (item.icon as ComponentProps<typeof MaterialCommunityIcons>['name']) || 'tag';
                    const isSelected = selectedIds.includes(item.id);

                    return (
                        <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 250, delay: index * 50 }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onLongPress={() => handleLongPress(item.id)}
                                onPress={() => handlePress(item.id)}
                            >
                                <Box 
                                    backgroundColor="surface" 
                                    padding="m" 
                                    borderRadius="m" 
                                    marginBottom="m" 
                                    borderWidth={1} 
                                    borderColor={isSelected ? "danger" : "border"}
                                    style={{ position: 'relative' }}
                                >
                                    {isSelected && (
                                        <Box 
                                            position="absolute" 
                                            left={0} 
                                            right={0} 
                                            top="90%" 
                                            height={scale(2)} 
                                            backgroundColor="danger" 
                                            zIndex={10} 
                                        />
                                    )}

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
                                                <MaterialCommunityIcons 
                                                    name={iconName} 
                                                    size={22} 
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
                                            <TouchableOpacity 
                                                activeOpacity={0.7} 
                                                disabled={selectedIds.length > 0}
                                                onPress={() => {
                                                    setEditingCategory(item as CategoryItem);
                                                    setIsFormOpen(true);
                                                }}
                                            >
                                                <MaterialCommunityIcons name="pencil" size={18} color={theme.colors.textSecondary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                activeOpacity={0.7} 
                                                onPress={() => deleteCategory(item.id)}
                                                disabled={selectedIds.length > 0}
                                            >
                                                <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.colors.danger} />
                                            </TouchableOpacity>
                                        </Box>
                                    </Box>
                                </Box>
                            </TouchableOpacity>
                        </MotiView>
                    );
                })}
            </ScrollView>

            <Box position="absolute" bottom={24} left={0} right={0} alignItems="center">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsFormOpen(true)}
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

            <Modal
                visible={isFormOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseForm}
            >
                <Box flex={1} justifyContent="flex-end">
                    <Box 
                        backgroundColor="background" 
                        borderTopLeftRadius="xl" 
                        borderTopRightRadius="xl" 
                        borderTopWidth={1}
                        borderColor="border"
                        height="85%"
                    >
                        <Box 
                            width={scale(38)} 
                            height={scale(4)} 
                            backgroundColor="border" 
                            borderRadius="s" 
                            alignSelf="center" 
                            marginTop="s" 
                            marginBottom="s" 
                        />

                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingHorizontal="m" marginBottom="s" marginTop="xs">
                            <Text variant="titleMedium" fontWeight="700">
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </Text>
                            <TouchableOpacity onPress={handleCloseForm} activeOpacity={0.7}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </Box>
                        
                        <CategoryForm 
                            onSubmit={handleSaveCategory} 
                            initialData={editingCategory || undefined}
                            loading={loading} 
                        />
                    </Box>
                </Box>
            </Modal>

            <ConfirmationModal 
                visible={isConfirmModalOpen}
                title="Excluir Categorias"
                description={`Você selecionou ${selectedIds.length} categorias. Tem certeza que deseja deletar todas elas de uma vez?`}
                confirmText="Deletar"
                cancelText="Cancelar"
                isDestructive={true}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeDelete}
            />
        </Box>
    );
}