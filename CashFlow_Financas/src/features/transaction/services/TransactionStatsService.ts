import { TransactionRepository } from "../repository/TransactionRepository";
import { UserRepository } from "@/features/user/repository/UserRepository";
import i18n from "@/i18n";
import { parseDateOnly, parseDatabaseTimestamp } from "@/utils/date";

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
        const transactions = (await transacRepo.listTransactions(userId)).filter(isPaidTransaction);
        const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const expense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount || 0), 0);
        return { income, expense, balance: income - expense };
    }

    async getSummaryByPeriod(month: number, year: number): Promise<TransactionSummary> {
        const userId = await getLocalUserId();
        const transactions = (await transacRepo.listTransactions(userId)).filter(isPaidTransaction);

        const periodTransactions = transactions.filter((t) => {
            const dateValue = t.date || t.created_at;
            if (!dateValue) return false;

            const transactionDate = dateValue.length > 10
                ? parseDatabaseTimestamp(dateValue)
                : parseDateOnly(dateValue);
            if (!transactionDate) return false;

            return (transactionDate.getMonth() + 1) === month && transactionDate.getFullYear() === year;
        });

        const income = periodTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const expense = periodTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount || 0), 0);

        return { income, expense, balance: income - expense };
    }

    async getMonthlyExpensePercentage(): Promise<MonthlyExpensePercentage> {
        const userId = await getLocalUserId();
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