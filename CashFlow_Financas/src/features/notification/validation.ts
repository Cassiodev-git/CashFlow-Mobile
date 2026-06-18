import { z } from "zod";

export const notificationSchema = z.object({
    id: z.string().uuid("Formato de ID inválido"),
    transaction_id: z.string().uuid("Formato de ID inválido").nullable().optional(),
    expo_id: z.string().nullable().optional(),
    type: z.enum([
        'due_date', 
        'overdue', 
        'goal_reached', 
        'goal_warning', 
        'monthly_summary',
        'report' 
    ]),
    title: z.string().min(1, "O título é obrigatório").max(100),
    body: z.string().min(1, "O corpo da mensagem é obrigatório").max(255),
    trigger_date: z.string().datetime({ message: "Data inválida" }),
    is_active: z.boolean().default(true),
    is_read: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const createNotificationSchema = notificationSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});

export const updateNotificationSchema = notificationSchema.pick({
    is_active: true,
    is_read: true,
    expo_id: true,
}).partial();

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;