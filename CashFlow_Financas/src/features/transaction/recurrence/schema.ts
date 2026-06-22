import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const recurrenceRules = sqliteTable('recurrence_rules', {
    id: text('id').primaryKey(),
    frequency: text('frequency').$type<'daily' | 'weekly' | 'monthly' | 'yearly'>().notNull(),
    interval: integer('interval').notNull().default(1),
    last_generated_date: text('last_generated_date').notNull(),
    end_date: text('end_date'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});