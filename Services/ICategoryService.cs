// Services/ICategoryService.cs
using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync(int? userId = null, TransactionType? type = null);
        Task<CategoryDto> GetCategoryByIdAsync(int id);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, int? userId = null);
        Task<CategoryDto> UpdateCategoryAsync(int id, CreateCategoryDto dto);
        Task<bool> DeleteCategoryAsync(int id);
        Task<bool> CategoryExistsAsync(int id);
        Task<IEnumerable<CategoryDto>> GetDefaultCategoriesAsync();
    }
}