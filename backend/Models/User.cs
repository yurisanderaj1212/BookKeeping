using System.ComponentModel.DataAnnotations;

namespace WebApplication2.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; }

    [Required]
    public string PasswordHash { get; set; }  // Almacena el hash, no la contraseña plana

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; } = true;  // Para activar/desactivar cuentas
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}