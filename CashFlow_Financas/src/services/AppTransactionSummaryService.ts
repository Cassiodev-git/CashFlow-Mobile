import TransactionStatsService, {
    MonthlyExpensePercentage,
    TransactionSummary,
} from "@/features/transaction/services/TransactionStatsService";

class AppTransactionSummaryService {
    async getSummary(): Promise<TransactionSummary> {
        const result = await TransactionStatsService.getSummary()
        return result
    }

    async getMonthlyExpensePercentage(): Promise<MonthlyExpensePercentage> {
        const result = await TransactionStatsService.getMonthlyExpensePercentage()
        return result
    }
}

export default new AppTransactionSummaryService()
