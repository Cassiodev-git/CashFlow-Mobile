import * as SQLite from "expo-sqlite";
import createUsersTable from "./migrations/createUserTable"
import createTransactionTable from "./migrations/createTransactionTable";
import createCategoriesTable from "./migrations/createCategoriesTable"
import createNotificationTable from "./migrations/createNotificationTable";
import createRecurrenceTables from "./migrations/createRecucurrenceTable";
import { logger } from "@/utils/logger";
const db = SQLite.openDatabaseSync("database.db")
//Incia o banco de dados 
export async function initializeDatabase(){
    try{
        await db.execAsync(`
            PRAGMA foreign_keys = ON;
            `)
        await createUsersTable(db)
        await createTransactionTable(db)
        await createCategoriesTable(db)
        await createNotificationTable(db)
        await createRecurrenceTables(db)
        logger.log("Banco de dados iniciado")
    }catch(error){
        logger.error("Error initializing database:", error)
        throw error;
    }
}
