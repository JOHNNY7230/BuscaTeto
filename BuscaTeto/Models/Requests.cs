using System;

namespace BuscaTeto.Models
{
    // Define as regras de tipo de utilizador
    public enum TipoUsuario
    {
        Cliente = 0,
        Proprietario = 1
    }

    public class CriarUsuarioRequest
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }
        public string Telefone { get; set; }
        public TipoUsuario Tipo { get; set; }
    }

    public class AtualizarUsuarioRequest
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }
        public string Telefone { get; set; }
    }

    public class CriarImovelRequest
    {
        public string Titulo { get; set; }
        public string Descricao { get; set; }
        public string Logradouro { get; set; }
        public string Numero { get; set; }
        public string Bairro { get; set; }
        public string Cidade { get; set; }
        public string CEP { get; set; }
        public decimal Preco { get; set; }
        public int Quartos { get; set; }
        public string Imagem { get; set; }
        public Guid UsuarioId { get; set; }
    }

    public class AtualizarImovelRequest
    {
        public string Titulo { get; set; }
        public string Descricao { get; set; }
        public string Cidade { get; set; }
        public decimal? Preco { get; set; }
        public int? Quartos { get; set; }
        public string Imagem { get; set; }
    }
}