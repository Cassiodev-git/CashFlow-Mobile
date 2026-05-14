import { UserRepository } from "@/features/user/repository/UserRepository";
import { CategoryRepository } from "../repository/CategoryRepository";
import type { CreateCategoryDTO, UpdateCategoryDTO  } from "../validation";
import { createCategorySchema, updateCategorySchema } from "../validation";

const categoryRepo = new CategoryRepository()
const userRepo = new UserRepository()

export class CategoryService {
    async createCategory(data: CreateCategoryDTO){
        const validatedData = createCategorySchema.parse(data)
        const existingUser = await userRepo.findFirstUser()

        if(!existingUser){
            throw new Error("Usuário não existe")
        }
        return await categoryRepo.createCategory(validatedData)
    }
    async updateCategory(id: string, data: UpdateCategoryDTO){
        const validatedData = updateCategorySchema.parse(data)
        return await categoryRepo.updateCategory(id, validatedData)
    }
    async deleteCategory(id: string){
        return await categoryRepo.deleteCategory(id)
    }
    async listCategory(){
        return await categoryRepo.listCategory()
    }
}   
