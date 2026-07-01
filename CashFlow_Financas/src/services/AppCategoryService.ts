import { CategoryService } from "@/features/category/services/CategoryService";
import type { CreateCategoryDTO, UpdateCategoryDTO  } from "../features/category/validation";

const categoryFeatureService = new CategoryService();

class AppCategoryService {
    async listCategories() {
        return await categoryFeatureService.listCategory();
    }
    async createCategory(data: CreateCategoryDTO){
        return categoryFeatureService.createCategory(data)
    }
    async updateCategory(id: string, data: UpdateCategoryDTO){
        return categoryFeatureService.updateCategory(id, data)
    }
    async deleteCategory(id: string){
        return categoryFeatureService.deleteCategory(id)
    }
    async deleteManyCategories(ids: string[]){
        return categoryFeatureService.deleteManyCategories(ids)
    }
    async findById(id: string){
        return categoryFeatureService.findbyId(id)
    }

}

export default new AppCategoryService();
