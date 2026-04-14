using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Titulo { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Descricao { get; set; }

        
        [Required]
        [MaxLength(150)]
        public string Logradouro { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Numero { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Bairro { get; set; }

        [Required]
        [MaxLength(100)]
        public string Cidade { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string CEP { get; set; } = string.Empty;
 
        [Column(TypeName = "decimal(10,2)")]
        public decimal Preco { get; set; }

        public int Quartos { get; set; }

        public string? Imagem { get; set; }

        public Guid UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}