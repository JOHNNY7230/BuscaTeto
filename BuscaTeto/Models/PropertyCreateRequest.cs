namespace BuscaTeto.Models
{
    public class CriarImovelRequest
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public string Cidade { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Quartos { get; set; }
        public string? Imagem { get; set; }
    }
}
