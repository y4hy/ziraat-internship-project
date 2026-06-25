using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ziraat.Api.Models;

namespace ziraat.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerHistory> CustomerHistories => Set<CustomerHistory>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<CustomerPhone> CustomerPhones => Set<CustomerPhone>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            // Declares the audit trigger (created in DbInitializer) so EF avoids the
            // OUTPUT clause, which SQL Server forbids on trigger-bearing tables.
            entity.ToTable("Customer", tb => tb.HasTrigger("trg_Customer_History"));
            entity.HasKey(e => e.Id);

            entity.Property(e => e.FirstName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.NationalNumber).HasMaxLength(11).IsUnicode(false).IsRequired();

            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasConversion(new ValueConverter<char, string>(
                    c => c.ToString(),
                    s => s[0]));

            entity.Property(e => e.CustomerType).HasColumnType("tinyint");
            entity.Property(e => e.Nationality).HasColumnType("tinyint");
            entity.Property(e => e.BankBranch).HasMaxLength(150);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETDATE()")
                .ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<CustomerHistory>(entity =>
        {
            entity.ToTable("Customer_History");
            entity.HasKey(e => e.HistoryId);

            entity.Property(e => e.Operation).HasMaxLength(6).IsUnicode(false).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.NationalNumber).HasMaxLength(11).IsUnicode(false).IsRequired();

            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasConversion(new ValueConverter<char, string>(
                    c => c.ToString(),
                    s => s[0]));

            entity.Property(e => e.CustomerType).HasColumnType("tinyint");
            entity.Property(e => e.Nationality).HasColumnType("tinyint");
            entity.Property(e => e.BankBranch).HasMaxLength(150);
            entity.Property(e => e.ChangedAt).HasDefaultValueSql("GETDATE()");
        });

        modelBuilder.Entity<CustomerAddress>(entity =>
        {
            entity.ToTable("Customer_Address");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Province).HasMaxLength(100).IsRequired();
            entity.Property(e => e.District).HasMaxLength(100).IsRequired();
            entity.Property(e => e.OpenAddress).HasMaxLength(500).IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETDATE()")
                .ValueGeneratedOnAdd();

            // Addresses depend on an existing customer; remove them when the customer is deleted.
            entity.HasOne<Customer>()
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CustomerPhone>(entity =>
        {
            entity.ToTable("Customer_Phone");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.PhoneType).HasMaxLength(20).IsUnicode(false).IsRequired();
            entity.Property(e => e.CountryCode).HasMaxLength(5).IsUnicode(false).IsRequired();
            entity.Property(e => e.AreaCode).HasMaxLength(3).IsUnicode(false).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(7).IsUnicode(false).IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETDATE()")
                .ValueGeneratedOnAdd();

            entity.HasOne<Customer>()
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.PasswordHash).HasMaxLength(500).IsRequired();
        });

        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("Account");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.AccountNumber).HasMaxLength(34).IsUnicode(false).IsRequired();
            entity.Property(e => e.AccountType).HasColumnType("tinyint");
            entity.Property(e => e.Currency).HasColumnType("tinyint");
            entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");

            entity.HasOne<Customer>()
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
