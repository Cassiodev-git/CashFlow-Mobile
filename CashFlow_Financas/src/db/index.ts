import * as SQLite from "expo-sqlite";
import {drizzle} from "drizzle-orm/expo-sqlite"

import * as schemas from "./schema"

export const sqlite = SQLite.openDatabaseSync("database.db")

export const db = drizzle(sqlite, {
    schema: schemas
})