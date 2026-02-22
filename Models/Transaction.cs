using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models
{
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category Category { get; set; } = null!;

        [MaxLength(255)]
        public string? Description { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? DebitAccountId { get; set; }
        public Account? DebitAccount { get; set; }

        public int? CreditAccountId { get; set; }
        public Account? CreditAccount { get; set; }
        public decimal DebitAmount { get; set; } = 0;
        public decimal CreditAmount { get; set; } = 0;
        
        // Cuenta asociada a la transacción (opcional)
        public int? AccountId { get; set; }
        
        [ForeignKey(nameof(AccountId))]
        public Account? Account { get; set; }
    }
}
