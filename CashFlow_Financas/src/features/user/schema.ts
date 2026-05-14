import {sqliteTable, text} from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    imageProfile: text('imageProfile'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})
