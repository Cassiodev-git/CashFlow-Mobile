import * as SQlite from "expo-sqlite"

export default function createUsersTable(db: SQlite.SQLiteDatabase) {
    return db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        imageProfile TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);
}