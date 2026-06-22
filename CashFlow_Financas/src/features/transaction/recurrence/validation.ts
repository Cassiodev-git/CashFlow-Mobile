import { z } from "zod";

export const createRecurrenceSchema = z.object({
    transaction_id: z.string(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    interval: z.number().int().min(1).default(1),
    next_occurrence: z.string(),
    end_date: z.string().optional(),
});

export const updateRecurrenceSchema = z.object({
    transaction_id: z.string().optional(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    interval: z.number().int().min(1).optional(),
    next_occurrence: z.string().optional(),
    end_date: z.string().optional(),
});

export type CreateRecurrenceDTO = z.infer<typeof createRecurrenceSchema>
export type UpdateRecurrenceDTO = z.infer<typeof updateRecurrenceSchema>