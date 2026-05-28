namespace BuscaTeto.Models
{
    public class CriarImovelRequest
    {
        public string Titulo { get; set; }
        public string Descricao { get; set; }
        public decimal Preco { get; set; }
        public int Quartos { get; set; }
        public string Tipo { get; set; }
        public string Imagem { get; set; }

        // 🔥 A MÁGICA ESTÁ AQUI: O C# agora sabe que o ID é um número inteiro!
        public string UsuarioId { get; set; }

        public string Logradouro { get; set; }
        public string Numero { get; set; }
        public string Bairro { get; set; }
        public string Cidade { get; set; }
        public string Cep { get; set; }
    }
}