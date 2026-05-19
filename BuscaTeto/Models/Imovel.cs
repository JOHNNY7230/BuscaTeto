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

        [Column(TypeName = "decimal(10,2)")]
        public decimal Preco { get; set; }

        public int Quartos { get; set; }

        public string? Imagem { get; set; }

        // ==========================================
        // RELACIONAMENTO COM USUÁRIO (Já existente)
        // ==========================================
        public Guid UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        // ==========================================================
        // RELACIONAMENTO COM ENDEREÇO (ADICIONE ESTE BLOCO AQUI!)
        // ==========================================================
        [Required]
        public Guid EnderecoId { get; set; } // Representa o campo EnderecoId CHAR(36) no MySQL

        [ForeignKey("EnderecoId")]
        public Endereco? Endereco { get; set; } // Propriedade de navegação do Entity Framework

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}