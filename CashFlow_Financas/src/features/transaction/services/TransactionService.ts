import { TransactionRepository }
from "../repository/TransactionRepository";

import { UserRepository }
from "@/features/user/repository/UserRepository";

const transacRepo =
    new TransactionRepository();

const userRepo =
    new UserRepository();

export type TransactionSummary = {

    income: number;

    expense: number;

    balance: number;
};

export type MonthlyExpensePercentage = {

    percentage: number;

    status:
        | "positive"
        | "negative"
        | "neutral";
};

export class TransactionStatsService {

    async getUserSummary(
        user_id: string
    ): Promise<TransactionSummary> {

        const existingUser =
            await userRepo.findFirstUser();

        if (!existingUser) {
            throw new Error(
                "Usuário não existe"
            );
        }

        const transactions =
            await transacRepo
                .listTransactions(user_id);

        const income = transactions

            .filter(
                transaction =>
                    transaction.type === "income"
            )

            .reduce((acc, transaction) => {

                return (
                    acc +
                    Number(transaction.amount)
                );

            }, 0);

        const expense = transactions

            .filter(
                transaction =>
                    transaction.type === "expense"
            )

            .reduce((acc, transaction) => {

                return (
                    acc +
                    Number(transaction.amount)
                );

            }, 0);

        const balance =
            income - expense;

        return {
            income,
            expense,
            balance
        };
    }

    async getMonthlyExpensePercentage(
        user_id: string
    ): Promise<MonthlyExpensePercentage> {

        const transactions =
            await transacRepo
                .listTransactions(user_id);

        const now = new Date();

        const currentMonth =
            now.getMonth();

        const currentYear =
            now.getFullYear();

        const lastMonthDate =
            new Date(
                currentYear,
                currentMonth - 1,
                1
            );

        const lastMonth =
            lastMonthDate.getMonth();

        const lastMonthYear =
            lastMonthDate.getFullYear();

        const currentMonthExpenses =
            transactions

                .filter(transaction => {

                    if (!transaction.date) {
                        return false;
                    }

                    const transactionDate =
                        new Date(
                            transaction.date
                        );

                    return (
                        transaction.type ===
                            "expense" &&
                        transactionDate.getMonth() ===
                            currentMonth &&
                        transactionDate.getFullYear() ===
                            currentYear
                    );
                })

                .reduce((acc, transaction) => {

                    return (
                        acc +
                        Number(transaction.amount)
                    );

                }, 0);

        const lastMonthExpenses =
            transactions

                .filter(transaction => {

                    if (!transaction.date) {
                        return false;
                    }

                    const transactionDate =
                        new Date(
                            transaction.date
                        );

                    return (
                        transaction.type ===
                            "expense" &&
                        transactionDate.getMonth() ===
                            lastMonth &&
                        transactionDate.getFullYear() ===
                            lastMonthYear
                    );
                })

                .reduce((acc, transaction) => {

                    return (
                        acc +
                        Number(transaction.amount)
                    );

                }, 0);

        if (lastMonthExpenses === 0) {

            return {
                percentage: 0,
                status: "neutral"
            };
        }

        const percentage =

            (
                (
                    currentMonthExpenses -
                    lastMonthExpenses
                ) / lastMonthExpenses

            ) * 100;

        return {
            percentage: Number(
                percentage.toFixed(1)
            ),

            status:
                percentage > 0
                    ? "negative" as const
                    : percentage < 0
                        ? "positive" as const
                        : "neutral" as const
        };
    }
}

export default new TransactionStatsService();