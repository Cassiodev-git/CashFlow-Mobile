import { db } from "@/db";
import { users } from "../schema";
import { transactions } from "@/features/transaction/schema";
import {v4 as uuid} from "uuid"
import { eq } from "drizzle-orm";
import type { CreateUserDTO, UpdateUserDTO } from "../validation";
export class UserRepository {
    async findFirstUser() {
        const result = await db
            .select()
            .from(users)
            .limit(1)
        return result[0] ?? null
    }
    async createUser(data: CreateUserDTO){
        const result = await db.insert(users).values({
            ...data,
            id: uuid(),
        })
        return result 
    }
    async updateUser(id: string, data: UpdateUserDTO){
        const result = await db.update(users).set({
            ...data,
            updated_at: new Date().toISOString()
        })
            .where(eq(users.id, id))
        return result 
    }
    async deleteUser(id: string){
        return await db.transaction(async (tx) => {
            await tx.delete(transactions).where(eq(transactions.user_id, id))
            return await tx.delete(users).where(eq(users.id, id))
        })
    }
    
}
