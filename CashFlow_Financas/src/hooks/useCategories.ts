import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter } from 'react-native';
import AppCategoryService from '../services/AppCategoryService';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../features/category/validation';

export function useCategories() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AppCategoryService.listCategories();
            setCategories(data);
        } catch (err: unknown) {
            setError(err instanceof Error && err.message ? err.message : t('categoryManagement.feedback.loadError'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (data: CreateCategoryDTO) => {
        setLoading(true);
        setError(null);
        try {
            await AppCategoryService.createCategory(data);
            await fetchCategories();
            DeviceEventEmitter.emit('category_mutated');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('categoryManagement.feedback.saveError'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const updateCategory = useCallback(async (id: string, data: UpdateCategoryDTO) => {
        setLoading(true);
        setError(null);
        try {
            await AppCategoryService.updateCategory(id, data);
            await fetchCategories();
            DeviceEventEmitter.emit('category_mutated');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('categoryManagement.feedback.saveError'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const deleteCategory = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await AppCategoryService.deleteCategory(id);
            await fetchCategories();
            DeviceEventEmitter.emit('category_mutated');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('categoryManagement.feedback.deleteError'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const deleteManyCategories = useCallback(async (ids: string[]) => {
        setLoading(true);
        setError(null);
        try {
            await AppCategoryService.deleteManyCategories(ids);
            await fetchCategories();
            DeviceEventEmitter.emit('category_mutated');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('categoryManagement.feedback.deleteError'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const findById = useCallback(async (id: string) => {
        setError(null);
        try {
            return await AppCategoryService.findById(id);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('categoryManagement.feedback.loadError'));
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        refresh: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        deleteManyCategories,
        findById
    };
}
