using System;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        public Guid Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string Cidade { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Quartos { get; set; }
        public string? Imagem { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
