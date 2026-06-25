using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ziraat.Api.Data;
using ziraat.Api.Models;

namespace ziraat.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/accounts")]
public class AccountsController(IAccountRepository repository, ICustomerRepository customers) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetByCustomer([FromQuery] int customerId)
    {
        if (customerId <= 0)
            return BadRequest(new { error = "A valid customerId is required." });

        var accounts = await repository.GetByCustomerAsync(customerId);
        return Ok(accounts);
    }

    [HttpPost("batch")]
    public async Task<IActionResult> Batch([FromBody] AccountBatchRequest request)
    {
        var errors = new Dictionary<string, string>();

        var existingCustomerIds = await customers.GetExistingIdsAsync(
            request.Rows.Where(r => r.RowStatus != "Deleted").Select(r => r.Data.CustomerId));

        for (int i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            if (row.RowStatus == "Deleted") continue;

            var account = row.Data;
            var key = row.Id.HasValue ? $"id:{row.Id}" : $"index:{i}";

            if (account.CustomerId <= 0)
                errors[key] = "Customer number is required.";
            else if (!existingCustomerIds.Contains(account.CustomerId))
                errors[key] = $"Customer #{account.CustomerId} does not exist.";
            else if (string.IsNullOrWhiteSpace(account.AccountNumber))
                errors[key] = "Account number is required.";
            else if (account.AccountType is < 1 or > 2)
                errors[key] = "Account type must be Time Deposit or Demand Deposit.";
            else if (account.Currency is < 1 or > 3)
                errors[key] = "Currency must be TL, USD or EUR.";
            else if (account.Balance < 0)
                errors[key] = "Account balance cannot be negative.";
        }

        if (errors.Count > 0)
            return BadRequest(new { errors });

        var deletes = request.Rows.Where(r => r.RowStatus == "Deleted");
        var updates = request.Rows.Where(r => r.RowStatus == "Modified");
        var inserts = request.Rows.Where(r => r.RowStatus == "Added");

        await repository.ProcessBatchAsync(deletes, updates, inserts);

        // The grid is scoped to a single customer; return that customer's refreshed rows.
        var customerId = request.Rows
            .Select(r => r.Data.CustomerId)
            .FirstOrDefault(id => id > 0);
        var refreshed = await repository.GetByCustomerAsync(customerId);
        return Ok(refreshed);
    }

    [HttpGet("report")]
    public async Task<IActionResult> GetReport(
        [FromQuery] string? branch,
        [FromQuery] byte? currency,
        [FromQuery] byte? accountType,
        [FromQuery] bool? isActive,
        [FromQuery] decimal? minBalance)
    {
        var report = await repository.GetReportAsync(branch, currency, accountType, isActive, minBalance);
        return Ok(report);
    }
}
