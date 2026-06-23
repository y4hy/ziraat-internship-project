using ziraat.Api.Models;

namespace ziraat.Api.Data;

public interface ICustomerRepository
{
    Task<List<Customer>> GetAllAsync();
    Task<int> InsertAsync(Customer customer);
    Task UpdateAsync(Customer customer);
    Task DeleteAsync(int id);
    Task ProcessBatchAsync(
        IEnumerable<CustomerRow> deletes,
        IEnumerable<CustomerRow> updates,
        IEnumerable<CustomerRow> inserts);
}
