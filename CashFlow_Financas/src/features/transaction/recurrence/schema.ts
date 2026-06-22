import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const recurrenceRules = sqliteTable('recurrence_rules', {
    id: text('id').primaryKey(),
    transaction_id: text('transaction_id').notNull(),
    frequency: text('frequency').notNull(),
    interval: integer('interval').notNull().default(1),
    next_occurrence: text('next_occurrence').notNull(),
    end_date: text('end_date'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});