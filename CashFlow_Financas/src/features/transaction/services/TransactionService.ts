import { TransactionRepository } from "../repository/TransactionRepository";
import { UserRepository } from "@/features/user/repository/UserRepository";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";
import { createTransactionSchema, updateTransactionSchema } from "../validation";

const transacRepo = new TransactionRepository()
const userRepo = new UserRepository()


export class TransactionService {
    async createTransaction(data: CreateTransactionDTO){
        const validatedData = createTransactionSchema.parse(data)
        const existingUser = await userRepo.findFistUser()
        if(!existingUser){
            throw new Error("Usuário não existe")
        }

        return await transacRepo.createTransaction(validatedData)
    }
    async updateTransaction(id: string, data: UpdateTransactionDTO){
        const validatedData = updateTransactionSchema.parse(data)
        const existingUser = await userRepo.findFistUser()

        if(!existingUser){
            throw new Error("Usuário não existe")
        }

        return transacRepo.updateTransaction(id, validatedData)
    }
    async deleteTransaction(id: string){
        const result = await transacRepo.deleteTransaction(id)
        return result
    }
    async listTransaction(user_id: string){
        return await transacRepo.listTransactions(user_id)
    }
    async listTransactionByCategory(category_id: string){
        const data = await transacRepo.listTransactionByCategory(category_id)
        return data
    }
}