import {z} from "zod"
import i18n from "@/i18n";

export const createCategorySchema = z.object({
    name: z.string().min(1, i18n.t("validation.category.nameRequired")),
    icon: z.string().optional(),
    type: z.enum(["income", "expense"])
})

export const updateCategorySchema = z.object({
    name: z.string().min(1, i18n.t("validation.category.nameRequired")).optional(),
    icon: z.string().optional(),
    type: z.enum(["income", "expense"]).optional()
})

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>
