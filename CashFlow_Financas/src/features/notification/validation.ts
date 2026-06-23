import { z } from "zod";
import i18n from "@/i18n";

export const notificationSchema = z.object({
    id: z.string().uuid(i18n.t("validation.notification.invalidId")),
    transaction_id: z.string().uuid(i18n.t("validation.notification.invalidId")).nullable().optional(),
    expo_id: z.string().nullable().optional(),
    type: z.enum([
        'due_date', 
        'overdue', 
        'goal_reached', 
        'goal_warning', 
        'monthly_summary',
        'report' 
    ]),
    title: z.string()
        .min(1, i18n.t("validation.notification.titleRequired"))
        .max(100, i18n.t("validation.notification.titleTooLong")),
    body: z.string()
        .min(1, i18n.t("validation.notification.bodyRequired"))
        .max(255, i18n.t("validation.notification.bodyTooLong")),
    trigger_date: z.string().datetime({ message: i18n.t("validation.notification.invalidDate") }),
    is_active: z.boolean().default(true),
    is_read: z.boolean().default(false),
    created_at: z.string().datetime({ message: i18n.t("validation.notification.invalidDate") }).optional(),
    updated_at: z.string().datetime({ message: i18n.t("validation.notification.invalidDate") }).optional(),
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
