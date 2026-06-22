import { RecurrenceRepository } from "../repository/RecurrenceRepository";
import type { CreateRecurrenceDTO, UpdateRecurrenceDTO } from "../validation";

const recurrenceRepo = new RecurrenceRepository();

class RecurrenceService {
    async createRecurrence(data: CreateRecurrenceDTO) {
        return await recurrenceRepo.createRecurrence(data);
    }

    async updateRecurrence(id: string, data: UpdateRecurrenceDTO) {
        return await recurrenceRepo.updateRecurrence(id, data);
    }

    async deleteRecurrence(id: string) {
        return await recurrenceRepo.deleteRecurrence(id);
    }

    async listRecurringTransactions(userId: string) {
        return await recurrenceRepo.listRecurringTransactions(userId);
    }
    async findByTransactionId(id: string) {
        return await recurrenceRepo.findByTransactionId(id)
        
    }
    async deleteByTransactionId(id: string){
        return await recurrenceRepo.deleteByTransactionId(id)
    }
}

export default new RecurrenceService();