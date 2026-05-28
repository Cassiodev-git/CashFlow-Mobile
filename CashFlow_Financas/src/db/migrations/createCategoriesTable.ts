import * as SQlite from "expo-sqlite"

export default function createCategoriesTable(db: SQlite.SQLiteDatabase){
    return db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        type TEXT NOT NULL CHECK (type IN ('income','expense')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `)
}