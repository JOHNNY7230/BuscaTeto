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
    }
}