using WebApplication2.Models;

namespace WebApplication2.Dto
{
    public class AccountDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public AccountType Type { get; set; }
        public AccountSubType SubType { get; set; }
        public decimal CurrentBalance { get; set; }
        public string? Description { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
