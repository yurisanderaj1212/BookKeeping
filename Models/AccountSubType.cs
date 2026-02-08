namespace WebApplication2.Models
{
    public enum AccountSubType
    {
        // Para Asset
        BankAccount = 1001,
        Cash = 1002,
        AccountsReceivable = 1003,
        Inventory = 1004,
        
        // Para Liability
        AccountsPayable = 2001,
        CreditCard = 2002,
        Loan = 2003,
        
        // Para Equity
        Capital = 3001,
        RetainedEarnings = 3002,
        
        // Para Income/Expense
        IncomeGeneral = 4001,
        ExpenseGeneral = 4002
    }
}
