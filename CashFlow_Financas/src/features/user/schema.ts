import {sqliteTable, text} from "drizzle-orm/sqlite-core"

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    imageProfile: text('imageProfile'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull()
})