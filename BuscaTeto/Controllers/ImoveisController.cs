using Microsoft.AspNetCore.Mvc;
using BuscaTeto.Models;
using BuscaTeto.Repositories;
using System;

namespace BuscaTeto.Controllers
{
    [ApiController]
    [Route("imoveis")] // Esta é a rota exata que o seu JavaScript está a chamar!
    public class ImoveisController : ControllerBase
    {
        private readonly IRepositorioImovel _repositorio;

        public ImoveisController(IRepositorioImovel repositorio)
        {
            _repositorio = repositorio;
        }

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

        [HttpGet]
        public IActionResult ListarTodos()
        {
            return Ok(_repositorio.ObterTodos());
        }

        // ==========================================
        // NOVOS MÉTODOS: CONTROLE FINANCEIRO / ALUGUEL
        // ==========================================

        [HttpPut("{id}/alugar")]
        public IActionResult AlugarImovel(int id, [FromBody] MarcarAlugadoRequest request)
        {
            var sucesso = _repositorio.MarcarComoAlugado(id, request.InquilinoId, request.DiaVencimento);

            if (!sucesso)
                return NotFound(new { mensagem = "Imóvel não encontrado." });

            return Ok(new { mensagem = "Imóvel marcado como alugado com sucesso!" });
        }

        [HttpGet("financeiro/{usuarioId}")]
        public IActionResult ObterFinanceiro(string usuarioId)
        {
            // Busca os imóveis alugados vinculados ao ID do anunciante (UsuarioId)
            var imoveis = _repositorio.ObterImoveisAlugadosDoAnunciante(usuarioId);
            return Ok(imoveis);
        }
    }
}