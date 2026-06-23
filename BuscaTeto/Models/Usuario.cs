using System;
using System.ComponentModel.DataAnnotations;

namespace BuscaTeto.Models
{
    public class Usuario
    {
        public int Id { get; set; } 
        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Telefone { get; set; } = string.Empty;

        [Required]
        public string TipoUsuario { get; set; } = string.Empty;

        [Required]
        public string Senha { get; set; } = string.Empty;

        // --- ADICIONADO: Propriedade para salvar a data de criação da conta ---
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    }
}