namespace BuscaTeto.Models
{
    public record CriarUsuarioRequest(string Nome, string Email, string Senha, string? Telefone);
}