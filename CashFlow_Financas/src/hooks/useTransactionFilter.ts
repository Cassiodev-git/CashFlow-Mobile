import { useState, useMemo } from 'react';

export interface Transaction {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    status: 'paid' | 'canceled' | 'pending';
    category_id?: string | null;
    user_id: string;
    created_at?: string; 
    updated_at?: string; 
}

export interface FilterOptions {
    searchQuery: string;
    type: 'all' | 'income' | 'expense';
    status: 'all' | 'paid' | 'canceled' | 'pending';
    categoryId: 'all' | string | null;
    startDate?: string;
    endDate?: string;
    minAmount?: number | null;
    maxAmount?: number | null;
}

export function useTransactionFilter(initialTransactions: Transaction[] = []) {
    const defaultFilters: FilterOptions = {
        searchQuery: '',
        type: 'all',
        status: 'all',
        categoryId: 'all',
        minAmount: null,
        maxAmount: null,
    };

    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

    const filteredTransactions = useMemo(() => {
        const baseTransactions = initialTransactions || [];
        
        return baseTransactions.filter((transaction) => {
            if (!transaction) return false;

            const matchesSearch = 
                (transaction.title?.toLowerCase() || '').includes(filters.searchQuery.toLowerCase()) ||
                (transaction.description?.toLowerCase() || '').includes(filters.searchQuery.toLowerCase());
            
            const matchesType = filters.type === 'all' || transaction.type === filters.type;
            
            const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
            
            const matchesCategory = filters.categoryId === 'all' || transaction.category_id === filters.categoryId;

            const matchesDate = 
                (!filters.startDate || transaction.date >= filters.startDate) &&
                (!filters.endDate || transaction.date <= filters.endDate);

            const matchesMinAmount = 
                filters.minAmount === null || 
                filters.minAmount === undefined || 
                transaction.amount >= filters.minAmount;

            const matchesMaxAmount = 
                filters.maxAmount === null || 
                filters.maxAmount === undefined || 
                transaction.amount <= filters.maxAmount;

            return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesDate && matchesMinAmount && matchesMaxAmount;
        });
    }, [initialTransactions, filters]);

    const updateFilter = (newFilters: Partial<FilterOptions>) => {
        setFilters((prev) => {
            const updated = { ...prev, ...newFilters };
            return {
                ...updated,
                minAmount: (updated.minAmount === 0 || updated.minAmount === undefined) ? null : updated.minAmount,
                maxAmount: (updated.maxAmount === 0 || updated.maxAmount === undefined) ? null : updated.maxAmount
            };
        });
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
    };

    return {
        filters,
        updateFilter,
        resetFilters,
        filteredTransactions,
    };
}