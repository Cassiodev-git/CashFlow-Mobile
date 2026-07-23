import { useState, useEffect, useCallback } from 'react';
import AppTransactionsService from '@/services/AppTransactionsService';
import AppCategoryService from '@/services/AppCategoryService';
import { Transactions as Transaction } from "@/features/transaction/types/Transactions";
import { useTranslation } from 'react-i18next';
import { DeviceEventEmitter } from 'react-native';
import { logger } from '@/utils/logger';

export type ReportPeriod = 'week' | 'month' | 'year';
export interface GraphInsights {
    balance: number;
    expenseAverage: number;
    topCategories: Array<{ name: string; amount: number }>;
    status: Record<'paid' | 'pending' | 'canceled', number>;
    busiestDay: string | null;
    recurringBalance: number;
    balanceChange: number;
    totalExpenses: number;
}

export function useReports(selectedTab: ReportPeriod) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); 
    const [error, setError] = useState<boolean>(false);   
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [pieChartData, setPieChartData] = useState<any[]>([]);
    const [insights, setInsights] = useState<GraphInsights | null>(null);

    const loadChartData = useCallback(async (isPullToRefresh = false) => {
        try {
            if (isPullToRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(false); 

            const [transactions, categories] = await Promise.all([
                AppTransactionsService.listTransactions(),
                AppCategoryService.listCategories(),
            ]);
            const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

            const formattedLineData = filterAndGroupTransactionsByDay(transactions, selectedTab);
            const formattedPieData = groupTransactionsByCategory(transactions, selectedTab, categoryNames, t);

            setLineChartData(formattedLineData);
            setPieChartData(formattedPieData);
            setInsights(buildInsights(transactions, selectedTab, categoryNames, t));
        } catch (err) {
            logger.error("Erro ao carregar os dados dos gráficos:", err);
            setError(true); 
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedTab, t]);

    useEffect(() => {
        loadChartData();
    }, [loadChartData]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('transaction_mutated', () => {
            loadChartData(true);
        });
        return () => subscription.remove();
    }, [loadChartData]);

    const refresh = useCallback(() => {
        loadChartData(false); 
    }, [loadChartData]);

    const onRefresh = useCallback(() => {
        loadChartData(true); 
    }, [loadChartData]);

    return { 
        loading, 
        refreshing, 
        error, 
        lineChartData, 
        pieChartData,
        insights,
        refresh, 
        onRefresh 
    };
}

function buildInsights(transactions: Transaction[], period: ReportPeriod, categoryNames: Map<string, string>, t: (key: string) => string): GraphInsights {
    const periodTransactions = transactions
        .map((transaction) => ({ transaction, date: getSafeDate(transaction) }))
        .filter((item): item is { transaction: Transaction; date: Date } => item.date !== null && checkPeriodMatch(item.date, period));
    const active = periodTransactions.filter(({ transaction }) => transaction.status !== 'canceled');
    const expenses = active.filter(({ transaction }) => transaction.type === 'expense');
    const categoryTotals = new Map<string, number>();
    const days = new Map<string, number>();
    const status: GraphInsights['status'] = { paid: 0, pending: 0, canceled: 0 };
    let balance = 0;
    let recurringBalance = 0;

    periodTransactions.forEach(({ transaction, date }) => {
        const amount = Number(transaction.amount) || 0;
        const transactionStatus = transaction.status === 'paid' || transaction.status === 'canceled' ? transaction.status : 'pending';
        status[transactionStatus] += 1;
        if (transaction.status === 'canceled') return;
        balance += transaction.type === 'income' ? amount : -amount;
        if (transaction.is_recurring) recurringBalance += transaction.type === 'income' ? amount : -amount;
        if (transaction.type === 'expense') {
            const categoryId = transaction.category_id ?? 'uncategorized';
            categoryTotals.set(categoryId, (categoryTotals.get(categoryId) ?? 0) + amount);
            const day = date.toISOString().slice(0, 10);
            days.set(day, (days.get(day) ?? 0) + amount);
        }
    });
    const topCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, amount]) => ({ name: categoryNames.get(id) ?? t('graph.others'), amount }));
    const busiestDay = [...days.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const now = new Date();
    const previousPeriod = getPreviousPeriod(period, now);
    const previousBalance = transactions.reduce((total, transaction) => {
        const date = getSafeDate(transaction);
        if (!date || date < previousPeriod.start || date > previousPeriod.end || transaction.status === 'canceled') return total;
        return total + (transaction.type === 'income' ? Number(transaction.amount) : -Number(transaction.amount));
    }, 0);
    return { balance, expenseAverage: expenses.length ? expenses.reduce((total, { transaction }) => total + Number(transaction.amount), 0) / expenses.length : 0, topCategories, status, busiestDay, recurringBalance, balanceChange: balance - previousBalance, totalExpenses: expenses.reduce((total, { transaction }) => total + Number(transaction.amount), 0) };
}

function getPreviousPeriod(period: ReportPeriod, now: Date) {
    if (period === 'week') {
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 23, 59, 59);
        return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), end };
    }
    if (period === 'month') return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) };
    return { start: new Date(now.getFullYear() - 1, 0, 1), end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59) };
}

function checkPeriodMatch(transactionDate: Date, period: ReportPeriod): boolean {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tDateStart = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());

    if (period === 'week') {
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return tDateStart >= sevenDaysAgo && tDateStart <= todayStart;
    }
    if (period === 'month') {
        return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
    }
    if (period === 'year') {
        return transactionDate.getFullYear() === now.getFullYear();
    }
    return false;
}

function getXKeyLabel(transactionDate: Date, period: ReportPeriod): string {
    if (period === 'year') {
        return transactionDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    }
    if (period === 'week') {
        return `${transactionDate.getDate()}/${transactionDate.getMonth() + 1}`;
    }
    return String(transactionDate.getDate());
}

function getSafeDate(transaction: Transaction): Date | null {
    const rawDate = transaction.date || (transaction as any).created_at;
    if (!rawDate) return null;

    const cleanDateStr = rawDate.slice(0, 10);
    const parsedDate = new Date(`${cleanDateStr}T12:00:00`);
    
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function filterAndGroupTransactionsByDay(transactions: Transaction[], period: ReportPeriod) {
    const validTransactions = transactions
        .map(t => ({ transaction: t, tDate: getSafeDate(t) }))
        .filter(item => item.tDate !== null && checkPeriodMatch(item.tDate, period) && item.transaction.status !== 'canceled');

    const dailyMap: Record<string, { day: string; revenue: number; expense: number; sortIndex: number }> = {};

    validTransactions.forEach(({ transaction: t, tDate }) => {
        const xAxisLabel = getXKeyLabel(tDate!, period);

        if (!dailyMap[xAxisLabel]) {
            dailyMap[xAxisLabel] = { 
                day: xAxisLabel, 
                revenue: 0, 
                expense: 0,
                sortIndex: period === 'year' ? tDate!.getMonth() : tDate!.getTime()
            };
        }

        if (t.type === 'income') {
            dailyMap[xAxisLabel].revenue += Number(t.amount);
        } else if (t.type === 'expense') {
            dailyMap[xAxisLabel].expense += Number(t.amount);
        }
    });

    return Object.values(dailyMap).sort((a, b) => a.sortIndex - b.sortIndex);
}

function groupTransactionsByCategory(
    transactions: Transaction[],
    period: ReportPeriod,
    categoryNames: Map<string, string>,
    t: (key: string) => string,
) {
    const expenses = transactions
        .map(t => ({ transaction: t, tDate: getSafeDate(t) }))
        .filter(item => item.tDate !== null && item.transaction.type === 'expense' && checkPeriodMatch(item.tDate, period) && item.transaction.status !== 'canceled');

    const categoryMap: Record<string, { label: string; value: number; transactionCount: number }> = {};
    const colorPalette = ["#2D6A4F", "#FF9F1C", "#3A86FF", "#FFD60A", "#80ED99", "#E74C3C", "#9B59B6"];

    expenses.forEach((item) => {
        const categoryId = item.transaction.category_id || 'uncategorized';
        const categoryName = categoryNames.get(categoryId) || t("graph.others");

        if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = {
                label: categoryName,
                value: 0,
                transactionCount: 0,
            };
        }

        categoryMap[categoryId].value += Number(item.transaction.amount);
        categoryMap[categoryId].transactionCount += 1;
    });

    return Object.values(categoryMap)
        .filter((category) => category.transactionCount >= 3)
        .sort((left, right) => right.value - left.value)
        .map((category, index) => ({
            label: category.label,
            value: category.value,
            color: colorPalette[index % colorPalette.length],
        }));
}
