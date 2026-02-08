using System.ComponentModel.DataAnnotations;
using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class UpdateTransactionDto
    {
        [Required]
        public TransactionType? Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal? Amount { get; set; }

        [Required, MaxLength(100)]
        public string Category { get; set; } = null!;
        public int? CategoryId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        [Required]
        public DateOnly Date { get; set; }
    }
}
