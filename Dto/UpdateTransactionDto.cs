using System.ComponentModel.DataAnnotations;
using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class UpdateTransactionDto
    {
        public TransactionType? Type { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? Amount { get; set; }

        public int? CategoryId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public DateOnly? Date { get; set; }

        // Campo opcional para asignar/desasignar cuenta
        public int? AccountId { get; set; }
    }
}
