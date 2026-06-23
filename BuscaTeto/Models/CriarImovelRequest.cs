namespace BuscaTeto.Models
{
    public class CriarImovelRequest
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }

        // Endereço
        public string? Logradouro { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Cep { get; set; }

        public decimal Preco { get; set; }
        public string? Imagem { get; set; }

        // UsuarioId e AnuncianteId chegam com o mesmo valor do JS
        // Só AnuncianteId é salvo no banco
        public int AnuncianteId { get; set; }
        public int UsuarioId { get; set; } // recebido do JS mas não usado no INSERT

        // Quartos removido — não existe no banco
        // public int Quartos { get; set; }
    }

    namespace BuscaTeto.Models
    {
        public class CriarImovelRequest
        {
            public string Titulo { get; set; } = string.Empty;
            public string? Descricao { get; set; }
            public string? Logradouro { get; set; }
            public string? Numero { get; set; }
            public string? Bairro { get; set; }
            public string? Cidade { get; set; }
            public string? Cep { get; set; }
            public decimal Preco { get; set; }
            public string? Imagem { get; set; }
            public int AnuncianteId { get; set; }
            public int UsuarioId { get; set; }
        }

        // ❌ APAGA ESSE BLOCO ABAIXO — já existe em outro arquivo
        // public class MarcarAlugadoRequest { ... }
    }
}