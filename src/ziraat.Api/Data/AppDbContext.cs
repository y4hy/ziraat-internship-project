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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
        });
    }
}
