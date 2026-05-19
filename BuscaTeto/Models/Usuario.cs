using System.ComponentModel.DataAnnotations;

namespace BuscaTeto.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Telefone { get; set; } = string.Empty;

        // --- ADICIONE ESTA LINHA PARA A TABELA DO BANCO ---
        [Required]
        public string TipoUsuario { get; set; } = string.Empty;

        [Required]
        public string Senha { get; set; } = string.Empty;
    }
}