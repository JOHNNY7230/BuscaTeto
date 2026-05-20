using Microsoft.EntityFrameworkCore;
using BuscaTeto.Models;

namespace BuscaTeto.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Mapeia a classe Usuario para a tabela 'usuarios' do MySQL Workbench
        public DbSet<Usuario> Usuarios { get; set; }

        // Mapeia a classe Imovel para a tabela 'imoveis' do MySQL Workbench
        public DbSet<Imovel> Imoveis { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Garante que o EF Core procure as tabelas com os nomes exatos do banco local
            modelBuilder.Entity<Usuario>().ToTable("usuarios");
            modelBuilder.Entity<Imovel>().ToTable("imoveis");
        }
    }
}