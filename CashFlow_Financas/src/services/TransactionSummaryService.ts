import TransactionStatsService from "@/features/transaction/services/TransactionStatsService"

class TransactionSummaryService {
    async getUserSummary(userId: string) {
        const result = await TransactionStatsService.getUserSummary(userId)
        return result
    }
    async getMonthlyExpensePercentage(userId: string){
        const result = await TransactionStatsService.getMonthlyExpensePercentage(userId)
        return result
    }
}
export default new TransactionSummaryService()