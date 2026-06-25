namespace ziraat.Api.Models;

/// <summary>
/// One aggregated row of the Customer Account Report: accounts grouped by
/// (AccountType, Currency, IsActive) with their count and summed balance.
/// </summary>
public class AccountReportRow
{
    public byte AccountType { get; set; }
    public byte Currency { get; set; }
    public bool IsActive { get; set; }
    public int AccountCount { get; set; }
    public decimal TotalBalance { get; set; }
}
