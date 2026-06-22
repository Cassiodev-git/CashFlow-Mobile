import { z } from "zod";

export const createTransactionSchema = z.object({
    title: z.string(),
    amount: z.number(),
    type: z.enum(["income", "expense"]),
    is_recurring: z.boolean(),
    date: z.string().optional(),
    description: z.string().optional(),
    category_id: z.string().optional(),
    status: z.enum(["paid", "pending", "canceled"]).optional(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    interval: z.number().int().min(1).optional(),
    end_date: z.string().optional(),
    recurrence_id: z.string().nullable().optional(), 
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>;