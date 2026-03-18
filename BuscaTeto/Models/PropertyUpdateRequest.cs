namespace BuscaTeto.Models
{
    public class AtualizarImovelRequest
    {
        public string? Titulo { get; set; }
        public string? Descricao { get; set; }
        public string? Cidade { get; set; }
        public decimal? Preco { get; set; }
        public int? Quartos { get; set; }
        public string? Imagem { get; set; }
    }
}
