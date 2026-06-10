import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { desc, eq } from "drizzle-orm";
import { transactions } from "../schema";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";
import { inArray } from "drizzle-orm"

export class TransactionRepository {
    async createTransaction(userId: string, data: CreateTransactionDTO) {
        const result = await db.insert(transactions).values({
            ...data,
            id: uuid(),
            user_id: userId,
        });

        return result;
    }

    async updateTransaction(id: string, data: UpdateTransactionDTO) {
        const result = await db.update(transactions).set({
            ...data,
            updated_at: new Date().toISOString()
        }).where(eq(transactions.id, id));

        return result;
    }

    async listTransactionByCategory(category_id: string) {
        return await db.select().from(transactions).where(eq(transactions.category_id, category_id));
    }

    async deleteTransaction(id: string) {
        const result = await db.delete(transactions).where(eq(transactions.id, id));
        return result;
    }

    async listTransactions(userId: string, options?: { limit?: number; offset?: number }) {
        const query = db
            .select()
            .from(transactions)
            .where(eq(transactions.user_id, userId))
            .orderBy(desc(transactions.date), desc(transactions.created_at));

        if (typeof options?.limit === "number") {
            return await query.limit(options.limit).offset(options.offset ?? 0);
        }

        const result = await query;
        return result;
    }
    async deleteManyTransactions(ids: string[]) {
        return await db.delete(transactions).where(inArray(transactions.id, ids));
    }
}
