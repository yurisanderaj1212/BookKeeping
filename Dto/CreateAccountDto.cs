using System.ComponentModel.DataAnnotations;
using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class CreateAccountDto
    {
        [Required(ErrorMessage = "El nombre de la cuenta es obligatorio")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(20)]
        [RegularExpression(@"^\d{1,4}(\.\d{1,2})?$", ErrorMessage = "Formato de código inválido")]
        public string? Code { get; set; }

        [Required(ErrorMessage = "El tipo de cuenta es obligatorio")]
        public AccountType Type { get; set; }

        public AccountSubType SubType { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "El balance inicial debe ser mayor o igual a 0")]
        public decimal InitialBalance { get; set; } = 0;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";
    }
}
