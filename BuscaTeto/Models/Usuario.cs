namespace BuscaTeto.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Senha { get; set; }

        // Esta linha diz se o utilizador é Cliente ou Proprietário
        public TipoUsuario Tipo { get; set; }
    }
}