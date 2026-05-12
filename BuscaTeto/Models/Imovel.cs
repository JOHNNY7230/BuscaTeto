using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        [Key]
        [Column(TypeName = "char(36)")]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Titulo { get; set; } = string.Empty;

        public string? Descricao { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Preco { get; set; }

        public int Quartos { get; set; }

        [Column(TypeName = "longtext")]
        public string? Imagem { get; set; }

        // --- Relacionamento com Usuário ---
        [Required]
        [Column(TypeName = "char(36)")]
        public Guid UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        // --- Relacionamento com Endereço ---
        [Required]
        [Column(TypeName = "char(36)")]
        public Guid EnderecoId { get; set; }
        public Endereco? Endereco { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}