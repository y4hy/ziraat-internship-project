namespace ziraat.Api.Models;

public class CustomerPhone
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string PhoneType { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string AreaCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
