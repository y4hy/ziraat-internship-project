using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class AddressRepository(AppDbContext db) : IAddressRepository
{
    public Task<List<CustomerAddress>> GetAllAsync() =>
        db.CustomerAddresses.OrderBy(a => a.Id).ToListAsync();

    public async Task ProcessBatchAsync(
        IEnumerable<AddressRow> deletes,
        IEnumerable<AddressRow> updates,
        IEnumerable<AddressRow> inserts)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            foreach (var row in deletes)
                await db.CustomerAddresses.Where(a => a.Id == row.Id!.Value).ExecuteDeleteAsync();

            foreach (var row in updates)
            {
                var address = row.Data;
                address.Id = row.Id!.Value;
                db.CustomerAddresses.Update(address);
            }

            foreach (var row in inserts)
                db.CustomerAddresses.Add(row.Data);

            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}
