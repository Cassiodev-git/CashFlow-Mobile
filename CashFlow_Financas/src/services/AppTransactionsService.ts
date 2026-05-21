import TransactionService from "@/features/transaction/services/TransactionService";
import { CreateTransactionDTO } from "@/features/transaction/validation";

class AppTransactionsService {
    async createTransaction(data: CreateTransactionDTO){
        const result = await TransactionService.createTransaction(data)
        return result
    }
    async listTransactions(){
        const result = await TransactionService.listTransactions()
        return result
    }
}

export default new AppTransactionsService()
