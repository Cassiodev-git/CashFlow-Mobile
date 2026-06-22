import { z } from "zod";

export const createRecurrenceSchema = z.object({
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    interval: z.number().int().min(1).default(1),
    last_generated_date: z.string(),
    
    end_date: z.string().optional(),
});

export const updateRecurrenceSchema = z.object({
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    interval: z.number().int().min(1).optional(),
    last_generated_date: z.string().optional(),
    
    end_date: z.string().optional(),
});

export type CreateRecurrenceDTO = z.infer<typeof createRecurrenceSchema>;
export type UpdateRecurrenceDTO = z.infer<typeof updateRecurrenceSchema>;