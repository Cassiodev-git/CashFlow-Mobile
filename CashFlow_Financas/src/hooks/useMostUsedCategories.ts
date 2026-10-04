import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AppCategoryService from '@/services/AppCategoryService';

export interface MostUsedCategory {
    id: string;
    name: string;
    icon: string | null;
    type: string;
    transactionCount: number;
}

export function useMostUsedCategories(limit = 10) {
    const [categories, setCategories] = useState<MostUsedCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const result = await AppCategoryService.listMostUsedCategories(limit);
            setCategories(result.map((category) => ({
                ...category,
                transactionCount: Number(category.transactionCount),
            })));
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        void refresh();
        const transactionSubscription = DeviceEventEmitter.addListener('transaction_mutated', refresh);
        const categorySubscription = DeviceEventEmitter.addListener('category_mutated', refresh);
        return () => {
            transactionSubscription.remove();
            categorySubscription.remove();
        };
    }, [refresh]);

    return { categories, loading, refresh };
}
