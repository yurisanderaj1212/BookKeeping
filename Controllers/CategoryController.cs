// Controllers/CategoryController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication2.Dto;
using WebApplication2.Models;
using WebApplication2.Services;

namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Si usas autenticación
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(ICategoryService categoryService, ILogger<CategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        // GET: api/category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(
            [FromQuery] int? type)
        {
            try
            {
                // Obtener userId del usuario autenticado (si usas autenticación)
                // var userId = int.Parse(User.FindFirst("userId")?.Value);
                // var categories = await _categoryService.GetCategoriesAsync(userId, (TransactionType?)type);

                // Por ahora, sin autenticación:
                var categories = await _categoryService.GetCategoriesAsync(null, (TransactionType?)type);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo categorías");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // GET: api/category/default
        [HttpGet("default")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetDefaultCategories()
        {
            try
            {
                var categories = await _categoryService.GetDefaultCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo categorías por defecto");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // GET: api/category/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);

                if (category == null)
                    return NotFound($"Categoría con ID {id} no encontrada");

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo categoría con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // POST: api/category
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Obtener userId del usuario autenticado
                // var userId = int.Parse(User.FindFirst("userId")?.Value);
                // var category = await _categoryService.CreateCategoryAsync(dto, userId);

                // Por ahora:
                var category = await _categoryService.CreateCategoryAsync(dto);

                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando categoría");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // PUT: api/category/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedCategory = await _categoryService.UpdateCategoryAsync(id, dto);
                return Ok(updatedCategory);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando categoría con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // DELETE: api/category/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var deleted = await _categoryService.DeleteCategoryAsync(id);

                if (!deleted)
                    return NotFound($"Categoría con ID {id} no encontrada");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando categoría con ID {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}