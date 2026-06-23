using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        // ==========================================
        // CAMPOS DO BANCO (batem 100% com o SQL)
        // ==========================================

        public int Id { get; set; }

        [Required]
        public string Titulo { get; set; } = string.Empty;

        public string? Descricao { get; set; }

        // --- Endereço inline ---
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

        // --- Preço e Imagem ---
        [Required]
        public decimal Preco { get; set; }

        public string? Imagem { get; set; }

        // --- Dono do imóvel (campo principal no banco) ---
        [Required]
        public int AnuncianteId { get; set; }

        // --- Controle de aluguel ---
        public string StatusImovel { get; set; } = "Disponivel";
        public int? InquilinoId { get; set; }
        public int? DiaVencimento { get; set; }

        // --- Endereço (tabela separada, opcional) ---
        public string? EnderecoId { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        // ==========================================
        // CAMPOS VIRTUAIS (NÃO SALVOS NO BANCO)
        // ==========================================

        // Alias para o JS continuar filtrando por "usuarioId" sem quebrar
        [NotMapped]
        public int UsuarioId => AnuncianteId;
        public string StatusPagamento { get; set; } = "Pendente";

        // Quartos foi removido do banco — se precisar no futuro, faz um ALTER TABLE
        // [NotMapped]
        // public int Quartos { get; set; } = 1;
    }
}