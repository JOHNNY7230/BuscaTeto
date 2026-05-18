using System;

namespace BuscaTeto.Models
{
    public record CriarImovelRequest(
        string Titulo,
        string Descricao,
        string Logradouro,
        string Numero,
        string? Bairro,
        string Cidade,
        string CEP,
        decimal Preco,
        int Quartos,
        string Imagem,
        Guid UsuarioId
    );
}