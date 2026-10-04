import * as SQlite from "expo-sqlite";

export default async function createRecurrenceTables(db: SQlite.SQLiteDatabase) {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS recurrence_rules (
            id TEXT PRIMARY KEY NOT NULL,
            transaction_id TEXT NOT NULL,
            frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
            interval INTEGER NOT NULL DEFAULT 1,
            last_generated_date TEXT NOT NULL, 
            end_date TEXT,      
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
        );
    `);
}