namespace ziraat.Api.Models;

public class PhoneBatchRequest
{
    public List<PhoneRow> Rows { get; set; } = new();
}

public class PhoneRow
{
    public int? Id { get; set; }
    public string RowStatus { get; set; } = "Unchanged";
    public CustomerPhone Data { get; set; } = null!;
}
