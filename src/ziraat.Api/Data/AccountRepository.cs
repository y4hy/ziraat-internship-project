using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class AccountRepository(AppDbContext db) : IAccountRepository
{
    public Task<List<Account>> GetByCustomerAsync(int customerId) =>
        db.Accounts.Where(a => a.CustomerId == customerId).OrderBy(a => a.Id).ToListAsync();

    public async Task ProcessBatchAsync(
        IEnumerable<AccountRow> deletes,
        IEnumerable<AccountRow> updates,
        IEnumerable<AccountRow> inserts)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            foreach (var row in deletes)
                await db.Accounts.Where(a => a.Id == row.Id!.Value).ExecuteDeleteAsync();

            foreach (var row in updates)
            {
                var account = row.Data;
                account.Id = row.Id!.Value;
                db.Accounts.Update(account);
            }

            foreach (var row in inserts)
                db.Accounts.Add(row.Data);

            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<List<AccountReportRow>> GetReportAsync(
        string? branch,
        byte? currency,
        byte? accountType,
        bool? isActive,
        decimal? minBalance)
    {
        // Join to Customer so the report can filter by the customer's branch.
        var query =
            from a in db.Accounts
            join c in db.Customers on a.CustomerId equals c.Id
            select new { a, c.BankBranch };

        if (!string.IsNullOrWhiteSpace(branch))
            query = query.Where(x => x.BankBranch == branch);
        if (currency.HasValue)
            query = query.Where(x => x.a.Currency == currency.Value);
        if (accountType.HasValue)
            query = query.Where(x => x.a.AccountType == accountType.Value);
        if (isActive.HasValue)
            query = query.Where(x => x.a.IsActive == isActive.Value);
        if (minBalance.HasValue)
            query = query.Where(x => x.a.Balance > minBalance.Value);

        return await query
            .GroupBy(x => new { x.a.AccountType, x.a.Currency, x.a.IsActive })
            .Select(g => new AccountReportRow
            {
                AccountType = g.Key.AccountType,
                Currency = g.Key.Currency,
                IsActive = g.Key.IsActive,
                AccountCount = g.Count(),
                TotalBalance = g.Sum(x => x.a.Balance),
            })
            .OrderBy(r => r.AccountType)
            .ThenBy(r => r.Currency)
            .ToListAsync();
    }
}
