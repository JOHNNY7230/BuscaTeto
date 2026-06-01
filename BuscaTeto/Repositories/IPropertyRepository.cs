using System;
using System.Collections.Generic;
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
        IEnumerable<Imovel> ObterPorUsuario(string usuarioId); // Assinatura adicionada para o filtro do anunciante
    }
}