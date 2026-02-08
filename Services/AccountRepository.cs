using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _context;

        public AccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Account?> GetByIdAsync(int id)
        {
            return await _context.Accounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Account>> GetUserAccountsAsync(int userId)
        {
            return await _context.Accounts
                .Where(a => a.UserId == userId && a.IsActive)
                .OrderBy(a => a.Code)
                .ThenBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<Account?> GetByCodeAndUserIdAsync(string code, int userId)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Code == code && a.UserId == userId);
        }

        public async Task<Account?> GetAccountWithTransactionsAsync(int accountId)
        {
            return await _context.Accounts
                .Include(a => a.Transactions)
                .FirstOrDefaultAsync(a => a.Id == accountId);
        }

        public async Task<IEnumerable<Account>> GetAccountsByTypeAsync(int userId, AccountType type)
        {
            return await _context.Accounts
                .Where(a => a.UserId == userId && a.Type == type && a.IsActive)
                .ToListAsync();
        }

        public async Task<decimal> CalculateAccountBalanceAsync(int accountId)
        {
            var account = await GetAccountWithTransactionsAsync(accountId);
            if (account == null)
                throw new KeyNotFoundException($"Cuenta {accountId} no encontrada");

            decimal balance = account.InitialBalance;

            foreach (var transaction in account.Transactions)
            {
                if (IsDebitAccount(account.Type))
                {
                    // Para cuentas de débito (Activo, Gastos): +Débitos -Créditos
                    balance += transaction.DebitAmount - transaction.CreditAmount;
                }
                else
                {
                    // Para cuentas de crédito (Pasivo, Patrimonio, Ingresos): +Créditos -Débitos
                    balance += transaction.CreditAmount - transaction.DebitAmount;
                }
            }

            return balance;
        }

        public async Task<bool> HasTransactionsAsync(int accountId)
        {
            return await _context.Transactions
                .AnyAsync(t => (t.DebitAccountId == accountId || t.CreditAccountId == accountId));
        }

        public async Task AddAsync(Account account)
        {
            await _context.Accounts.AddAsync(account);
        }

        public void Update(Account account)
        {
            _context.Accounts.Update(account);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        private static bool IsDebitAccount(AccountType type)
        {
            return type == AccountType.Asset || type == AccountType.Expense;
        }
    }
}

