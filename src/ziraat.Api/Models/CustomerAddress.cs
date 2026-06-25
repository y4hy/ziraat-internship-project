namespace ziraat.Api.Models;

public class CustomerAddress
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string OpenAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
