using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    public async Task<List<CustomerTransactionView>> GetAllAsync()
    {
        var customers = await db.Customers.OrderBy(c => c.Id).ToListAsync();
        return await ComposeViewsAsync(customers);
    }

    public async Task<List<CustomerTransactionView>> GetByBranchAsync(string branch)
    {
        var customers = await db.Customers.Where(c => c.BankBranch == branch).OrderBy(c => c.Id).ToListAsync();
        return await ComposeViewsAsync(customers);
    }

    private async Task<List<CustomerTransactionView>> ComposeViewsAsync(List<Customer> customers)
    {
        var customerIds = customers.Select(c => c.Id).ToList();

        var addresses = await db.CustomerAddresses.Where(a => customerIds.Contains(a.CustomerId)).ToListAsync();
        var phones = await db.CustomerPhones.Where(p => customerIds.Contains(p.CustomerId)).ToListAsync();

        var addressByCustomer = addresses
            .GroupBy(a => a.CustomerId)
            .ToDictionary(g => g.Key, g => g.OrderBy(a => a.Id).First());
        var phoneByCustomer = phones
            .GroupBy(p => p.CustomerId)
            .ToDictionary(g => g.Key, g => g.OrderBy(p => p.Id).First());

        return customers.Select(c =>
        {
            addressByCustomer.TryGetValue(c.Id, out var address);
            phoneByCustomer.TryGetValue(c.Id, out var phone);

            return new CustomerTransactionView
            {
                Id = c.Id,
                AddressId = address?.Id,
                PhoneId = phone?.Id,
                CreatedAt = c.CreatedAt,
                FirstName = c.FirstName,
                LastName = c.LastName,
                NationalNumber = c.NationalNumber,
                Gender = c.Gender,
                CustomerType = c.CustomerType,
                Nationality = c.Nationality,
                Age = c.Age,
                BankBranch = c.BankBranch,
                Province = address?.Province ?? string.Empty,
                District = address?.District ?? string.Empty,
                OpenAddress = address?.OpenAddress ?? string.Empty,
                PhoneType = phone?.PhoneType ?? string.Empty,
                CountryCode = phone?.CountryCode ?? string.Empty,
                AreaCode = phone?.AreaCode ?? string.Empty,
                PhoneNumber = phone?.PhoneNumber ?? string.Empty,
            };
        }).ToList();
    }

    public async Task<HashSet<int>> GetExistingIdsAsync(IEnumerable<int> ids)
    {
        var distinct = ids.Where(id => id > 0).Distinct().ToList();
        if (distinct.Count == 0) return new HashSet<int>();

        var found = await db.Customers
            .Where(c => distinct.Contains(c.Id))
            .Select(c => c.Id)
            .ToListAsync();
        return found.ToHashSet();
    }

    public Task<List<string>> GetDistinctBranchesAsync() =>
        db.Customers
            .Where(c => c.BankBranch != null && c.BankBranch != "")
            .Select(c => c.BankBranch)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync();

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
            // Deletes: removing the Customer row cascades to its address/phone rows.
            foreach (var row in deletes)
                await db.Customers.Where(c => c.Id == row.Id!.Value).ExecuteDeleteAsync();

            // Updates: bulk-update in place (ExecuteUpdateAsync) rather than attaching
            // a fresh entity, so the DB-generated CreatedAt column (never sent by the
            // client) isn't clobbered back to its default value.
            foreach (var row in updates)
            {
                var data = row.Data;
                var customerId = row.Id!.Value;

                await db.Customers.Where(c => c.Id == customerId).ExecuteUpdateAsync(s => s
                    .SetProperty(c => c.FirstName, data.FirstName)
                    .SetProperty(c => c.LastName, data.LastName)
                    .SetProperty(c => c.NationalNumber, data.NationalNumber)
                    .SetProperty(c => c.Gender, data.Gender)
                    .SetProperty(c => c.CustomerType, data.CustomerType)
                    .SetProperty(c => c.Nationality, data.Nationality)
                    .SetProperty(c => c.Age, data.Age)
                    .SetProperty(c => c.BankBranch, data.BankBranch));

                if (data.AddressId.HasValue)
                {
                    await db.CustomerAddresses.Where(a => a.Id == data.AddressId.Value).ExecuteUpdateAsync(s => s
                        .SetProperty(a => a.Province, data.Province)
                        .SetProperty(a => a.District, data.District)
                        .SetProperty(a => a.OpenAddress, data.OpenAddress));
                }
                else
                {
                    // Legacy customer with no address row yet — backfill one.
                    db.CustomerAddresses.Add(new CustomerAddress
                    {
                        CustomerId = customerId,
                        Province = data.Province,
                        District = data.District,
                        OpenAddress = data.OpenAddress,
                    });
                }

                if (data.PhoneId.HasValue)
                {
                    await db.CustomerPhones.Where(p => p.Id == data.PhoneId.Value).ExecuteUpdateAsync(s => s
                        .SetProperty(p => p.PhoneType, data.PhoneType)
                        .SetProperty(p => p.CountryCode, data.CountryCode)
                        .SetProperty(p => p.AreaCode, data.AreaCode)
                        .SetProperty(p => p.PhoneNumber, data.PhoneNumber));
                }
                else
                {
                    // Legacy customer with no phone row yet — backfill one.
                    db.CustomerPhones.Add(new CustomerPhone
                    {
                        CustomerId = customerId,
                        PhoneType = data.PhoneType,
                        CountryCode = data.CountryCode,
                        AreaCode = data.AreaCode,
                        PhoneNumber = data.PhoneNumber,
                    });
                }
            }

            // Inserts: the Customer must be saved first so its generated Id can be
            // used as the FK on the new address/phone rows.
            var pendingInserts = new List<(CustomerRow Row, Customer Customer)>();
            foreach (var row in inserts)
            {
                var data = row.Data;
                var customer = new Customer
                {
                    FirstName = data.FirstName,
                    LastName = data.LastName,
                    NationalNumber = data.NationalNumber,
                    Gender = data.Gender,
                    CustomerType = data.CustomerType,
                    Nationality = data.Nationality,
                    Age = data.Age,
                    BankBranch = data.BankBranch,
                };
                db.Customers.Add(customer);
                pendingInserts.Add((row, customer));
            }

            // Flushes the new Customer inserts (to generate their Ids) together with
            // any legacy-backfill address/phone Adds queued above.
            await db.SaveChangesAsync();

            foreach (var (row, customer) in pendingInserts)
            {
                var data = row.Data;
                db.CustomerAddresses.Add(new CustomerAddress
                {
                    CustomerId = customer.Id,
                    Province = data.Province,
                    District = data.District,
                    OpenAddress = data.OpenAddress,
                });
                db.CustomerPhones.Add(new CustomerPhone
                {
                    CustomerId = customer.Id,
                    PhoneType = data.PhoneType,
                    CountryCode = data.CountryCode,
                    AreaCode = data.AreaCode,
                    PhoneNumber = data.PhoneNumber,
                });
            }

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
