using System;
using System.ComponentModel.DataAnnotations;

namespace BuscaTeto.Models
{
    public class Endereco
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Logradouro { get; set; } = string.Empty;

        [MaxLength(10)]
        public string? Numero { get; set; }

        [MaxLength(100)]
        public string? Bairro { get; set; }

        [Required]
        [MaxLength(100)]
        public string Cidade { get; set; } = string.Empty;

        [MaxLength(2)]
        public string? Estado { get; set; }

        [MaxLength(9)]
        public string? CEP { get; set; }
    }
}