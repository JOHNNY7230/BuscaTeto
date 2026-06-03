using System.Collections.Generic;
using BuscaTeto.Models;

namespace BuscaTeto.Repositories
{
    public record AtualizarImovelRequest(string Titulo, decimal Preco);

    public interface IRepositorioImovel
    {
        // Adicione estas duas linhas
    
        IEnumerable<Imovel> ObterTodos();
        Imovel? Obter(int id);
        Imovel Criar(Imovel imovel);
        bool Atualizar(int id, AtualizarImovelRequest atualizar);
        bool Remover(int id);
        IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin);
        bool MarcarComoAlugado(int imovelId, int inquilinoId, int diaVencimento);
        IEnumerable<Imovel> ObterImoveisAlugadosDoAnunciante(string usuarioId);
    }
}