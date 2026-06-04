import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import AppTransactionSummaryService from '@/services/AppTransactionSummaryService';

export function useMonthlySummary() {
    const [date, setDate] = useState(() => {
        const now = new Date();
        return { month: now.getMonth() + 1, year: now.getFullYear() };
    });
    const [data, setData] = useState({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    const fetchSummary = useCallback((currentMonth: number, currentYear: number, isMounted = true) => {
        setLoading(true);
        AppTransactionSummaryService.getSummaryByPeriod(currentMonth, currentYear)
            .then((result) => {
                if (isMounted) setData(result);
            })
            .catch((error) => {
                console.error("Erro ao carregar resumo do período:", error);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
    }, []);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            fetchSummary(date.month, date.year, isMounted);
            return () => { isMounted = false };
        }, [date.month, date.year, fetchSummary])
    );

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener("transaction_mutated", () => {
            fetchSummary(date.month, date.year, true);
        });

        return () => {
            subscription.remove();
        };
    }, [date.month, date.year, fetchSummary]);

    const handleNext = () => {
        setDate(prev => {
            const nextMonth = prev.month === 12 ? 1 : prev.month + 1;
            const nextYear = prev.month === 12 ? prev.year + 1 : prev.year;
            return { month: nextMonth, year: nextYear };
        });
    };

    const handlePrev = () => {
        setDate(prev => {
            const prevMonth = prev.month === 1 ? 12 : prev.month - 1;
            const prevYear = prev.month === 1 ? prev.year - 1 : prev.year;
            return { month: prevMonth, year: prevYear };
        });
    };

    return { date, data, loading, handleNext, handlePrev };
}