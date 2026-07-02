namespace ziraat.Api.Models;

public class CustomerTransactionData
{
    // FK ids for the associated address/phone row; null means "insert a new one".
    // Carried inside Data (rather than as CustomerRow-level fields) so the request
    // shape matches what the frontend's generic batch client sends: { id, rowStatus, data }.
    public int? AddressId { get; set; }
    public int? PhoneId { get; set; }

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
