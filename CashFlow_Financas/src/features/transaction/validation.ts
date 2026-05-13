import {z} from "zod"

export const createTransactionSchema = z.object({
    title: z.string().min(3, "Título muito curto"),
    description: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
    amount: z.number(),
    type: z.enum(["income", "expense"]).default("income"),
    status: z.enum(["paid","pending","canceled"]).default("canceled").optional(),
    date: z.string().optional(),
})
export const updateTransactionSchema = z.object({
    title: z.string().min(3, "Título muito curto").optional(),
    description: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
    amount: z.number().optional(),
    type: z.enum(["income", "expense"]).default("income").optional(),
    status: z.enum(["paid","pending","canceled"]).default("pending").optional(),
    date: z.string().optional(),
})

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>
