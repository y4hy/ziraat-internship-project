using Microsoft.AspNetCore.Mvc;
using ziraat.Api.Data;
using ziraat.Api.Models;
using ziraat.Api.Validation;

namespace ziraat.Api.Controllers;

[ApiController]
[Route("api/customers")]
public class CustomerController(ICustomerRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await repository.GetAllAsync();
        return Ok(customers);
    }

    [HttpPost("batch")]
    public async Task<IActionResult> Batch([FromBody] CustomerBatchRequest request)
    {
        var errors = new Dictionary<string, string>();

        for (int i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            if (row.RowStatus == "Deleted") continue;

            var customer = row.Data;
            var key = row.Id.HasValue ? $"id:{row.Id}" : $"index:{i}";
            var number = customer.NationalNumber ?? string.Empty;

            if (customer.CustomerType == 2)
            {
                // Corporate — validate as tax number
                if (!NationalIdValidator.IsValidTaxNumber(number))
                    errors[key] = "Tax number must be 8–10 digits.";
            }
            else
            {
                // Individual (or any non-corporate) — validate as national ID
                if (!NationalIdValidator.IsValidNationalId(number))
                {
                    errors[key] = "National ID failed checksum validation.";
                }
                else if (customer.Nationality == 2 && !NationalIdValidator.StartsWithForeignPrefix(number))
                {
                    errors[key] = "Foreign national's ID must start with 99.";
                }
            }

            if (customer.FirstName?.Length > 150)
                errors[key] = "First name exceeds 150 characters.";
            if (customer.LastName?.Length > 100)
                errors[key] = "Last name exceeds 100 characters.";
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
