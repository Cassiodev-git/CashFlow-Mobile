import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
export const categories = sqliteTable('categories',{
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    icon: text('icon'),
    type: text('type').notNull(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})


export const defaultCategoryExclusions = sqliteTable('default_category_exclusions', {
    category_id: text('category_id').primaryKey(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
