import { TransactionRepository } from "../repository/TransactionRepository";
import type { CreateTransactionDTO, UpdateTransactionDTO } from "../validation";
import { UserRepository } from "@/features/user/repository/UserRepository";
import i18n from "@/i18n";

const transacRepo = new TransactionRepository();
const userRepo = new UserRepository();

const getLocalUserId = async () =>{
    const user = await userRepo.findFirstUser();

    if (!user) {
        throw new Error(i18n.t("errors.userNotFoundForTransactionCreate"));
    }

    return user.id;
}

class TransactionService {
    async createTransaction(data: CreateTransactionDTO){
        const userId = await getLocalUserId();
        const result = await transacRepo.createTransaction(userId, data);
        return result;
    }

    async listTransactions(options?: { limit?: number; offset?: number }){
        const userId = await getLocalUserId();
        const result = await transacRepo.listTransactions(userId, options);
        return result;
    }
    async deleteTransaction(id: string){
        const result = await transacRepo.deleteTransaction(id)
        return result
    }
    async updateTransaction(id: string, data: UpdateTransactionDTO){
        const result = await transacRepo.updateTransaction(id, data)
        return result
    }
}

export default new TransactionService()
