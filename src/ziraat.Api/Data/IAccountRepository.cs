using ziraat.Api.Models;

namespace ziraat.Api.Data;

public interface IAccountRepository
{
    Task<List<Account>> GetByCustomerAsync(int customerId);

    Task ProcessBatchAsync(
        IEnumerable<AccountRow> deletes,
        IEnumerable<AccountRow> updates,
        IEnumerable<AccountRow> inserts);

    Task<List<AccountReportRow>> GetReportAsync(
        string? branch,
        byte? currency,
        byte? accountType,
        bool? isActive,
        decimal? minBalance);
}
