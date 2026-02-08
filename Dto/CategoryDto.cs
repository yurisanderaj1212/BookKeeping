using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public TransactionType Type { get; set; }
        public bool IsActive { get; set; }
    }
}
