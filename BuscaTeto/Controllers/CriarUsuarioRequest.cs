namespace BuscaTeto.Models
{
    // Esta é apenas uma classe de transporte de dados (DTO)
    // Ela não deve ter conexão com o Entity Framework ou banco
    public class CriarUsuarioRequest
    {
        public string Telefone { get; set; } = string.Empty; // Adicionado para receber o telefone do front-end
        public int Id { get; set; } // Opcional, pode ser gerado automaticamente pelo banco
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string TipoUsuario { get; set; } = string.Empty; // Ex: "Cliente" ou "Anunciante"
    }
}