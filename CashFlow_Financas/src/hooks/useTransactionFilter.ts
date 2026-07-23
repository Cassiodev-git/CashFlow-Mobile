import { useMemo, useState } from 'react';

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
    /** Canonical inclusive dates in YYYY-MM-DD format. */
    startDate?: string;
    endDate?: string;
    minAmount?: number | null;
    maxAmount?: number | null;
}

const DEFAULT_FILTERS: FilterOptions = {
    searchQuery: '', type: 'all', status: 'all', categoryId: 'all', minAmount: null, maxAmount: null,
};

const normalizeDate = (value: string | null | undefined) => {
    const match = value?.match(/^(\d{4}-\d{2}-\d{2})/);
    return match?.[1] ?? null;
};

export function useTransactionFilter(initialTransactions: Transaction[] = []) {
    const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

    const filteredTransactions = useMemo(() => initialTransactions.filter((transaction) => {
        const search = filters.searchQuery.trim().toLocaleLowerCase();
        const matchesSearch = !search || transaction.title.toLocaleLowerCase().includes(search) || (transaction.description ?? '').toLocaleLowerCase().includes(search);
        const matchesType = filters.type === 'all' || transaction.type === filters.type;
        const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
        const matchesCategory = filters.categoryId === 'all' || transaction.category_id === filters.categoryId;
        const date = normalizeDate(transaction.date);
        const matchesDate = date !== null && (!filters.startDate || date >= filters.startDate) && (!filters.endDate || date <= filters.endDate);
        const amount = Number(transaction.amount);
        const matchesAmount = Number.isFinite(amount) && (filters.minAmount == null || amount >= filters.minAmount) && (filters.maxAmount == null || amount <= filters.maxAmount);

        return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesDate && matchesAmount;
    }), [filters, initialTransactions]);

    const updateFilter = (newFilters: Partial<FilterOptions>) => {
        setFilters((previous) => {
            const next = { ...previous, ...newFilters };
            return {
                ...next,
                minAmount: next.minAmount != null && Number.isFinite(next.minAmount) ? next.minAmount : null,
                maxAmount: next.maxAmount != null && Number.isFinite(next.maxAmount) ? next.maxAmount : null,
            };
        });
    };

    const resetFilters = () => setFilters(DEFAULT_FILTERS);

    return { filters, updateFilter, resetFilters, filteredTransactions };
}
