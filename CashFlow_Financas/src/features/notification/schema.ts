import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { transactions } from "../transaction/schema"; 

export const notifications = sqliteTable('notifications', {
    id: text('id').primaryKey(),
    transaction_id: text('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }),
    expo_id: text('expo_id'),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    trigger_date: text('trigger_date').notNull(),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    is_read: integer('is_read', { mode: 'boolean' }).default(false),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});