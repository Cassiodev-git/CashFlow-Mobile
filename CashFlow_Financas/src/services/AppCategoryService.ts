import { CategoryService } from "@/features/category/services/CategoryService";

const categoryFeatureService = new CategoryService();

class AppCategoryService {
    async listCategories() {
        return await categoryFeatureService.listCategory();
    }
}

export default new AppCategoryService();
