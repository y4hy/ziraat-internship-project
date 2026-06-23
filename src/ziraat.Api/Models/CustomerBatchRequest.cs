namespace ziraat.Api.Models;

public class CustomerBatchRequest
{
    public List<CustomerRow> Rows { get; set; } = new();
}

public class CustomerRow
{
    public int? Id { get; set; }
    public string RowStatus { get; set; } = "Unchanged";
    public Customer Data { get; set; } = null!;
}
