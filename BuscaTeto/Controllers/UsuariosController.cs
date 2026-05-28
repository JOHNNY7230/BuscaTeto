using BuscaTeto.Data;
using BuscaTeto.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BuscaTeto.Controllers
{
    [ApiController]
    [Route("api/usuarios")] // Isso faz a rota base ser automaticamente: api/usuarios
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        // ========================================================
        // ROTA: POST api/usuarios (CADASTRO)
        // ========================================================
        [HttpPost]
        public async Task<IActionResult> Cadastrar([FromBody] CriarUsuarioRequest request)
        {
            // A lógica de cadastro vai aqui
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var novoUsuario = new Usuario
            {
                Nome = request.Nome,
                Email = request.Email,
                Telefone = request.Telefone,
                TipoUsuario = request.TipoUsuario,
                Senha = request.Senha // Lembrete: futuramente é bom criptografar!
            };

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Created($"api/usuarios/{novoUsuario.Id}", new { mensagem = "Usuário cadastrado com sucesso!", id = novoUsuario.Id });
        }

        // ========================================================
        // 🔥 ROTA NOVA: POST api/usuarios/login (LOGIN)
        // ========================================================
        [HttpPost("login")]
        public async Task<IActionResult> FazerLogin([FromBody] LoginRequest request)
        {
            // 1. Verifica se os dados não vieram nulos ou vazios
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Senha))
            {
                return BadRequest(new { mensagem = "E-mail e senha são obrigatórios." });
            }

            // 2. Busca o usuário no banco de dados
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Senha == request.Senha);

            // 3. Se não achou (e-mail ou senha incorretos), retorna 401
            if (usuario == null)
            {
                return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });
            }

            // 4. Se achou, retorna 200 OK com os dados que o seu JS espera
            return Ok(new
            {
                id = usuario.Id,
                nome = usuario.Nome,
                tipoUsuario = usuario.TipoUsuario
            });
        }
    }

    // ========================================================
    // CLASSE PARA RECEBER OS DADOS DO LOGIN
    // (Você pode manter aqui no final ou mover para a pasta Models depois)
    // ========================================================
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Senha { get; set; }
    }
}