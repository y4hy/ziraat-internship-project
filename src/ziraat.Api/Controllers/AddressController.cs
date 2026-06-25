using Microsoft.AspNetCore.Mvc;
using ziraat.Api.Data;
using ziraat.Api.Models;

namespace ziraat.Api.Controllers;

[ApiController]
[Route("api/addresses")]
public class AddressController(IAddressRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var addresses = await repository.GetAllAsync();
        return Ok(addresses);
    }

    [HttpPost("batch")]
    public async Task<IActionResult> Batch([FromBody] AddressBatchRequest request)
    {
        var errors = new Dictionary<string, string>();

        for (int i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            if (row.RowStatus == "Deleted") continue;

            var address = row.Data;
            var key = row.Id.HasValue ? $"id:{row.Id}" : $"index:{i}";

            if (address.CustomerId <= 0)
                errors[key] = "Customer number is required.";
            else if (string.IsNullOrWhiteSpace(address.Province))
                errors[key] = "Province is required.";
            else if (string.IsNullOrWhiteSpace(address.District))
                errors[key] = "District is required.";
            else if (string.IsNullOrWhiteSpace(address.OpenAddress))
                errors[key] = "Open address is required.";
        }

        if (errors.Count > 0)
            return BadRequest(new { errors });

        var deletes = request.Rows.Where(r => r.RowStatus == "Deleted");
        var updates = request.Rows.Where(r => r.RowStatus == "Modified");
        var inserts = request.Rows.Where(r => r.RowStatus == "Added");

        await repository.ProcessBatchAsync(deletes, updates, inserts);

        var refreshed = await repository.GetAllAsync();
        return Ok(refreshed);
    }
}
