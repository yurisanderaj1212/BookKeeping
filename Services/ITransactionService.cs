using WebApplication2.Dto;

namespace WebApplication2.Services
{
    public interface ITransactionService
    {
        Task<TransactionDto> CreateAsync(int userId, CreateTransactionDto dto);
        Task<List<TransactionDto>> GetAllAsync(int userId);
        Task<TransactionDto?> UpdateAsync(int userId, int transactionId, UpdateTransactionDto dto);
        Task<bool> DeleteAsync(int userId, int transactionId);
        Task<List<CategorySummaryDto>> GetCategorySummaryAsync(int userId, DateOnly? startDate = null, DateOnly? endDate = null);
        Task<BalanceSummaryDto> GetBalanceSummaryAsync(int userId, DateOnly? startDate = null, DateOnly? endDate = null);

    }
}
