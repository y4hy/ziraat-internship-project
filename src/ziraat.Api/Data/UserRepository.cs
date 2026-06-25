using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class UserRepository(AppDbContext db) : IUserRepository
{
    /// <summary>
    /// Looks up a user by username using an ad-hoc parameterized SQL statement
    /// (Phase 3 requires login verification via SQL statements, not stored procedures).
    /// The {0} placeholder is sent as a SqlParameter, so the query is not injectable.
    /// </summary>
    public Task<User?> FindByUsernameAsync(string username) =>
        db.Users
            .FromSqlRaw("SELECT * FROM Users WHERE Username = {0}", username)
            .AsNoTracking()
            .FirstOrDefaultAsync();
}
