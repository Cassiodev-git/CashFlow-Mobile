import { UserRepository } from "@/features/user/repository/UserRepository";
import { CategoryRepository } from "../repository/CategoryRepository";
import type { CreateCategoryDTO, UpdateCategoryDTO  } from "../validation";
import { createCategorySchema, updateCategorySchema } from "../validation";
import i18n from "@/i18n";
import { DEFAULT_CATEGORIES, getDefaultCategories } from '../defaultCategories';

const categoryRepo = new CategoryRepository()
const userRepo = new UserRepository()

export class CategoryService {
    private getLocalizedDefaults() {
        const defaults = getDefaultCategories((key) => i18n.t(key));
        const knownDefaultNames = Object.fromEntries(DEFAULT_CATEGORIES.map((category) => [
            category.id,
            ['pt', 'en'].map((language) => i18n.getFixedT(language)(`defaultCategories.${category.translationKey}`)),
        ]));

        return { defaults, knownDefaultNames };
    }

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
        const { defaults, knownDefaultNames } = this.getLocalizedDefaults();
        await categoryRepo.seedDefaultCategories(defaults, knownDefaultNames);
        return await categoryRepo.listCategory()
    }

    async seedDefaultCategories() {
        const { defaults, knownDefaultNames } = this.getLocalizedDefaults();
        return categoryRepo.seedDefaultCategories(defaults, knownDefaultNames);
    }

    async listMostUsedCategories(limit = 10) {
        const { defaults, knownDefaultNames } = this.getLocalizedDefaults();
        await categoryRepo.seedDefaultCategories(defaults, knownDefaultNames);
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
    async deleteAllCategories(){
        return await categoryRepo.clearAll()
    }
}
