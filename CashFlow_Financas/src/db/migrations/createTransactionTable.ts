import * as SQlite from "expo-sqlite"

export default function createTransactionTable(db: SQlite.SQLiteDatabase){
    return db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            amount REAL NOT NULL DEFAULT 0,
            type TEXT NOT NULL DEFAULT 'income' CHECK (type IN ('income', 'expense')),
            date TEXT,
            user_id TEXT NOT NULL,
            category_id TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'canceled', 'pending')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
    `);
}