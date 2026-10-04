import RecurrenceService from "@/features/transaction/recurrence/services/RecurrenceService";
import type { RecurrencePayload } from "@/features/transaction/recurrence/repository/RecurrenceRepository";

class AppRecurrenceService {
    async createRecurrence(data: RecurrencePayload, transactionId: string, userId: string) {
        return await RecurrenceService.createRecurrence(data, transactionId, userId);
    }

    async updateRecurrence(id: string, data: RecurrencePayload) {
        return await RecurrenceService.updateRecurrence(id, data);
    }

    async deleteRecurrence(id: string) {
        return await RecurrenceService.deleteRecurrence(id);
    }

    async listRecurringTransactions(userId: string) {
        return await RecurrenceService.listRecurringTransactions(userId);
    }

    async processRecurrences(userId: string) {
        return await RecurrenceService.processRecurrences(userId);
    }
}

export default new AppRecurrenceService();
