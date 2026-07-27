import { UserRepository } from "../repository/UserRepository";
import type { CreateUserDTO, UpdateUserDTO } from "../validation";
import { createUserSchema, updateUserSchema } from "../validation";
import i18n from "@/i18n";
import AppCategoryService from '@/services/AppCategoryService';
import { sqlite } from "@/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeDatabase } from "@/db/database";
import { logger } from "@/utils/logger";
const userRepo = new UserRepository()

export class UserService {
    async findFirstUser() {
        return await userRepo.findFirstUser()
    }

    async createUser(data: CreateUserDTO) {
        const validatedData = createUserSchema.parse(data)

        const existingUser = await userRepo.findFirstUser()

        if (existingUser) {
            throw new Error(i18n.t("errors.userAlreadyExists"))
        }

        const user = await userRepo.createUser(validatedData);
        await AppCategoryService.seedDefaultCategories();
        return user;
    }
    async updateUser(id: string, data: UpdateUserDTO) {
        const validatedData = updateUserSchema.parse(data)
        const existingUser = await userRepo.findFirstUser()


        if (!existingUser) {
            throw new Error(i18n.t("errors.userNotFound"))
        }

        return await userRepo.updateUser(id, validatedData)
    }
    async deleteUser(id: string) {

        try {
            const existingUser = await userRepo.findFirstUser()

            if (!existingUser || existingUser.id !== id) {
                throw new Error(i18n.t("errors.userNotFound"))
            }
            await sqlite.withTransactionAsync(async () => {
                await sqlite.execAsync(`
                PRAGMA foreign_keys = OFF;
                DROP TABLE IF EXISTS recurring_transactions;
                DROP TABLE IF EXISTS recurrences;
                DROP TABLE IF EXISTS transactions;
                DROP TABLE IF EXISTS default_category_exclusions;
                DROP TABLE IF EXISTS categories;
                DROP TABLE IF EXISTS notifications;
                DROP TABLE IF EXISTS messages;
                DROP TABLE IF EXISTS users;
                PRAGMA foreign_keys = ON;
            `);
            })

            await initializeDatabase()
            await AsyncStorage.clear()
            return true

        } catch (error) {
            logger.error("Error:", error)
            throw error
        }
    }

    async deleteFistUser(id: string) {
        return await this.deleteUser(id)
    }
}
