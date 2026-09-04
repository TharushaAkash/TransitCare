using SriLankaTransportComplaints.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SriLankaTransportComplaints.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Complaint> Complaints => Set<Complaint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.FirstName)
            .HasMaxLength(50);

        modelBuilder.Entity<User>()
            .Property(u => u.LastName)
            .HasMaxLength(50);

        modelBuilder.Entity<User>()
            .Property(u => u.PhoneNumber)
            .HasMaxLength(10);

        modelBuilder.Entity<User>()
            .Property(u => u.NicNumber)
            .HasMaxLength(12);

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasMaxLength(20);

        modelBuilder.Entity<Complaint>()
            .HasIndex(c => c.ReferenceNumber)
            .IsUnique();

        modelBuilder.Entity<Complaint>()
            .Property(c => c.Status)
            .HasMaxLength(20);

        modelBuilder.Entity<Complaint>()
            .HasOne(c => c.User)
            .WithMany(u => u.Complaints)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
