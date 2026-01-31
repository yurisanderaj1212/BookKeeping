using Microsoft.EntityFrameworkCore;
using WebApplication2.Models;  // Asegúrate de importar tus modelos

namespace WebApplication2.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSet para tus entidades (solo User por ahora, añade más para bookkeeping después)
    public DbSet<User> Users { get; set; }

    // Configuración adicional (opcional, para personalizar tablas o relaciones)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ejemplo: Configurar índices únicos para Email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Si añades más entidades (ej. Transactions), configura relaciones aquí
    }
}