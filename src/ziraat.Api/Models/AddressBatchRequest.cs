namespace ziraat.Api.Models;

public class AddressBatchRequest
{
    public List<AddressRow> Rows { get; set; } = new();
}

public class AddressRow
{
    public int? Id { get; set; }
    public string RowStatus { get; set; } = "Unchanged";
    public CustomerAddress Data { get; set; } = null!;
}
