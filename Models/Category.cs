using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        public TransactionType Type { get; set; }

        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Indica si es una categoría predefinida del sistema (no se puede modificar)
        /// </summary>
        public bool IsSystemDefault { get; set; } = false;

        /// <summary>
        /// Orden de visualización dentro de su tipo
        /// </summary>
        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navegación
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}