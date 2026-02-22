using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class TransactionDto
    {
        public int Id { get; set; }
        public TransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;

        public string? Description { get; set; }
        public DateTime Date { get; set; }
        
        // Campo opcional para la cuenta asociada
        public int? AccountId { get; set; }
        
        public string? Notes { get; set; }
    }
}
