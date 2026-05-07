import { sqliteTable, text, real } from "drizzle-orm/sqlite-core"

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    imageUrl: text('imageUrl'),
    amount: real('amount').notNull(),
    type: text('type').notNull(),
    status: text('status'),
    date: text('date'),
    user_id: text('user_id').notNull(),
    category_id: text('category_id'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull()
    

})