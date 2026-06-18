import * as SQlite from "expo-sqlite";

export default async function createNotificationTable(db: SQlite.SQLiteDatabase) {
    return db.execAsync(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY NOT NULL,
            transaction_id TEXT,
            expo_id TEXT,
            type TEXT NOT NULL CHECK (type IN (
                'due_date', 
                'overdue', 
                'goal_reached', 
                'goal_warning', 
                'monthly_summary',
                'report'
            )),
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            trigger_date TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
        );
    `);
}