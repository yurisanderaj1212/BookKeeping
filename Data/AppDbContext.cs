using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using WebApplication2.Models;  // Asegúrate de importar tus modelos

namespace WebApplication2.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSet para tus entidades (solo User por ahora, añade más para bookkeeping después)
    public DbSet<User> Users { get; set; }
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories { get; set; }
    public DbSet<Account> Accounts { get; set; }

    // Configuración adicional (opcional, para personalizar tablas o relaciones)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ejemplo: Configurar índices únicos para Email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(t => t.Amount)
             .HasColumnType("decimal(18,2)");
        });
        // Índice único para categorías globales (sin UserId)
        modelBuilder.Entity<Category>()
           .HasIndex(c => new { c.Name, c.Type })
           .IsUnique();
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasOne(a => a.User)
                  .WithMany(u => u.Accounts)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<Transaction>()
                 .HasOne(t => t.Account)
                 .WithMany(a => a.Transactions)
                 .HasForeignKey(t => t.AccountId)
                 .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.DebitAccount)
            .WithMany(a => a.DebitTransactions)
            .HasForeignKey(t => t.DebitAccountId)
            .OnDelete(DeleteBehavior.Restrict); 

        
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.CreditAccount)
            .WithMany(a => a.CreditTransactions)
            .HasForeignKey(t => t.CreditAccountId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(t => t.DebitAmount)
            .HasColumnType("decimal(18, 2)");
        });
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(t => t.CreditAmount)
            .HasColumnType("decimal(18, 2)");
        });
    }
}