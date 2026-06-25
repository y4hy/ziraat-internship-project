using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class PhoneRepository(AppDbContext db) : IPhoneRepository
{
    public Task<List<CustomerPhone>> GetAllAsync() =>
        db.CustomerPhones.OrderBy(p => p.Id).ToListAsync();

    public async Task ProcessBatchAsync(
        IEnumerable<PhoneRow> deletes,
        IEnumerable<PhoneRow> updates,
        IEnumerable<PhoneRow> inserts)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            foreach (var row in deletes)
                await db.CustomerPhones.Where(p => p.Id == row.Id!.Value).ExecuteDeleteAsync();

            foreach (var row in updates)
            {
                var phone = row.Data;
                phone.Id = row.Id!.Value;
                db.CustomerPhones.Update(phone);
            }

            foreach (var row in inserts)
                db.CustomerPhones.Add(row.Data);

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
