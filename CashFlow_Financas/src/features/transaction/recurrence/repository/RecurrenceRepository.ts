import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { and, eq } from "drizzle-orm";
import { recurrenceRules, transactions } from "@/db/schema";
import { getLocalDateString } from "@/utils/date";

export interface RecurrencePayload {
    frequency?: "daily" | "weekly" | "monthly" | "yearly" | string | null;
    interval?: number | null;
    date?: string | null;
    end_date?: string | null;
}

export class RecurrenceRepository {
    async createRecurrence(data: RecurrencePayload, transactionId: string, executor: any = db) {
        const values = {
            id: uuid(),
            transaction_id: transactionId,
            frequency: data.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
            interval: data.interval ?? 1,
            last_generated_date: data.date ?? getLocalDateString(),
            end_date: data.end_date ?? null,
        };

        return await executor.insert(recurrenceRules).values(values).returning();
    }

    async findGeneratedTransaction(recurrenceId: string, date: string) {
        const [result] = await db
            .select({ id: transactions.id })
            .from(transactions)
            .where(and(
                eq(transactions.recurrence_id, recurrenceId),
                eq(transactions.date, date),
            ))
            .limit(1);

        return result ?? null;
    }

    async updateRecurrence(id: string, data: RecurrencePayload) {
        const values: Record<string, any> = {};
        if (data.frequency) values.frequency = data.frequency;
        if (data.interval) values.interval = data.interval;
        if (data.end_date !== undefined) values.end_date = data.end_date;
        if (data.date) values.last_generated_date = data.date;

        return await db.update(recurrenceRules)
            .set(values)
            .where(eq(recurrenceRules.id, id));
    }

    async updateLastGeneratedDate(id: string, lastGeneratedDate: string) {
        return await db.update(recurrenceRules)
            .set({ last_generated_date: lastGeneratedDate })
            .where(eq(recurrenceRules.id, id));
    }

    async deleteRecurrence(id: string) {
        return await db.delete(recurrenceRules).where(eq(recurrenceRules.id, id));
    }

    async findById(id: string) {
        const [result] = await db
            .select()
            .from(recurrenceRules)
            .where(eq(recurrenceRules.id, id));
        return result;
    }

    async listRecurringTransactions(userId: string, executor: any = db): Promise<{
        rule: typeof recurrenceRules.$inferSelect;
        transaction: typeof transactions.$inferSelect | null;
    }[]> {
        return await executor
            .select({
                rule: recurrenceRules,
                transaction: transactions,
            })
            .from(recurrenceRules)
            .leftJoin(transactions, eq(recurrenceRules.transaction_id, transactions.id))
            .where(eq(transactions.user_id, userId));
    }

    async findByTransactionId(transactionId: string) {
        const [result] = await db
            .select()
            .from(recurrenceRules)
            .where(eq(recurrenceRules.transaction_id, transactionId));
        return result;
    }

    async deleteByTransactionId(transactionId: string) {
        return await db.delete(recurrenceRules)
            .where(eq(recurrenceRules.transaction_id, transactionId));
    }
    async clearAll(){
        await db.delete(recurrenceRules)
    }
}
