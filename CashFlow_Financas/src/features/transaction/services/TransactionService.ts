import { TransactionRepository } from "../repository/TransactionRepository";
import { CreateTransactionDTO } from "../validation";
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

    async listTransactions(){
        const userId = await getLocalUserId();
        const result = await transacRepo.listTransactions(userId);
        return result;
    }
}

export default new TransactionService()
