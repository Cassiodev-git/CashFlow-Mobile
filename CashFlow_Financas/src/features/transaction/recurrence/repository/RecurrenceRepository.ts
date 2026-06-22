import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import { recurrenceRules, transactions } from "@/db/schema";
import type { CreateRecurrenceDTO, UpdateRecurrenceDTO } from "../validation";

export class RecurrenceRepository {
    async createRecurrence(data: CreateRecurrenceDTO) {
        const result = await db.insert(recurrenceRules).values({
            ...data,
            id: uuid(),
        }).returning();

        return result;
    }

    async updateRecurrence(id: string, data: UpdateRecurrenceDTO) {
        const result = await db.update(recurrenceRules).set({
            ...data
        }).where(eq(recurrenceRules.id, id));

        return result;
    }

    async deleteRecurrence(id: string) {
        const result = await db.delete(recurrenceRules).where(eq(recurrenceRules.id, id));
        return result;
    }

    async listRecurringTransactions(userId: string) {
        return await db
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
}