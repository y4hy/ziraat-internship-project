namespace ziraat.Api.Models;

public class AccountBatchRequest
{
    public List<AccountRow> Rows { get; set; } = new();
}

public class AccountRow
{
    public int? Id { get; set; }
    public string RowStatus { get; set; } = "Unchanged";
    public Account Data { get; set; } = null!;
}
