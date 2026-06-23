using System.Collections.Generic;
using System.Threading.Tasks; // ✅ necessário para Task
using BuscaTeto.Models;

namespace BuscaTeto.Repositories
{
    public record AtualizarImovelRequest(string Titulo, decimal Preco);

    public interface IRepositorioImovel
    {
        IEnumerable<Imovel> ObterTodos();
        Imovel? Obter(int id);
        Imovel Criar(Imovel imovel);
        bool Atualizar(int id, AtualizarImovelRequest atualizar);
        bool Remover(int id);
        IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin);
        IEnumerable<Imovel> ObterImoveisAlugadosDoAnunciante(string usuarioId);
        bool PagarMensalidade(int imovelId);
        Task<bool> MarcarComoAlugado(int imovelId, int inquilinoId, int diaVencimento);
        Task<IEnumerable<Imovel>> ObterImoveisAlugadosDoAnunciante(int UsuarioId);
    }
}