using System;

namespace BuscaTeto.Models
{
    public class Imovel
    {
        public Guid Id { get; set; }
        public string Titulo { get; set; }
        public string Descricao { get; set; }

        // Propriedades de endereço
        public string Logradouro { get; set; }
        public string Numero { get; set; }
        public string Bairro { get; set; }
        public string Cidade { get; set; }
        public string CEP { get; set; }

        // Detalhes do imóvel
        public decimal Preco { get; set; }
        public int Quartos { get; set; }
        public string Imagem { get; set; }

        // Relacionamento com o Proprietário
        public Guid UsuarioId { get; set; }

        // Controlo de data
        public DateTime CriadoEm { get; set; }
    }
}