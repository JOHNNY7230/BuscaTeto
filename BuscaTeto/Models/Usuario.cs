using System;

namespace BuscaTeto.Models
{
    public class Usuario
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}