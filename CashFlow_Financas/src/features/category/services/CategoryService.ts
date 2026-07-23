import { UserRepository } from "@/features/user/repository/UserRepository";
import { CategoryRepository } from "../repository/CategoryRepository";
import type { CreateCategoryDTO, UpdateCategoryDTO  } from "../validation";
import { createCategorySchema, updateCategorySchema } from "../validation";
import i18n from "@/i18n";
import { getDefaultCategories } from '../defaultCategories';

const categoryRepo = new CategoryRepository()
const userRepo = new UserRepository()

export class CategoryService {
    async createCategory(data: CreateCategoryDTO){
        const validatedData = createCategorySchema.parse(data)
        
        const existingUser = await userRepo.findFirstUser()
        if(!existingUser){
            throw new Error(i18n.t("errors.userNotFound"))
        }

        const isDuplicate = await categoryRepo.findByNameAndType(validatedData.name, validatedData.type)
        if (isDuplicate) {
            throw new Error(i18n.t("errors.categoryAlreadyExists"))
        }

        return await categoryRepo.createCategory(validatedData)
    }

    async updateCategory(id: string, data: UpdateCategoryDTO){
        const validatedData = updateCategorySchema.parse(data)
        
        const exists = await categoryRepo.findById(id)
        if (!exists) throw new Error(i18n.t("errors.categoryNotFound"))

        return await categoryRepo.updateCategory(id, validatedData)
    }

    async deleteCategory(id: string){
        const exists = await categoryRepo.findById(id)
        if (!exists) throw new Error(i18n.t("errors.categoryNotFound"))

        return await categoryRepo.deleteCategory(id)
    }

    async listCategory(){
        return await categoryRepo.listCategory()
    }

    async seedDefaultCategories() {
        return categoryRepo.seedDefaultCategories(getDefaultCategories((key) => i18n.t(key)));
    }

    async listMostUsedCategories(limit = 10) {
        return categoryRepo.findMostUsed(limit)
    }

    async findbyId(id: string){
        const category = await categoryRepo.findById(id)
        if (!category) throw new Error(i18n.t("errors.categoryNotFound"))
        return category
    }

    async deleteManyCategories(ids: string []){
        return await categoryRepo.deleteManyCategories(ids)
    }
}
