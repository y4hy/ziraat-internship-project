using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ziraat.Api.Data;
using ziraat.Api.Models;
using ziraat.Api.Validation;

namespace ziraat.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/customers")]
public partial class CustomerController(ICustomerRepository repository) : ControllerBase
{
    [GeneratedRegex(@"^\d{3}$")]
    private static partial Regex AreaCodeRegex();

    [GeneratedRegex(@"^\d{7}$")]
    private static partial Regex PhoneNumberRegex();

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? branch)
    {
        var customers = string.IsNullOrWhiteSpace(branch)
            ? await repository.GetAllAsync()
            : await repository.GetByBranchAsync(branch);
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

            if (string.IsNullOrWhiteSpace(customer.Province))
                errors[key] = "Province is required.";
            else if (string.IsNullOrWhiteSpace(customer.District))
                errors[key] = "District is required.";
            else if (string.IsNullOrWhiteSpace(customer.OpenAddress))
                errors[key] = "Open address is required.";
            else if (string.IsNullOrWhiteSpace(customer.PhoneType))
                errors[key] = "Phone type is required.";
            else if (string.IsNullOrWhiteSpace(customer.CountryCode))
                errors[key] = "Country code is required.";
            else if (!AreaCodeRegex().IsMatch(customer.AreaCode ?? string.Empty))
                errors[key] = "Area code must be 3 digits.";
            else if (!PhoneNumberRegex().IsMatch(customer.PhoneNumber ?? string.Empty))
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
