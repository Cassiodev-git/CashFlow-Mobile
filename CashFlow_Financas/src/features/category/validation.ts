import {z} from "zod"

export const createCategorySchema = z.object({
    name: z.string(),
    icon: z.string().optional(),
    type: z.enum(["income", "expense"])
})

export const updateCategorySchema = z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    type: z.enum(["income", "expense"]).optional()
})

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>
