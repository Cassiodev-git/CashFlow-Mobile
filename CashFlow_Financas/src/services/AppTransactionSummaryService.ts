import TransactionStatsService, {
    MonthlyExpensePercentage,
    TransactionSummary,
} from "@/features/transaction/services/TransactionStatsService";

class AppTransactionSummaryService {
    async getSummary(): Promise<TransactionSummary> {
        return await TransactionStatsService.getSummary();
    }

    async getSummaryByPeriod(month: number, year: number): Promise<TransactionSummary> {
        return await TransactionStatsService.getSummaryByPeriod(month, year);
    }

    async getMonthlyExpensePercentage(): Promise<MonthlyExpensePercentage> {
        return await TransactionStatsService.getMonthlyExpensePercentage();
    }
}

export default new AppTransactionSummaryService();
