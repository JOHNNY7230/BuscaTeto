using System;

namespace BuscaTeto.Models
{
    public record CriarEnderecoRequest(string Logradouro, string? Numero, string? Bairro, string Cidade, string? Estado, string? CEP);

    // O Request de Imóvel agora recebe o objeto de endereço embutido
    public record CriarImovelRequest(string Titulo, string? Descricao, decimal Preco, int Quartos, string? Imagem, Guid UsuarioId, CriarEnderecoRequest Endereco);

    public record AtualizarImovelRequest(string? Titulo, string? Descricao, decimal? Preco, int? Quartos, string? Imagem);

    public record CriarUsuarioRequest(string Nome, string Email, string Senha, string? Telefone);
    public record AtualizarUsuarioRequest(string? Nome, string? Email, string? Senha, string? Telefone);
}