namespace ziraat.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string NationalNumber { get; set; } = string.Empty;
    public char Gender { get; set; }
    public byte CustomerType { get; set; }
    public byte Nationality { get; set; }
    public int Age { get; set; }
    public string BankBranch { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
