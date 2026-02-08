using System.ComponentModel.DataAnnotations;

public class RegisterRequest
{
    [Required, EmailAddress, StringLength(100)]
    public string Email { get; set; }

    [Required, MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string Password { get; set; }

    [Required]
    public string ConfirmPassword { get; set; }

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}