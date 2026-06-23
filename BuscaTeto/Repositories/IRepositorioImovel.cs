using System.Collections.Generic;
using System.Threading.Tasks;
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

        // quartosMin removido — Quartos não existe no banco
        IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax);

        bool PagarMensalidade(int imovelId);
        Task<bool> MarcarComoAlugado(int imovelId, int inquilinoId, int diaVencimento);

        // Overload com string removido — use só int
        Task<IEnumerable<Imovel>> ObterImoveisAlugadosDoAnunciante(int usuarioId);
    }
}