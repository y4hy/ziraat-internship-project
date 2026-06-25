using ziraat.Api.Models;

namespace ziraat.Api.Data;

public interface IPhoneRepository
{
    Task<List<CustomerPhone>> GetAllAsync();
    Task ProcessBatchAsync(
        IEnumerable<PhoneRow> deletes,
        IEnumerable<PhoneRow> updates,
        IEnumerable<PhoneRow> inserts);
}
