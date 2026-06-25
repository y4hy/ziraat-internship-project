using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ziraat.Api.Data;

namespace ziraat.Api.Controllers;

/// <summary>
/// Serves the reference data used by the combo boxes. Province/phone/country lists
/// are kept in-memory; branches are derived from the distinct values already stored
/// on customers so the Account Operations filters stay consistent with real data.
/// </summary>
[ApiController]
[Authorize]
[Route("api/lookups")]
public class LookupController(ICustomerRepository customers) : ControllerBase
{
    public record Province(string Name, string[] Districts);
    public record Country(string Code, string Name);

    private static readonly Province[] Provinces =
    [
        new("İstanbul", ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli", "Bakırköy", "Beyoğlu", "Fatih", "Maltepe", "Kartal", "Pendik"]),
        new("Ankara", ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Pursaklar", "Gölbaşı", "Polatlı"]),
        new("İzmir", ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Bayraklı", "Gaziemir", "Balçova", "Karabağlar", "Narlıdere"]),
        new("Bursa", ["Osmangazi", "Nilüfer", "Yıldırım", "Gemlik", "İnegöl", "Mudanya", "Gürsu", "Kestel", "Orhangazi", "Mustafakemalpaşa"]),
        new("Antalya", ["Muratpaşa", "Konyaaltı", "Kepez", "Alanya", "Manavgat", "Serik", "Kemer", "Kaş", "Side", "Döşemealtı"]),
    ];

    private static readonly string[] PhoneTypes =
    [
        "Mobile Phone", "Home Phone", "Work Phone",
    ];

    private static readonly Country[] CountryCodes =
    [
        new("90", "Turkey"),
        new("1", "United States"),
        new("33", "France"),
        new("44", "United Kingdom"),
    ];

    [HttpGet("provinces")]
    public IActionResult GetProvinces() => Ok(Provinces);

    [HttpGet("phone-types")]
    public IActionResult GetPhoneTypes() => Ok(PhoneTypes);

    [HttpGet("country-codes")]
    public IActionResult GetCountryCodes() => Ok(CountryCodes);

    [HttpGet("branches")]
    public async Task<IActionResult> GetBranches() => Ok(await customers.GetDistinctBranchesAsync());
}
