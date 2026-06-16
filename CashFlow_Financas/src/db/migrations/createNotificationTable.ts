import * as SQlite from "expo-sqlite"

export default async function createNotificationTable(db: SQlite.SQLiteDatabase) {
    return db.execAsync(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY NOT NULL,
            transaction_id TEXT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            trigger_date TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
        );
    `);
}