import { UserRepository } from "../repository/UserRepository";
import type { CreateUserDTO, UpdateUserDTO } from "../validation";
import { createUserSchema, updateUserSchema } from "../validation";
import i18n from "@/i18n";
import AppCategoryService from '@/services/AppCategoryService';
import { sqlite } from "@/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@/utils/logger";
import notificationService from "@/features/notification/services/notificationService";
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
            // Notificações agendadas vivem fora do SQLite e precisam ser
            // canceladas antes de apagar os dados locais.
            await notificationService.deleteAllNotifications();

            // Apaga somente os dados, preservando o schema e as constraints.
            // A ordem respeita as relações entre notificações, recorrências,
            // transações, categorias e usuário.
            await sqlite.withTransactionAsync(async () => {
                await sqlite.runAsync('DELETE FROM notifications');
                await sqlite.runAsync('DELETE FROM recurrence_rules');
                await sqlite.runAsync('DELETE FROM transactions');
                await sqlite.runAsync('DELETE FROM default_category_exclusions');
                await sqlite.runAsync('DELETE FROM categories');
                await sqlite.runAsync('DELETE FROM users');
            });

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
