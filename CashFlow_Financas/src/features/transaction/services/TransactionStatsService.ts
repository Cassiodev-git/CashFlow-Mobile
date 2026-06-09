import { TransactionRepository } from "../repository/TransactionRepository";
import { UserRepository } from "@/features/user/repository/UserRepository";
import i18n from "@/i18n";

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

            const datePart = dateValue.split(' ')[0];
            const [y, m, d] = datePart.split('-');
            const transactionDate = new Date(Number(y), Number(m) - 1, Number(d));

            return (transactionDate.getMonth() + 1) === month && transactionDate.getFullYear() === year;
        });

        const income = periodTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const expense = periodTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount || 0), 0);

        return { income, expense, balance: income - expense };
    }

    async getMonthlyExpensePercentage(): Promise<MonthlyExpensePercentage> {
        const userId = await getLocalUserId();
        const transactions = (await transacRepo.listTransactions(userId)).filter(isPaidTransaction);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const getExpensesByMonth = (m: number, y: number) => transactions
            .filter(t => {
                const dateValue = t.date || t.created_at;
                if (!dateValue) return false;
                const [datePart] = dateValue.split(' ');
                const [year, month] = datePart.split('-').map(Number);
                return t.type === "expense" && (month - 1) === m && year === y;
            })
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const currentMonthExpenses = getExpensesByMonth(currentMonth, currentYear);
        const lastMonthExpenses = getExpensesByMonth(currentMonth - 1, currentYear);

        if (lastMonthExpenses === 0) return { percentage: 0, status: "neutral" };
        const percentage = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
        return { percentage: Number(percentage.toFixed(1)), status: percentage > 0 ? "negative" : percentage < 0 ? "positive" : "neutral" };
    }
}

export default new TransactionStatsService();
