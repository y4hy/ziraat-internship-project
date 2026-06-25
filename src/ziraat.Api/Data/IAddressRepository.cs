using ziraat.Api.Models;

namespace ziraat.Api.Data;

public interface IAddressRepository
{
    Task<List<CustomerAddress>> GetAllAsync();
    Task ProcessBatchAsync(
        IEnumerable<AddressRow> deletes,
        IEnumerable<AddressRow> updates,
        IEnumerable<AddressRow> inserts);
}
