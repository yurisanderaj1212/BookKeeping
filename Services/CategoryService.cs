// Services/CategoryService.cs
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using WebApplication2.Data;
using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync(int? userId = null, TransactionType? type = null)
        {
            var query = _context.Categories.AsQueryable();

            // Filtrar por usuario (si se especifica)
            if (userId.HasValue)
            {
                // Categorías del usuario + categorías globales (UserId = null)
                query = query.Where(c => c.UserId == userId || c.UserId == null);
            }
            else
            {
                // Solo categorías globales
                query = query.Where(c => c.UserId == null);
            }

            // Filtrar por tipo
            if (type.HasValue)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            // Solo activas
            query = query.Where(c => c.IsActive);

            var categories = await query
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

            if (category == null)
                return null;

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, int? userId = null)
        {
            // Validar que no exista una categoría con el mismo nombre y tipo para este usuario
            var exists = await _context.Categories
                .AnyAsync(c => c.Name == dto.Name &&
                              c.Type == dto.Type &&
                              c.UserId == userId &&
                              c.IsActive);

            if (exists)
                throw new InvalidOperationException($"Ya existe una categoría con el nombre '{dto.Name}' para el tipo {dto.Type}");

            var category = _mapper.Map<Category>(dto);
            category.UserId = userId;
            category.CreatedAt = DateTime.UtcNow;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null || !category.IsActive)
                throw new KeyNotFoundException($"Categoría con ID {id} no encontrada");

            // Validar unicidad (excepto para la misma categoría)
            var exists = await _context.Categories
                .AnyAsync(c => c.Id != id &&
                              c.Name == dto.Name &&
                              c.Type == dto.Type &&
                              c.UserId == category.UserId &&
                              c.IsActive);

            if (exists)
                throw new InvalidOperationException($"Ya existe una categoría con el nombre '{dto.Name}' para el tipo {dto.Type}");

            _mapper.Map(dto, category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null || !category.IsActive)
                return false;

            // Verificar si hay transacciones usando esta categoría
            var hasTransactions = await _context.Transactions
                .AnyAsync(t => t.CategoryId == id);

            if (hasTransactions)
            {
                // Soft delete
                category.IsActive = false;
            }
            else
            {
                // Hard delete (solo si no tiene transacciones)
                _context.Categories.Remove(category);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CategoryExistsAsync(int id)
        {
            return await _context.Categories
                .AnyAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<IEnumerable<CategoryDto>> GetDefaultCategoriesAsync()
        {
            var defaultCategories = await _context.Categories
                .Where(c => c.UserId == null && c.IsActive)
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(defaultCategories);
        }
    }
}