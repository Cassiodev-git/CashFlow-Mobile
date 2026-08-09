import { TransactionRepository } from "../repository/TransactionRepository";
import { UserRepository } from "@/features/user/repository/UserRepository";
import i18n from "@/i18n";
import { parseDateOnly, parseDatabaseTimestamp } from "@/utils/date";
import { startOfDay, isAfter } from "date-fns";

const transacRepo = new TransactionRepository();
const userRepo = new UserRepository();

export type TransactionSummary = {
    income: number;
    expense: number;
    balance: number;
};

export type MonthlyExpensePercentage = {
    percentage: number;
    status: "positive" | "negative" | "neutral";
};

async function getLocalUserId() {
    const user = await userRepo.findFirstUser();
    if (!user) {
        throw new Error(i18n.t("errors.userNotFoundForTransactionRead"));
    }
    return user.id;
}

function isPaidTransaction(transaction: { status?: string | null }) {
    return transaction.status === "paid";
}

class TransactionStatsService {
    async getSummary(): Promise<TransactionSummary> {
        const userId = await getLocalUserId();

        const now = new Date();
        const today = startOfDay(now);
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const transactions = (await transacRepo.listTransactions(userId))
            .filter(isPaidTransaction);

        let income = 0;
        let expense = 0;
        let balance = 0;

        for (const transaction of transactions) {
            const dateValue = transaction.date || transaction.created_at;
            if (!dateValue) continue;

            const date = dateValue.length > 10
                ? parseDatabaseTimestamp(dateValue)
                : parseDateOnly(dateValue);

            if (!date) continue;

            // TRAVA DE DATA FUTURA: Ignora qualquer lançamento cuja data seja posterior a hoje
            if (isAfter(startOfDay(date), today)) continue;

            const amount = Number(transaction.amount || 0);

            // Saldo geral acumulado até hoje
            if (transaction.type === "income") {
                balance += amount;
            } else if (transaction.type === "expense") {
                balance -= amount;
            }

            // Resumo restrito apenas ao MÊS e ANO ATUAL
            const isCurrentMonth =
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear;

            if (!isCurrentMonth) continue;

            if (transaction.type === "income") {
                income += amount;
            } else if (transaction.type === "expense") {
                expense += amount;
            }
        }

        return {
            income,
            expense,
            balance,
        };
    }

    async getSummaryByPeriod(month: number, year: number): Promise<TransactionSummary> {
        const userId = await getLocalUserId();
        const today = startOfDay(new Date());

        const transactions = (await transacRepo.listTransactions(userId)).filter(isPaidTransaction);

        const periodTransactions = transactions.filter((t) => {
            const dateValue = t.date || t.created_at;
            if (!dateValue) return false;

            const transactionDate = dateValue.length > 10
                ? parseDatabaseTimestamp(dateValue)
                : parseDateOnly(dateValue);
            if (!transactionDate) return false;

            // Ignora datas futuras no cálculo do período
            if (isAfter(startOfDay(transactionDate), today)) return false;

            return (transactionDate.getMonth() + 1) === month && transactionDate.getFullYear() === year;
        });

        const income = periodTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const expense = periodTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount || 0), 0);

        return { income, expense, balance: income - expense };
    }

    async getMonthlyExpensePercentage(): Promise<MonthlyExpensePercentage> {
        const userId = await getLocalUserId();
        const today = startOfDay(new Date());

        const transactions = (await transacRepo.listTransactions(userId))
            .filter(isPaidTransaction);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const getBalanceByMonth = (month: number, year: number) => {
            return transactions
                .filter(t => {
                    const dateValue = t.date || t.created_at;
                    if (!dateValue) return false;

                    const date = dateValue.length > 10
                        ? parseDatabaseTimestamp(dateValue)
                        : parseDateOnly(dateValue);

                    if (!date) return false;

                    // Ignora datas futuras
                    if (isAfter(startOfDay(date), today)) return false;

                    return (
                        date.getMonth() === month &&
                        date.getFullYear() === year
                    );
                })
                .reduce((balance, t) => {
                    const amount = Number(t.amount || 0);
                    return t.type === "income"
                        ? balance + amount
                        : balance - amount;
                }, 0);
        };

        const currentBalance = getBalanceByMonth(currentMonth, currentYear);
        const previousBalance = getBalanceByMonth(previousMonth, previousYear);
        const MIN_BASELINE = 50;

        if (Math.abs(previousBalance) < MIN_BASELINE) {
            return {
                percentage: 0,
                status: "neutral",
            };
        }

        let percentage = ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;

        percentage = Math.min(Math.max(percentage, -999), 999);

        return {
            percentage: Number(percentage.toFixed(1)),
            status:
                percentage > 0
                    ? "positive"
                    : percentage < 0
                        ? "negative"
                        : "neutral",
        };
    }
}

export default new TransactionStatsService();