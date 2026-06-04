import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import AppTransactionService from '@/services/AppTransactionsService';
import { Transaction } from './useTransactionFilter';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback((isMounted = true) => {
        setLoading(true);
        AppTransactionService.listTransactions()
            .then((data: any[]) => {
                if (isMounted) {
                    const formattedData: Transaction[] = data.map(item => ({
                        id: item.id,
                        title: item.title,
                        description: item.description ?? null,
                        amount: item.amount,
                        type: item.type,
                        date: item.date,
                        status: item.status,
                        category_id: item.category_id ?? null,
                        user_id: item.user_id,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    }));
                    setTransactions(formattedData);
                }
            })
            .catch(err => console.error("Erro ao carregar transações:", err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });
    }, []);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            fetchTransactions(isMounted);
            return () => { isMounted = false };
        }, [fetchTransactions])
    );

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener("transaction_mutated", () => {
            fetchTransactions(true);
        });

        return () => {
            subscription.remove();
        };
    }, [fetchTransactions]);

    return { transactions, loading };
}