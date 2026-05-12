using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuscaTeto.Models
{
    public class Usuario
    {
        [Key]
        [Column(TypeName = "char(36)")]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Senha { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Telefone { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}