using Microsoft.AspNetCore.Mvc;
using BuscaTeto.Models;
using BuscaTeto.Repositories;
using System;
using System.Threading.Tasks;

namespace BuscaTeto.Controllers
{
    [ApiController]
    [Route("imoveis")]
    public class ImoveisController : ControllerBase
    {
        private readonly IRepositorioImovel _repositorio;

        public ImoveisController(IRepositorioImovel repositorio)
        {
            _repositorio = repositorio;
        }

        // POST /imoveis — Cadastrar imóvel
        [HttpPost]
        public IActionResult Cadastrar([FromBody] CriarImovelRequest request)
        {
            try
            {
                var novoImovel = new Imovel
                {
                    StatusPagamento = "Pendente",
                    Titulo = request.Titulo,
                    Descricao = request.Descricao ?? "Sem descrição",
                    Logradouro = request.Logradouro ?? "Não informado",
                    Numero = request.Numero ?? "S/N",
                    Bairro = request.Bairro ?? "Centro",
                    Cidade = request.Cidade ?? "Belo Horizonte",
                    CEP = request.Cep ?? "00000-000",
                    Preco = request.Preco,
                    Quartos = request.Quartos,
                    Imagem = request.Imagem ?? "",
                    UsuarioId = request.UsuarioId,
                    AnuncianteId = request.AnuncianteId,
                    CriadoEm = DateTime.UtcNow
                };
                var imovelCriado = _repositorio.Criar(novoImovel);
                return Created($"/imoveis/{imovelCriado.Id}", new { mensagem = "Imóvel cadastrado com sucesso!", id = imovelCriado.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao salvar no banco: {ex.Message}");
            }
        }

        // GET /imoveis — Listar todos
        [HttpGet]
        public IActionResult ListarTodos()
        {
            return Ok(_repositorio.ObterTodos());
        }

        // DELETE /imoveis/{id} — Remover imóvel ✅ NOVO
        [HttpDelete("{id}")]
        public IActionResult Remover(int id)
        {
            var sucesso = _repositorio.Remover(id);
            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });
            return Ok(new { mensagem = "Imóvel removido com sucesso!" });
        }

        // POST /imoveis/{id}/alugar — ✅ Mudado de PUT para POST
        [HttpPost("{id}/alugar")]
        public async Task<IActionResult> AlugarImovel(int id, [FromBody] MarcarAlugadoRequest request)
        {
            var sucesso = await _repositorio.MarcarComoAlugado(id, request.InquilinoId, request.DiaVencimento);
            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });
            return Ok(new { mensagem = "Imóvel marcado como alugado com sucesso!" });
        }

        // POST /imoveis/{id}/pagar — ✅ Mudado de PUT para POST
        [HttpPost("{id}/pagar")]
        public IActionResult Pagar(int id)
        {
            var sucesso = _repositorio.PagarMensalidade(id);
            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });
            return Ok(new { mensagem = "Pagamento registrado com sucesso!" });
        }

        // GET /imoveis/financeiro/{usuarioId} — Financeiro por anunciante
        [HttpGet("financeiro/{usuarioId}")]
        public async Task<IActionResult> ObterFinanceiro(int usuarioId)
        {
            var imoveis = await _repositorio.ObterImoveisAlugadosDoAnunciante(usuarioId);
            return Ok(imoveis);
        }
    }
}