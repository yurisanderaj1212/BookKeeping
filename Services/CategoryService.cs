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

        /// <summary>
        /// Obtener todas las categorías globales (opcionalmente filtradas por tipo)
        /// </summary>
        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync(int? userId = null, TransactionType? type = null)
        {
            var query = _context.Categories.AsQueryable();

            // Filtrar por tipo si se especifica
            if (type.HasValue)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            // Solo categorías activas
            query = query.Where(c => c.IsActive);

            var categories = await query
                .OrderBy(c => c.Type)
                .ThenBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        /// <summary>
        /// Obtener categoría por ID
        /// </summary>
        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

            if (category == null)
                return null;

            return _mapper.Map<CategoryDto>(category);
        }

        /// <summary>
        /// Verificar si una categoría existe
        /// </summary>
        public async Task<bool> CategoryExistsAsync(int id)
        {
            return await _context.Categories
                .AnyAsync(c => c.Id == id && c.IsActive);
        }

        /// <summary>
        /// Obtener categorías por defecto (mismo que GetCategoriesAsync para categorías globales)
        /// </summary>
        public async Task<IEnumerable<CategoryDto>> GetDefaultCategoriesAsync()
        {
            var defaultCategories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Type)
                .ThenBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(defaultCategories);
        }

        // MÉTODOS ELIMINADOS: Las categorías son fijas y no se pueden modificar
        // - CreateCategoryAsync
        // - UpdateCategoryAsync  
        // - DeleteCategoryAsync

        /// <summary>
        /// Crear nueva categoría (DESHABILITADO - Solo para uso interno/admin)
        /// </summary>
        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, int? userId = null)
        {
            throw new NotSupportedException("Las categorías son fijas y no se pueden crear nuevas categorías.");
        }

        /// <summary>
        /// Actualizar categoría (DESHABILITADO - Solo para uso interno/admin)
        /// </summary>
        public async Task<CategoryDto> UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            throw new NotSupportedException("Las categorías son fijas y no se pueden modificar.");
        }

        /// <summary>
        /// Eliminar categoría (DESHABILITADO - Solo para uso interno/admin)
        /// </summary>
        public async Task<bool> DeleteCategoryAsync(int id)
        {
            throw new NotSupportedException("Las categorías son fijas y no se pueden eliminar.");
        }
    }
}