import { db } from "@/db";
import { v4 as uuid } from "uuid";
import { desc, eq } from "drizzle-orm";
import { notifications } from "../schema";
import type { CreateNotificationInput, UpdateNotificationInput } from "../validation";

export class NotificationRepository {
    async createNotification(data: CreateNotificationInput) {
        const id = uuid();
        const result = await db.insert(notifications).values({
            ...data,
            id,
        }).returning();

        return result;
    }

    async updateNotification(id: string, data: UpdateNotificationInput) {
        const result = await db
            .update(notifications)
            .set({
                ...data,
                updated_at: new Date().toISOString()
            })
            .where(eq(notifications.id, id));

        return result;
    }

    async updateTransactionNotificationLink(transactionId: string, expoId: string) {
        return await db
            .update(notifications)
            .set({ expo_id: expoId })
            .where(eq(notifications.transaction_id, transactionId));
    }

    async getExpoIdByTransactionId(transactionId: string): Promise<string | null> {
        const result = await db
            .select({ expo_id: notifications.expo_id })
            .from(notifications)
            .where(eq(notifications.transaction_id, transactionId))
            .limit(1);

        return result[0]?.expo_id || null;
    }

    async getExpoIdsByTransactionId(transactionId: string): Promise<string[]> {
        const result = await db.select({ expo_id: notifications.expo_id }).from(notifications).where(eq(notifications.transaction_id, transactionId));
        return result.flatMap(({ expo_id }) => expo_id ? [expo_id] : []);
    }

    async clearTransactionNotificationLink(transactionId: string) {
        return await db
            .update(notifications)
            .set({ expo_id: null })
            .where(eq(notifications.transaction_id, transactionId));
    }

    async findByTransactionId(transactionId: string) {
        return await db
            .select()
            .from(notifications)
            .where(eq(notifications.transaction_id, transactionId));
    }

    async listUnreadNotifications() {
        return await db
            .select()
            .from(notifications)
            .where(eq(notifications.is_read, false));
    }

    async listNotifications() {
        return await db
            .select()
            .from(notifications)
            .where(eq(notifications.is_active, true))
            .orderBy(desc(notifications.created_at));
    }

    async listAllNotifications() {
        return await db
            .select()
            .from(notifications)
            .orderBy(desc(notifications.created_at));
    }

    async findById(id: string) {
        const [result] = await db
            .select()
            .from(notifications)
            .where(eq(notifications.id, id))
            .limit(1);

        return result ?? null;
    }

    async deleteNotification(id: string) {
        const result = await db.delete(notifications).where(eq(notifications.id, id));
        return result;
    }

    async deleteByTransactionId(transactionId: string) {
        return await db.delete(notifications).where(eq(notifications.transaction_id, transactionId));
    }

    async clearAll(tx?: any) {
        const executor = tx ?? db; 
        await executor.delete(notifications);
    }
}
