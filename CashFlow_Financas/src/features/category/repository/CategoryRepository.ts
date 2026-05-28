import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { categories } from "../schema";
import { eq } from "drizzle-orm";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../validation";

export class CategoryRepository {
    async createCategory(data: CreateCategoryDTO){
        const result = await db.insert(categories).values({
            ...data,
            id: uuid(),
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
    
}
