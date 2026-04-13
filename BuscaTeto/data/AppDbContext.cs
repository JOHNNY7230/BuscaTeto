using BuscaTeto.Models;
using Microsoft.EntityFrameworkCore;

namespace BuscaTeto.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Imovel> Imoveis { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
    }
}