import { useState, useEffect, useCallback } from 'react';
import AppCategoryService from '../services/AppCategoryService';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../features/category/validation';

export function useCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AppCategoryService.listCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar categorias.');
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
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const findById = useCallback(async (id: string) => {
        setError(null);
        try {
            return await AppCategoryService.findById(id);
        } catch (err: any) {
            setError(err.message);
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