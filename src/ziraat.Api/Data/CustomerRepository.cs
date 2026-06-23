using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    public Task<List<Customer>> GetAllAsync() =>
        db.Customers.OrderBy(c => c.Id).ToListAsync();

    public async Task<int> InsertAsync(Customer customer)
    {
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
        return customer.Id;
    }

    public async Task UpdateAsync(Customer customer)
    {
        db.Customers.Update(customer);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        await db.Customers.Where(c => c.Id == id).ExecuteDeleteAsync();
    }

    public async Task ProcessBatchAsync(
        IEnumerable<CustomerRow> deletes,
        IEnumerable<CustomerRow> updates,
        IEnumerable<CustomerRow> inserts)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            foreach (var row in deletes)
                await db.Customers.Where(c => c.Id == row.Id!.Value).ExecuteDeleteAsync();

            foreach (var row in updates)
            {
                var customer = row.Data;
                customer.Id = row.Id!.Value;
                db.Customers.Update(customer);
            }

            foreach (var row in inserts)
                db.Customers.Add(row.Data);

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
