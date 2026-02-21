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
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(ICategoryService categoryService, ILogger<CategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las categorías (opcionalmente filtradas por tipo)
        /// </summary>
        /// <param name="type">Tipo de categoría: 0 = Ingresos, 1 = Gastos</param>
        /// <returns>Lista de categorías</returns>
        [HttpGet]
        [AllowAnonymous] // Las categorías son públicas y globales
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(
            [FromQuery] int? type)
        {
            try
            {
                var categories = await _categoryService.GetCategoriesAsync(null, (TransactionType?)type);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo categorías");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener categorías por defecto (mismo que GetCategories para categorías globales)
        /// </summary>
        /// <returns>Lista de categorías por defecto</returns>
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
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener una categoría específica por ID
        /// </summary>
        /// <param name="id">ID de la categoría</param>
        /// <returns>Categoría encontrada</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);

                if (category == null)
                    return NotFound(new { message = $"Categoría con ID {id} no encontrada" });

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo categoría con ID {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // ENDPOINTS ELIMINADOS: Las categorías son fijas y no se pueden modificar
        // - POST /api/category (crear)
        // - PUT /api/category/{id} (actualizar)  
        // - DELETE /api/category/{id} (eliminar)

        /// <summary>
        /// Endpoint deshabilitado - Las categorías son fijas
        /// </summary>
        [HttpPost]
        [ApiExplorerSettings(IgnoreApi = true)] // Ocultar de Swagger
        public IActionResult CreateCategory()
        {
            return BadRequest(new { 
                message = "Las categorías son fijas y predefinidas. No se pueden crear nuevas categorías.",
                availableCategories = "Use GET /api/category para ver las categorías disponibles"
            });
        }

        /// <summary>
        /// Endpoint deshabilitado - Las categorías son fijas
        /// </summary>
        [HttpPut("{id}")]
        [ApiExplorerSettings(IgnoreApi = true)] // Ocultar de Swagger
        public IActionResult UpdateCategory(int id)
        {
            return BadRequest(new { 
                message = "Las categorías son fijas y predefinidas. No se pueden modificar.",
                availableCategories = "Use GET /api/category para ver las categorías disponibles"
            });
        }

        /// <summary>
        /// Endpoint deshabilitado - Las categorías son fijas
        /// </summary>
        [HttpDelete("{id}")]
        [ApiExplorerSettings(IgnoreApi = true)] // Ocultar de Swagger
        public IActionResult DeleteCategory(int id)
        {
            return BadRequest(new { 
                message = "Las categorías son fijas y predefinidas. No se pueden eliminar.",
                availableCategories = "Use GET /api/category para ver las categorías disponibles"
            });
        }
    }
}