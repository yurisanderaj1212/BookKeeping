namespace WebApplication2.Dto
{
    public class AccountBalanceDto
    {
        public int AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
        public decimal CalculatedBalance { get; set; }
        public decimal Difference { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
