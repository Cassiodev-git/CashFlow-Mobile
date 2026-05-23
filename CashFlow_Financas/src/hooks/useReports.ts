import { useState, useEffect } from 'react';
import AppTransactionsService from '@/services/AppTransactionsService';
import { Transactions as Transaction } from "@/features/transaction/types/Transactions";

export function useReports(selectedTab: string) {
    const [loading, setLoading] = useState(true);
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [pieChartData, setPieChartData] = useState<any[]>([]);

    useEffect(() => {
        async function loadChartData() {
            try {
                setLoading(true);
                const transactions: Transaction[] = await AppTransactionsService.listTransactions();

                const formattedLineData = filterAndGroupTransactionsByDay(transactions, selectedTab);
                const formattedPieData = groupTransactionsByCategory(transactions, selectedTab);

                setLineChartData(formattedLineData);
                setPieChartData(formattedPieData);
            } catch (error) {
                console.error("Erro ao carregar os dados dos gráficos:", error);
            } finally {
                setLoading(false);
            }
        }

        loadChartData();
    }, [selectedTab]);

    return { loading, lineChartData, pieChartData };
}

function checkPeriodMatch(transactionDate: Date, period: string): boolean {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tDateStart = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());

    if (period === 'Semana') {
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return tDateStart >= sevenDaysAgo && tDateStart <= todayStart;
    }
    if (period === 'Mês') {
        return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
    }
    if (period === 'Ano') {
        return transactionDate.getFullYear() === now.getFullYear();
    }
    return false;
}

function getXKeyLabel(transactionDate: Date, period: string): string {
    if (period === 'Ano') {
        return transactionDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    }
    if (period === 'Semana') {
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

function filterAndGroupTransactionsByDay(transactions: Transaction[], period: string) {
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
                sortIndex: period === 'Ano' ? tDate!.getMonth() : tDate!.getTime()
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

function groupTransactionsByCategory(transactions: Transaction[], period: string) {
    const expenses = transactions
        .map(t => ({ transaction: t, tDate: getSafeDate(t) }))
        .filter(item => item.tDate !== null && item.transaction.type === 'expense' && checkPeriodMatch(item.tDate, period) && item.transaction.status !== 'canceled');

    const totalExpense = expenses.reduce((acc, item) => acc + Number(item.transaction.amount), 0);
    if (totalExpense === 0) return [];

    const categoryMap: Record<string, { label: string; value: number; color: string }> = {};
    const colorPalette = ["#2D6A4F", "#FF9F1C", "#3A86FF", "#FFD60A", "#80ED99", "#E74C3C", "#9B59B6"];

    expenses.forEach((item, index) => {
        const categoryName = item.transaction.category_id || "Outros";

        if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = {
                label: categoryName,
                value: 0,
                color: colorPalette[index % colorPalette.length]
            };
        }

        categoryMap[categoryName].value += Number(item.transaction.amount);
    });

    return Object.values(categoryMap).map(item => ({
        ...item,
        value: Math.round((item.value / totalExpense) * 100)
    }));
}