using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models
{
    public class Account
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Code { get; set; } // Ej: "1010", "1100" - para orden contable

        [Required]
        [MaxLength(20)]
        public AccountType Type { get; set; }

        [MaxLength(30)]
        public AccountSubType SubType { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal InitialBalance { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentBalance { get; set; } = 0;

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Transaction> DebitTransactions { get; set; } = new List<Transaction>();
        public ICollection<Transaction> CreditTransactions { get; set; } = new List<Transaction>();

    }
}
