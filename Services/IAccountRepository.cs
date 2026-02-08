using WebApplication2.Models;

namespace WebApplication2.Services
{
    public interface IAccountRepository
    {
        Task<IEnumerable<Account>> GetUserAccountsAsync(int userId);
        Task<Account?> GetAccountWithTransactionsAsync(int accountId);
        Task<Account?> GetByCodeAndUserIdAsync(string code, int userId);
        Task<IEnumerable<Account>> GetAccountsByTypeAsync(int userId, AccountType type);
        Task<decimal> CalculateAccountBalanceAsync(int accountId);
        Task<bool> HasTransactionsAsync(int accountId);
        Task AddAsync(Account account);
        void Update(Account account);
        Task<bool> SaveChangesAsync();
        Task<Account?> GetByIdAsync(int id);

    }
}
