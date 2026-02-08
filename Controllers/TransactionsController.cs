using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication2.Dto;
using WebApplication2.Services;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service)
    {
        _service = service;
    }

    // Método auxiliar para obtener el ID del usuario autenticado
    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst("id")
                      ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                      ?? User.FindFirst("sub");

        if (userIdClaim == null)
            return null;

        return int.TryParse(userIdClaim.Value, out var id) ? id : null;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTransactionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("Usuario no autenticado o token inválido.");

        var result = await _service.CreateAsync(userId.Value, dto);
        return CreatedAtAction(nameof(GetAll), new { }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("Usuario no autenticado o token inválido.");

        var transactions = await _service.GetAllAsync(userId.Value);
        return Ok(transactions);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateTransactionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("Usuario no autenticado o token inválido.");

        var updated = await _service.UpdateAsync(userId.Value, id, dto);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("Usuario no autenticado o token inválido.");

        var deleted = await _service.DeleteAsync(userId.Value, id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
