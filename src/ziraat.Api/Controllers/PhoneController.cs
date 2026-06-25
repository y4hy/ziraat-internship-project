using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ziraat.Api.Data;
using ziraat.Api.Models;

namespace ziraat.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/phones")]
public partial class PhoneController(IPhoneRepository repository, ICustomerRepository customers) : ControllerBase
{
    [GeneratedRegex(@"^\d{3}$")]
    private static partial Regex AreaCodeRegex();

    [GeneratedRegex(@"^\d{7}$")]
    private static partial Regex PhoneNumberRegex();

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var phones = await repository.GetAllAsync();
        return Ok(phones);
    }

    [HttpPost("batch")]
    public async Task<IActionResult> Batch([FromBody] PhoneBatchRequest request)
    {
        var errors = new Dictionary<string, string>();

        var existingCustomerIds = await customers.GetExistingIdsAsync(
            request.Rows.Where(r => r.RowStatus != "Deleted").Select(r => r.Data.CustomerId));

        for (int i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            if (row.RowStatus == "Deleted") continue;

            var phone = row.Data;
            var key = row.Id.HasValue ? $"id:{row.Id}" : $"index:{i}";

            if (phone.CustomerId <= 0)
                errors[key] = "Customer number is required.";
            else if (!existingCustomerIds.Contains(phone.CustomerId))
                errors[key] = $"Customer #{phone.CustomerId} does not exist.";
            else if (string.IsNullOrWhiteSpace(phone.PhoneType))
                errors[key] = "Phone type is required.";
            else if (string.IsNullOrWhiteSpace(phone.CountryCode))
                errors[key] = "Country code is required.";
            else if (!AreaCodeRegex().IsMatch(phone.AreaCode ?? string.Empty))
                errors[key] = "Area code must be 3 digits.";
            else if (!PhoneNumberRegex().IsMatch(phone.PhoneNumber ?? string.Empty))
                errors[key] = "Phone number must be 7 digits.";
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
