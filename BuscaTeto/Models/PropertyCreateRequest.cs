using System;

namespace BuscaTeto.Models
{
    public record CriarImovelRequest(string Titulo, string Descricao, string Cidade, decimal Preco, int Quartos, string Imagem, Guid UsuarioId);
}