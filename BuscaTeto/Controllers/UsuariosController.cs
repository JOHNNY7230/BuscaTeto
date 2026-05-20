using Microsoft.AspNetCore.Mvc;
using BuscaTeto.Models;
using BuscaTeto.Data;
using System;
using System.Threading.Tasks;
namespace BuscaTeto.Controllers
{
    [ApiController]
    [Route("usuarios")] // Define a rota base do controller para /usuarios
    public class UsuarioController : ControllerBase
    {
        // Se o seu projeto já usa uma injeção de dependência para o banco ou repositório,
        // você pode manter o construtor aqui. Exemplo:
        // private readonly AppDbContext _context;
        // public UsuarioController(AppDbContext context) { _context = context; }

        /// <summary>
        /// Rota para cadastrar um novo usuário (Cliente ou Anunciante)
        /// POST: /usuarios
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Cadastrar([FromBody] CriarUsuarioRequest request)
        {
            // 1. Valida se o modelo recebido do Front-end é válido conforme as anotações [Required]
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // 2. Mapeia os dados do Request (DTO) para a entidade Usuario
                var novoUsuario = new Usuario
                {
                    Nome = request.Nome,
                    Email = request.Email,
                    Telefone = request.Telefone,
                    TipoUsuario = request.TipoUsuario, // Vincula a escolha do select do front
                    Senha = request.Senha // Dica: Criptografe a senha antes de salvar em produção
                };

                // 3. LÓGICA DE SALVAMENTO NO BANCO
                // Se estiver usando o Entity Framework:
                // _context.Usuarios.Add(novoUsuario);
                // await _context.SaveChangesAsync();

                // Log para monitorar no console de Depuração do Visual Studio
                System.Diagnostics.Debug.WriteLine($"Sucesso: {novoUsuario.Nome} registrado como {novoUsuario.TipoUsuario}");

                return Ok(new { mensagem = "Usuário cadastrado com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao salvar no MySQL: {ex.Message}");
            }
        }

        /// <summary>
        /// Rota para autenticação de usuários
        /// POST: /usuarios/login
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Valida se e-mail e senha foram enviados
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // 2. BUSCA NO BANCO DE DADOS
                // Exemplo de busca real com Entity Framework:
                // var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

                // 🛠️ MODO SIMULAÇÃO (Remova/Comente estas linhas quando ligar o banco real):
                Usuario? usuario = null;
                if (request.Email == "teste@busca.com" && request.Senha == "123456")
                {
                    usuario = new Usuario
                    {
                        // 👇 ALTERADO DE 1 PARA Guid.NewGuid() AQUI 👇
                        Id = Guid.NewGuid(),
                        Nome = "Luiz",
                        Email = "teste@busca.com",
                        TipoUsuario = "Anunciante",
                        Senha = "123456"
                    };
                }
                // ----------------------------------------------------------------------

                // 3. VERIFICAÇÃO DE CREDENCIAIS
                if (usuario == null || usuario.Senha != request.Senha)
                {
                    return Unauthorized(new { mensagem = "E-mail ou senha incorretos." });
                }

                // 4. RETORNO DE SUCESSO
                // Devolve as informações necessárias para o front-end configurar o sessionStorage
                return Ok(new
                {
                    id = usuario.Id,
                    nome = usuario.Nome,
                    email = usuario.Email,
                    tipoUsuario = usuario.TipoUsuario // Crucial para o redirecionamento de páginas
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
            }
        }
    }
}