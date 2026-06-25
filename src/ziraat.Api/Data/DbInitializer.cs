using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

/// <summary>
/// Applies pending migrations and database objects that EF cannot model
/// (here, the audit trigger that mirrors Customer changes into Customer_History).
/// The trigger definition lives here so the codebase stays the source of truth;
/// CREATE OR ALTER makes it safe to run on every startup.
/// </summary>
public static class DbInitializer
{
    // Default credentials seeded for Phase 3 login. Username: admin / Password: admin123
    private const string DefaultUsername = "admin";
    private const string DefaultPassword = "admin123";

    public static async Task InitializeAsync(AppDbContext db, IPasswordHasher<User> passwordHasher)
    {
        await db.Database.MigrateAsync();
        await db.Database.ExecuteSqlRawAsync(CustomerHistoryTrigger);
        await SeedDefaultUserAsync(db, passwordHasher);
    }

    private static async Task SeedDefaultUserAsync(AppDbContext db, IPasswordHasher<User> passwordHasher)
    {
        if (await db.Users.AnyAsync()) return;

        var user = new User { Username = DefaultUsername };
        user.PasswordHash = passwordHasher.HashPassword(user, DefaultPassword);
        db.Users.Add(user);
        await db.SaveChangesAsync();
    }

    private const string CustomerHistoryTrigger = """
        CREATE OR ALTER TRIGGER trg_Customer_History
        ON Customer
        AFTER INSERT, UPDATE, DELETE
        AS
        BEGIN
            SET NOCOUNT ON;

            IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
            BEGIN
                INSERT INTO Customer_History (Operation, CustomerId, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt)
                SELECT 'UPDATE', Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt
                FROM inserted;
            END
            ELSE IF EXISTS (SELECT 1 FROM inserted)
            BEGIN
                INSERT INTO Customer_History (Operation, CustomerId, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt)
                SELECT 'INSERT', Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt
                FROM inserted;
            END
            ELSE IF EXISTS (SELECT 1 FROM deleted)
            BEGIN
                INSERT INTO Customer_History (Operation, CustomerId, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt)
                SELECT 'DELETE', Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt
                FROM deleted;
            END
        END
        """;
}
