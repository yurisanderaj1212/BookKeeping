using System.ComponentModel.DataAnnotations;
using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        public TransactionType Type { get; set; }
    }
}
