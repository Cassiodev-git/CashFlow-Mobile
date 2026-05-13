import { db } from "@/db";
import { users } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import { transactions } from "../schema";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";

export class TransactionRepository {
    async createTransaction(data: CreateTransactionDTO) {
        const [user] = await db.select().from(users).limit(1);
        const result = await db.insert(transactions).values({
            ...data,
            id: uuid(),
            user_id: user.id,
        });

        return result;
    }
    async updateTransaction(id: string, data:UpdateTransactionDTO ){
        const result = await db.update(transactions).set({
            ...data,
            updated_at: new Date().toISOString()
        }).where(eq(transactions.id, id))

        return result
    }
    async deleteTransaction(id: string){
        const result = await db.delete(transactions).where(eq(transactions.id, id))
        return result
    }
    async listTransactions(user_id: string){
        const result = await db.select().from(transactions).where(eq(transactions.user_id, user_id))
        return result
    }
}
