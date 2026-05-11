import * as SQLite from "expo-sqlite";
import createUsersTable from "./migrations/createUserTable"
import createTransactionTable from "./migrations/createTransactionTable";
import createCategoriesTable from "./migrations/createCategoriesTable";
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
        console.log("Banco de dados iniciado")
    }catch(error){
        console.error("Erro ao inicializar banco:", error)
    }
}

