import * as SQLite from "expo-sqlite";
import createUsersTable from "./migrations/createUserTable"
import createTransactionTable from "./migrations/createTransactionTable";
import createCategoriesTable from "./migrations/createCategoriesTable";
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
<<<<<<< HEAD
        logger.log("Banco de dados iniciado")
=======
        console.log("Banco de dados iniciado")
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    }catch(error){
        logger.error("Error initializing database:", error)
    }
}
<<<<<<< HEAD
=======

>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
