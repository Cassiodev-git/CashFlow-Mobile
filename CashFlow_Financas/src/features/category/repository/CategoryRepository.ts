import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { categories } from "../schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../validation";

export class CategoryRepository {
    async createCategory(data: CreateCategoryDTO){
        const result = await db.insert(categories).values({
            ...data,
            id: uuid(),
            created_at: new Date().toISOString()
        })

        return result
    }
    async updateCategory(id: string, data: UpdateCategoryDTO){
        const result = await db.update(categories).set({
            ...data,
            updated_at: new Date().toISOString()
        }).where(eq(categories.id, id))
        return result
    }
    async deleteCategory(id: string){
        const result = await db.delete(categories).where(eq(categories.id, id))
        return result
    }
    async listCategory(){
        return await db.select().from(categories)
    }
    async deleteManyCategories(ids: string[]){
        await db.delete(categories).where(inArray(categories.id, ids))
        return true
    }
    async findById(id: string){
        const result = await db.select().from(categories).where(eq(categories.id, id))
        return result[0] || null
    }
    async findByNameAndType(name: string, type: "income" | "expense") {
        const result = await db
            .select()
            .from(categories)
            .where(
                and(
                    eq(sql`LOWER(${categories.name})`, name.trim().toLowerCase()),
                    eq(categories.type, type)
                )
            )
        return result[0] || null
    }
}