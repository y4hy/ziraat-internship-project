namespace ziraat.Api.Models;

public class Account
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;

    /// <summary>1 = Time Deposit, 2 = Demand Deposit.</summary>
    public byte AccountType { get; set; }

    /// <summary>1 = TL, 2 = USD, 3 = EUR.</summary>
    public byte Currency { get; set; }

    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
}
