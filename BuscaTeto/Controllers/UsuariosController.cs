using Microsoft.AspNetCore.Mvc;
using BuscaTeto.Models;

namespace BuscaTeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        [HttpPost]
        public IActionResult CadastrarUsuario([FromBody] CriarUsuarioRequest request)
        {
            // Regra de Negócio: O sistema não pode aceitar um tipo que não exista
            if (request.Tipo != TipoUsuario.Cliente && request.Tipo != TipoUsuario.Proprietario)
            {
                return BadRequest("Tipo de usuário inválido. Escolha 0 para Cliente ou 1 para Proprietário.");
            }

            // Exemplo de aplicação da regra de negócio:
            if (request.Tipo == TipoUsuario.Proprietario)
            {
                // Se for proprietário, você pode adicionar lógicas extras no futuro,
                // como exigir CNPJ, telefone obrigatório, etc.
            }

            // Aqui você chama o seu repositório para salvar no banco de dados!
            // Exemplo: _repositorio.SalvarUsuario(request);

            return Ok(new { Mensagem = $"Registrado com sucesso! Perfil: {request.Tipo}" });
        }
    }
}