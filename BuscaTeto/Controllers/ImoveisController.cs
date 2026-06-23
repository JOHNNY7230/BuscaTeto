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

        // ==========================================
        // POST /imoveis — Cadastrar imóvel
        // ==========================================
        [HttpPost]
        public IActionResult Cadastrar([FromBody] CriarImovelRequest request)
        {
            try
            {
                var novoImovel = new Imovel
                {
                    Titulo = request.Titulo,
                    Descricao = request.Descricao ?? "Sem descrição",
                    Logradouro = request.Logradouro ?? "Não informado",
                    Numero = request.Numero ?? "S/N",
                    Bairro = request.Bairro ?? "Centro",
                    Cidade = request.Cidade ?? "Belo Horizonte",
                    CEP = request.Cep ?? "00000-000",
                    Preco = request.Preco,
                    Imagem = request.Imagem ?? "",
                    AnuncianteId = request.AnuncianteId, // ← campo principal
                    StatusImovel = "Disponivel",
                    CriadoEm = DateTime.UtcNow
                    // Quartos foi removido — não existe no banco
                    // StatusPagamento foi removido — não existe no banco
                    // UsuarioId foi removido — use AnuncianteId (são o mesmo)
                };

                var imovelCriado = _repositorio.Criar(novoImovel);
                return Created($"/imoveis/{imovelCriado.Id}", new
                {
                    mensagem = "Imóvel cadastrado com sucesso!",
                    id = imovelCriado.Id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao salvar no banco: {ex.Message}");
            }
        }

        // ==========================================
        // GET /imoveis — Listar todos
        // ==========================================
        [HttpGet]
        public IActionResult ListarTodos()
        {
            return Ok(_repositorio.ObterTodos());
        }

        // ==========================================
        // DELETE /imoveis/{id} — Remover imóvel
        // ==========================================
        [HttpDelete("{id}")]
        public IActionResult Remover(int id)
        {
            var sucesso = _repositorio.Remover(id);
            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });

            return Ok(new { mensagem = "Imóvel removido com sucesso!" });
        }

        // ==========================================
        // POST /imoveis/{id}/alugar
        // ==========================================
        [HttpPost("{id}/alugar")]
        public async Task<IActionResult> AlugarImovel(int id, [FromBody] MarcarAlugadoRequest request)
        {
            var sucesso = await _repositorio.MarcarComoAlugado(id, request.InquilinoId, request.DiaVencimento);
            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });

            return Ok(new { mensagem = "Imóvel marcado como alugado com sucesso!" });
        }

        // ==========================================
        // POST /imoveis/{id}/pagar
        // ⚠️ ATENÇÃO: StatusPagamento não está no banco ainda!
        // Este endpoint atualiza só o StatusImovel por enquanto.
        // Para persistir o pagamento de verdade, rode no MySQL:
        //   ALTER TABLE Imoveis ADD COLUMN StatusPagamento VARCHAR(50) NOT NULL DEFAULT 'Pendente';
        // ==========================================
        [HttpPost("{id}/pagar")]
        public IActionResult Pagar(int id)
        {
            var sucesso = _repositorio.PagarMensalidade(id);
            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });

            return Ok(new { mensagem = "Pagamento registrado com sucesso!" });
        }

        // ==========================================
        // GET /imoveis/financeiro/{usuarioId}
        // ==========================================
        [HttpGet("financeiro/{usuarioId}")]
        public async Task<IActionResult> ObterFinanceiro(int usuarioId)
        {
            var imoveis = await _repositorio.ObterImoveisAlugadosDoAnunciante(usuarioId);
            return Ok(imoveis);
        }
    }
}