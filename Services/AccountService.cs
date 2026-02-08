using AutoMapper;
using WebApplication2.Dto;
using WebApplication2.Models;
using WebApplication2.Services;
using Microsoft.EntityFrameworkCore;

namespace WebApplication2.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public AccountService(
            IAccountRepository accountRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _accountRepository = accountRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<AccountDto> CreateAccountAsync(int userId, CreateAccountDto dto)
        {
            // Validar usuario
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("Usuario no encontrado");

            // Validar código único
            if (!string.IsNullOrEmpty(dto.Code))
            {
                var existing = await _accountRepository.GetByCodeAndUserIdAsync(dto.Code, userId);
                if (existing != null)
                    throw new InvalidOperationException($"El código {dto.Code} ya existe");
            }

            // Crear cuenta
            var account = _mapper.Map<Account>(dto);
            account.UserId = userId;
            account.CurrentBalance = dto.InitialBalance;
            account.CreatedAt = DateTime.UtcNow;
            account.UpdatedAt = DateTime.UtcNow;

            await _accountRepository.AddAsync(account);
            await _accountRepository.SaveChangesAsync();

            return _mapper.Map<AccountDto>(account);
        }

        public async Task<IEnumerable<AccountDto>> GetUserAccountsAsync(int userId)
        {
            var accounts = await _accountRepository.GetUserAccountsAsync(userId);
            return _mapper.Map<IEnumerable<AccountDto>>(accounts);
        }

        public async Task<AccountBalanceDto> GetAccountBalanceAsync(int accountId)
        {
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
                throw new KeyNotFoundException("Cuenta no encontrada");

            var calculatedBalance = await _accountRepository.CalculateAccountBalanceAsync(accountId);

            // Actualizar si hay diferencia
            if (account.CurrentBalance != calculatedBalance)
            {
                account.CurrentBalance = calculatedBalance;
                account.UpdatedAt = DateTime.UtcNow;
                _accountRepository.Update(account);
                await _accountRepository.SaveChangesAsync();
            }

            return new AccountBalanceDto
            {
                AccountId = account.Id,
                AccountName = account.Name,
                CurrentBalance = account.CurrentBalance,
                CalculatedBalance = calculatedBalance,
                Difference = account.CurrentBalance - calculatedBalance,
                LastUpdated = account.UpdatedAt
            };
        }

        public async Task<bool> DeactivateAccountAsync(int accountId)
        {
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
                return false;

            // Verificar si tiene transacciones
            if (await _accountRepository.HasTransactionsAsync(accountId))
                throw new InvalidOperationException("La cuenta tiene transacciones y no puede ser desactivada");

            account.IsActive = false;
            account.UpdatedAt = DateTime.UtcNow;

            _accountRepository.Update(account);
            return await _accountRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<AccountDto>> GetAccountsByTypeAsync(int userId, AccountType type)
        {
            var accounts = await _accountRepository.GetAccountsByTypeAsync(userId, type);
            return _mapper.Map<IEnumerable<AccountDto>>(accounts);
        }
        public async Task<AccountDto?> GetByIdAsync(int id)
        {
            var account = await _accountRepository.GetByIdAsync(id);
            if (account == null)
                return null;

            return _mapper.Map<AccountDto>(account);
        }

    }
}