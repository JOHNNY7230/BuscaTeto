using System;
using System.Collections.Generic;
using BuscaTeto.Models;

namespace BuscaTeto.Repositories
{
    public interface IRepositorioImovel
    {
        IEnumerable<Imovel> ObterTodos();
        Imovel? Obter(Guid id);
        Imovel Criar(Imovel imovel);
        bool Atualizar(Guid id, AtualizarImovelRequest atualizar);
        bool Remover(Guid id);
        IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin);
    }
}
