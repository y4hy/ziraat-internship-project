namespace ziraat.Api.Models;

public class CustomerHistory
{
    public int HistoryId { get; set; }
    public int CustomerId { get; set; }
    public string Operation { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string NationalNumber { get; set; } = string.Empty;
    public char Gender { get; set; }
    public byte CustomerType { get; set; }
    public byte Nationality { get; set; }
    public int Age { get; set; }
    public string BankBranch { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ChangedAt { get; set; }
}
