namespace ziraat.Api.Models;

public class CustomerTransactionView
{
    public int Id { get; set; }
    public int? AddressId { get; set; }
    public int? PhoneId { get; set; }
    public DateTime CreatedAt { get; set; }

    // Customer
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string NationalNumber { get; set; } = string.Empty;
    public char Gender { get; set; }
    public byte CustomerType { get; set; }
    public byte Nationality { get; set; }
    public int Age { get; set; }
    public string BankBranch { get; set; } = string.Empty;

    // Address
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string OpenAddress { get; set; } = string.Empty;

    // Phone
    public string PhoneType { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string AreaCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
