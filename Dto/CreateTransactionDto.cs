using System.ComponentModel.DataAnnotations;
using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class CreateTransactionDto
    {
        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        [Required]
        public DateOnly Date { get; set; }
        
        // Campo opcional para asignar cuenta
        public int? AccountId { get; set; }
        
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
    }
}
