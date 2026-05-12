using System;

namespace BuscaTeto.Models
{
    // Sub-objeto para receber os dados do endereço no cadastro do imóvel
    public record CriarEnderecoRequest(
        string Logradouro,
        string? Numero,
        string? Bairro,
        string Cidade,
        string? Estado,
        string? CEP
    );

    // O cadastro de imóvel agora exige o objeto Endereco aninhado
    public record CriarImovelRequest(
        string Titulo,
        string? Descricao,
        decimal Preco,
        int Quartos,
        string? Imagem,
        Guid UsuarioId,
        CriarEnderecoRequest Endereco
    );

    public record AtualizarImovelRequest(
        string? Titulo,
        string? Descricao,
        decimal? Preco,
        int? Quartos,
        string? Imagem
    );

    public record CriarUsuarioRequest(
        string Nome,
        string Email,
        string Senha,
        string? Telefone
    );

    public record AtualizarUsuarioRequest(
        string? Nome,
        string? Email,
        string? Senha,
        string? Telefone
    );
}