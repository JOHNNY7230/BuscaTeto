using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "O título é obrigatório.")]
        [MaxLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres.")]
        public string Titulo { get; set; } = string.Empty;

        [MaxLength(2000, ErrorMessage = "A descrição deve ter no máximo 2000 caracteres.")]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        public TipoImovel Tipo { get; set; }

        // Valores (Usamos decimal para evitar erros de arredondamento com dinheiro)
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorAluguel { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorCondominio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorIptu { get; set; }

        // Estrutura
        [Required]
        public int AreaEmMetrosQuadrados { get; set; }

        [Required]
        public int QuantidadeQuartos { get; set; }

        [Required]
        public int QuantidadeBanheiros { get; set; }

        public int VagasGaragem { get; set; }

        // Localização 
        [Required]
        [MaxLength(9)]
        public string Cep { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Logradouro { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Numero { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Complemento { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Bairro { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Cidade { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string Estado { get; set; } = string.Empty;

        // Essencial para buscas no mapa (estilo Quinto Andar)
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // Status e Auditoria
        public StatusImovel Status { get; set; } = StatusImovel.Disponivel;

        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
        public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    }

    public enum TipoImovel
    {
        Apartamento,
        Casa,
        Studio,
        Cobertura,
        Comercial
    }

    public enum StatusImovel
    {
        Disponivel,
        Alugado,
        EmManutencao,
        Inativo
    }
}