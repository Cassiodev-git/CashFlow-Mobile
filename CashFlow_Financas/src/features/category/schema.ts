import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const categories = sqliteTable('categories',{
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    icon: text('icon'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull()
})