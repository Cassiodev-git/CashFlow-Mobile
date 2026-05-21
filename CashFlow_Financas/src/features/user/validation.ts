import {z} from "zod"
import i18n from "@/i18n";

export const createUserSchema = z.object({
    name: z.string()
        .min(3, i18n.t("validation.user.nameTooShort"))
        .max(30, i18n.t("validation.user.nameTooLong"))
        .trim(),
    imageProfile: z.string().optional()
})
export const updateUserSchema = z.object({
    name: z.string()
        .min(3, i18n.t("validation.user.nameTooShort"))
        .max(30, i18n.t("validation.user.nameTooLong"))
        .trim()
        .optional(),
    imageProfile: z.string().optional()
})

export type CreateUserDTO = z.infer<typeof createUserSchema>
export type UpdateUserDTO = z.infer<typeof updateUserSchema>
