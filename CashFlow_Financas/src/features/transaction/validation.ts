import { z } from "zod";
import i18n from "@/i18n";

export const createTransactionSchema = z.object({
    title: z.string()
        .min(3, i18n.t("validation.transaction.titleTooShort"))
        .max(20, i18n.t("validation.transaction.titleTooLong"))
        .trim(),
    description: z.string()
        .max(120, i18n.t("validation.transaction.descriptionTooLong"))
        .optional(),
    amount: z.number(),
    type: z.enum(["income", "expense"]).default("income"),
    status: z.enum(["paid", "pending", "canceled"]).default("pending").optional(),
    date: z.string().optional(),
    category_id: z.string().optional(),
    is_recurring: z.boolean().default(false),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    interval: z.number().int().min(1).default(1).optional(),
    end_date: z.string().optional(),
    recurrence_id: z.string().nullable().optional(),
})

export const updateTransactionSchema = z.object({
    title: z.string()
        .min(3, i18n.t("validation.transaction.titleTooShort"))
        .max(20, i18n.t("validation.transaction.titleTooLong"))
        .trim()
        .optional(),
    description: z.string()
        .max(120, i18n.t("validation.transaction.descriptionTooLong"))
        .optional(),
    amount: z.number().optional(),
    type: z.enum(["income", "expense"]).default("income").optional(),
    status: z.enum(["paid", "pending", "canceled"]).default("pending").optional(),
    date: z.string().optional(),
    category_id: z.string().optional(),
    is_recurring: z.boolean().optional(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    interval: z.number().int().min(1).optional(),
    end_date: z.string().optional(),
    recurrence_id: z.string().nullable().optional(),
})

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>