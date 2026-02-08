namespace WebApplication2.Models
{
    public enum AccountType
    {
        Asset = 1,      // Activo (aumenta con débito)
        Liability = 2,  // Pasivo (aumenta con crédito)
        Equity = 3,     // Patrimonio (aumenta con crédito)
        Income = 4,     // Ingreso (aumenta con crédito)
        Expense = 5    // Gasto (aumenta con débito)
    }
}
