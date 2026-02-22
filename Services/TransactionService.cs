using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;

        public TransactionService(AppDbContext context, IMapper mapper, IAccountService accountService)
        {
            _context = context;
            _mapper = mapper;
            _accountService = accountService;
        }

        public async Task<TransactionDto> CreateAsync(int userId, CreateTransactionDto dto)
        {
            // Validar que la categoría exista
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && c.IsActive);

            if (category == null)
                throw new InvalidOperationException($"La categoría con ID {dto.CategoryId} no existe");

            // Validar que el tipo de categoría coincida con el tipo de transacción
            if (category.Type != dto.Type)
                throw new InvalidOperationException($"La categoría seleccionada es de tipo {category.Type}, pero la transacción es de tipo {dto.Type}");

            // Validar que la cuenta pertenezca al usuario si se proporciona
            if (dto.AccountId.HasValue)
            {
                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Id == dto.AccountId.Value && a.UserId == userId && a.IsActive);

                if (account == null)
                    throw new InvalidOperationException($"La cuenta con ID {dto.AccountId.Value} no existe o no pertenece al usuario");
            }

            var transaction = _mapper.Map<Transaction>(dto);
            transaction.UserId = userId;
            transaction.CreatedAt = DateTime.UtcNow;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Actualizar balance de la cuenta si se asignó una
            if (transaction.AccountId.HasValue)
            {
                await UpdateAccountBalanceAsync(transaction.AccountId.Value, transaction.Type, transaction.Amount, isAdding: true);
            }

            // Cargar la categoría para incluirla en la respuesta
            await _context.Entry(transaction)
                .Reference(t => t.Category)
                .LoadAsync();

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<List<TransactionDto>> GetAllAsync(int userId)
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .Select(t => _mapper.Map<TransactionDto>(t))
                .ToListAsync();
        }

        public async Task<TransactionDto?> UpdateAsync(int userId, int transactionId, UpdateTransactionDto dto)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (transaction == null)
                return null;

            // Guardar valores originales para revertir balance si es necesario
            var originalAccountId = transaction.AccountId;
            var originalAmount = transaction.Amount;
            var originalType = transaction.Type;

            // Validar cambio de categoría si se proporciona
            if (dto.CategoryId.HasValue && dto.CategoryId.Value != transaction.CategoryId)
            {
                var newCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value && c.IsActive);

                if (newCategory == null)
                    throw new InvalidOperationException($"La categoría con ID {dto.CategoryId.Value} no existe");

                // Validar que el tipo de categoría coincida con el tipo de transacción
                var transactionType = dto.Type ?? transaction.Type;
                if (newCategory.Type != transactionType)
                    throw new InvalidOperationException($"La categoría seleccionada es de tipo {newCategory.Type}, pero la transacción es de tipo {transactionType}");

                transaction.CategoryId = dto.CategoryId.Value;
            }

            // Validar consistencia de tipo si se cambia
            if (dto.Type.HasValue && dto.Type.Value != transaction.Type)
            {
                var categoryToCheck = dto.CategoryId.HasValue 
                    ? await _context.Categories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value)
                    : transaction.Category;

                if (categoryToCheck != null && categoryToCheck.Type != dto.Type.Value)
                    throw new InvalidOperationException($"No se puede cambiar el tipo de transacción porque la categoría es de tipo {categoryToCheck.Type}");
                
                transaction.Type = dto.Type.Value;
            }

            // Validar nueva cuenta si se proporciona
            if (dto.AccountId.HasValue)
            {
                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Id == dto.AccountId.Value && a.UserId == userId && a.IsActive);

                if (account == null)
                    throw new InvalidOperationException($"La cuenta con ID {dto.AccountId.Value} no existe o no pertenece al usuario");
            }

            // Revertir balance de la cuenta original si existía
            if (originalAccountId.HasValue)
            {
                await UpdateAccountBalanceAsync(originalAccountId.Value, originalType, originalAmount, isAdding: false);
            }

            // Mapear solo las propiedades que no sean null
            if (dto.Amount.HasValue) transaction.Amount = dto.Amount.Value;
            if (dto.Description != null) transaction.Description = dto.Description;
            if (dto.Date.HasValue) transaction.Date = dto.Date.Value.ToDateTime(TimeOnly.MinValue);
            
            // Manejar AccountId: puede ser null para desasignar cuenta
            if (dto.AccountId != null)
            {
                transaction.AccountId = dto.AccountId;
            }

            await _context.SaveChangesAsync();

            // Aplicar balance a la nueva cuenta si existe
            if (transaction.AccountId.HasValue)
            {
                await UpdateAccountBalanceAsync(transaction.AccountId.Value, transaction.Type, transaction.Amount, isAdding: true);
            }

            // Recargar la categoría por si cambió
            await _context.Entry(transaction)
                .Reference(t => t.Category)
                .LoadAsync();

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<bool> DeleteAsync(int userId, int transactionId)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (transaction == null)
                return false;

            // Revertir balance de la cuenta si existía
            if (transaction.AccountId.HasValue)
            {
                await UpdateAccountBalanceAsync(transaction.AccountId.Value, transaction.Type, transaction.Amount, isAdding: false);
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return true;
        }

        // Método adicional para obtener resumen por categoría (opcional)
        public async Task<List<CategorySummaryDto>> GetCategorySummaryAsync(int userId, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            var query = _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .AsQueryable();

            if (startDate.HasValue)
            {
                var start = startDate.Value.ToDateTime(new TimeOnly(0, 0));
                query = query.Where(t => t.Date >= start);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.ToDateTime(new TimeOnly(23, 59, 59)); 
                query = query.Where(t => t.Date <= end);
            }

            var summary = await query
                .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Type })
                .Select(g => new CategorySummaryDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    Type = g.Key.Type,
                    TotalAmount = g.Sum(t => t.Amount),
                    TransactionCount = g.Count()
                })
                .ToListAsync();

            // Calcular porcentajes
            foreach (var typeGroup in summary.GroupBy(s => s.Type))
            {
                var totalByType = typeGroup.Sum(s => s.TotalAmount);
                foreach (var item in typeGroup)
                {
                    item.Percentage = totalByType > 0 ? (item.TotalAmount / totalByType) * 100 : 0;
                }
            }

            return summary;
        }

        // Método para obtener balance/suma total (opcional)
        public async Task<BalanceSummaryDto> GetBalanceSummaryAsync(int userId, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            var query = _context.Transactions
                .Where(t => t.UserId == userId)
                .AsQueryable();

            if (startDate.HasValue)
            {
                var start = startDate.Value.ToDateTime(new TimeOnly(0, 0));
                query = query.Where(t => t.Date >= start);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.ToDateTime(new TimeOnly(23, 59, 59));
                query = query.Where(t => t.Date <= end);
            }

            var result = await query
                .GroupBy(t => t.Type)
                .Select(g => new
                {
                    Type = g.Key,
                    Total = g.Sum(t => t.Amount)
                })
                .ToListAsync();

            var income = result.FirstOrDefault(r => r.Type == TransactionType.Income)?.Total ?? 0;
            var expense = result.FirstOrDefault(r => r.Type == TransactionType.Expense)?.Total ?? 0;

            return new BalanceSummaryDto
            {
                TotalIncome = income,
                TotalExpense = expense,
                NetBalance = income - expense
            };
        }

        // Método privado para actualizar el balance de una cuenta
        private async Task UpdateAccountBalanceAsync(int accountId, TransactionType type, decimal amount, bool isAdding)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null)
                return;

            // Calcular el cambio en el balance
            decimal balanceChange = 0;

            if (isAdding)
            {
                // Agregar transacción: Income suma, Expense resta
                balanceChange = type == TransactionType.Income ? amount : -amount;
            }
            else
            {
                // Revertir transacción: Income resta, Expense suma
                balanceChange = type == TransactionType.Income ? -amount : amount;
            }

            account.CurrentBalance += balanceChange;
            account.UpdatedAt = DateTime.UtcNow;

            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }
    }
}