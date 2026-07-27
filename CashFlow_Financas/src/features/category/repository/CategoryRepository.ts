import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { categories, defaultCategoryExclusions } from "../schema";
import { transactions } from "@/features/transaction/schema";
import { eq, inArray, and, sql, desc } from "drizzle-orm";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../validation";

export class CategoryRepository {
    async createCategory(data: CreateCategoryDTO) {
        const result = await db.insert(categories).values({
            ...data,
            id: uuid(),
            created_at: new Date().toISOString()
        })

        return result
    }
    async updateCategory(id: string, data: UpdateCategoryDTO) {
        const result = await db.update(categories).set({
            ...data,
            updated_at: new Date().toISOString()
        }).where(eq(categories.id, id))
        return result
    }
    async deleteCategory(id: string) {
        if (id.startsWith('default-')) {
            await db.insert(defaultCategoryExclusions).values({ category_id: id }).onConflictDoNothing();
        }
        const result = await db.delete(categories).where(eq(categories.id, id))
        return result
    }
    async listCategory() {
        return await db.select().from(categories)
    }

    async seedDefaultCategories(
        defaults: Array<{ id: string; name: string; icon: string; type: 'income' | 'expense' }>,
        knownDefaultNames: Record<string, string[]> = {},
    ) {
        const excluded = await db.select({ id: defaultCategoryExclusions.category_id }).from(defaultCategoryExclusions);
        const excludedIds = new Set(excluded.map((item) => item.id));
        const existing = await db.select({ id: categories.id, name: categories.name }).from(categories);
        const existingIds = new Set(existing.map((item) => item.id));
        const missing = defaults.filter((category) => !excludedIds.has(category.id) && !existingIds.has(category.id));
        if (missing.length > 0) await db.insert(categories).values(missing);

        const existingById = new Map(existing.map((category) => [category.id, category]));
        for (const category of defaults) {
            const current = existingById.get(category.id);
            const knownNames = knownDefaultNames[category.id] ?? [];
            if (
                current &&
                !excludedIds.has(category.id) &&
                current.name !== category.name &&
                knownNames.includes(current.name)
            ) {
                await db.update(categories)
                    .set({ name: category.name, updated_at: new Date().toISOString() })
                    .where(eq(categories.id, category.id));
            }
        }
    }

    async findMostUsed(limit = 10) {
        const transactionCount = sql<number>`count(${transactions.id})`;

        return db
            .select({
                id: categories.id,
                name: categories.name,
                icon: categories.icon,
                type: categories.type,
                transactionCount,
            })
            .from(categories)
            .leftJoin(transactions, eq(transactions.category_id, categories.id))
            .groupBy(categories.id)
            .orderBy(desc(transactionCount), categories.name)
            .limit(limit);
    }
    async deleteManyCategories(ids: string[]) {
        const defaultIds = ids.filter((id) => id.startsWith('default-'));
        if (defaultIds.length > 0) {
            await db.insert(defaultCategoryExclusions).values(defaultIds.map((category_id) => ({ category_id }))).onConflictDoNothing();
        }
        await db.delete(categories).where(inArray(categories.id, ids))
        return true
    }
    async findById(id: string) {
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
    async clearAll(tx?: any) {
        const executor = tx ?? db; 
        await executor.delete(categories);
    }
}
