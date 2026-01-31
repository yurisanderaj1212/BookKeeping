using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text; 
using WebApplication2.Data;
using WebApplication2.Dto;  
using WebApplication2.Models;  

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // Endpoint para registro de usuario
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Verificar si el email ya existe
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("El email ya está registrado.");

        // Validación adicional: Formato email estricto
        var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        if (!emailRegex.IsMatch(request.Email))
            return BadRequest("El email no tiene un formato válido.");

        // Verificar que las contraseñas coincidan
        if (request.Password != request.ConfirmPassword)
        {
            ModelState.AddModelError("ConfirmPassword", "Las contraseñas no coinciden.");
            return BadRequest(ModelState);
        }

        if (!IsPasswordStrong(request.Password))
        {
            ModelState.AddModelError("Password", "La contraseña es demasiado débil. Debe incluir mayúsculas, minúsculas, números y símbolos.");
            return BadRequest(ModelState);  
        }

        // Crear usuario con hash de contraseña
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Usuario registrado exitosamente.");
    }

    // Endpoint para login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Buscar usuario por email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
        if (user == null)
            return Unauthorized("Credenciales inválidas.");

        // Verificar contraseña
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Credenciales inválidas.");

        // Generar JWT
        var token = GenerateJwtToken(user);

        // Crear respuesta con token y datos del usuario
        var response = new TokenResponse
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),  // Expira en 1 hora (ajusta según necesites)
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            }
        };

        return Ok(response);
    }

    // Método privado para generar JWT
    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "tu-clave-secreta-super-segura"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "tu-api",
            audience: _configuration["Jwt:Audience"] ?? "tu-clientes",
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    private bool IsPasswordStrong(string password)
    {
        // Requiere al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
        var hasUpper = password.Any(char.IsUpper);
        var hasLower = password.Any(char.IsLower);
        var hasDigit = password.Any(char.IsDigit);
        var hasSymbol = password.Any(ch => !char.IsLetterOrDigit(ch));
        return password.Length >= 8 && hasUpper && hasLower && hasDigit && hasSymbol;
    }
    
}