import {z} from "zod"

export const createUserSchema = z.object({
    name: z.string().min(3, "Nome muito curto"),
    imageProfile: z.string().optional()
})
export const updateUserSchema = z.object({
    name: z.string().min(3, "Nome muito curto").optional(),
    imageProfile: z.string().optional()
})

export type CreateUserDTO = z.infer<typeof createUserSchema>
export type UpdateUserDTO = z.infer<typeof updateUserSchema>