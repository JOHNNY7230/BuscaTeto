using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        public int Id { get; set; } // Mudado de Guid para int!

        [Required]
        public string Titulo { get; set; } = string.Empty;

        public string? Descricao { get; set; }

        [Required]
        public string Logradouro { get; set; } = string.Empty;

        [Required]
        public string Numero { get; set; } = string.Empty;

        [Required]
        public string Bairro { get; set; } = string.Empty;

        [Required]
        public string Cidade { get; set; } = string.Empty;

        [Required]
        public string CEP { get; set; } = string.Empty;

        [Required]
        public decimal Preco { get; set; }

        [Required]
        public int Quartos { get; set; }

        public string StatusPagamento { get; set; } = "Pendente";

        public string? Imagem { get; set; }

        [Required]
        public string UsuarioId { get; set; } // Vinculado ao Dono do Imóvel

        // ==========================================================
        // RELACIONAMENTO COM ENDEREÇO (ADICIONE ESTE BLOCO AQUI!)
        // ==========================================================
      

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    }
}