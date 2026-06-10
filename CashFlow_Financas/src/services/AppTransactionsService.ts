import TransactionService from "@/features/transaction/services/TransactionService";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "@/features/transaction/validation";

class AppTransactionsService {
    async createTransaction(data: CreateTransactionDTO){
        const result = await TransactionService.createTransaction(data)
        return result
    }
    async listTransactions(options?: { limit?: number; offset?: number }){
        const result = await TransactionService.listTransactions(options)
        return result
    }
    async deleteTransaction(id: string){
        const result = await TransactionService.deleteTransaction(id)
        return result
    }
    async deleteManyTransactions(ids: string[]){
        const result = await TransactionService.deleteManyTransactions(ids)
        return result
    }
    async updateTransaction(id: string, data:UpdateTransactionDTO ){
        const result = await TransactionService.updateTransaction(id, data)
        return result
    }
}

export default new AppTransactionsService()