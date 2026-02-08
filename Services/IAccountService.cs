using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public interface IAccountService
    {
        Task<AccountDto> CreateAccountAsync(int userId, CreateAccountDto dto);
        Task<IEnumerable<AccountDto>> GetUserAccountsAsync(int userId);
        Task<AccountBalanceDto> GetAccountBalanceAsync(int accountId);
        Task<bool> DeactivateAccountAsync(int accountId);
        Task<IEnumerable<AccountDto>> GetAccountsByTypeAsync(int userId, AccountType type);
        Task<AccountDto> GetByIdAsync(int id);

    }
}