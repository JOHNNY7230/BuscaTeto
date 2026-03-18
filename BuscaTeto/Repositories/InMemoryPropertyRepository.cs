using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using BuscaTeto.Models;

namespace BuscaTeto.Repositories
{
    public class InMemoryPropertyRepository : IRepositorioImovel
    {
        private readonly ConcurrentDictionary<Guid, Imovel> _store = new();

        public InMemoryPropertyRepository()
        {
            // dados iniciais
            var p1 = new Imovel
            {
                Id = Guid.NewGuid(),
                Titulo = "Apartamento aconchegante",
                Descricao = "Apartamento 2 quartos, próximo ao metrô",
                Cidade = "São Paulo",
                Preco = 550000m,
                Quartos = 2,
                Imagem = "https://images.unsplash.com/photo-1560184897-6d2c7b9d6fbb?w=800&q=80",
                CriadoEm = DateTime.UtcNow
            };

            var p2 = new Imovel
            {
                Id = Guid.NewGuid(),
                Titulo = "Casa espaçosa",
                Descricao = "Casa com quintal e 4 quartos",
                Cidade = "Campinas",
                Preco = 950000m,
                Quartos = 4,
                Imagem = "https://images.unsplash.com/photo-1572120360610-d971b9b3f3e5?w=800&q=80",
                CriadoEm = DateTime.UtcNow
            };

            _store[p1.Id] = p1;
            _store[p2.Id] = p2;
        }

        public Imovel Criar(Imovel imovel)
        {
            _store[imovel.Id] = imovel;
            return imovel;
        }

        public bool Remover(Guid id)
        {
            return _store.TryRemove(id, out _);
        }

        public Imovel? Obter(Guid id)
        {
            _store.TryGetValue(id, out var prop);
            return prop;
        }

        public IEnumerable<Imovel> ObterTodos()
        {
            return _store.Values.OrderByDescending(p => p.CriadoEm);
        }

        public IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin)
        {
            var query = _store.Values.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(cidade))
                query = query.Where(p => p.Cidade.Equals(cidade, System.StringComparison.OrdinalIgnoreCase));
            if (precoMin.HasValue)
                query = query.Where(p => p.Preco >= precoMin.Value);
            if (precoMax.HasValue)
                query = query.Where(p => p.Preco <= precoMax.Value);
            if (quartosMin.HasValue)
                query = query.Where(p => p.Quartos >= quartosMin.Value);
            return query.OrderByDescending(p => p.CriadoEm);
        }

        public bool Atualizar(Guid id, AtualizarImovelRequest atualizar)
        {
            return _store.AddOrUpdate(id, key => null!, (key, existing) =>
            {
                if (existing == null) return null!;
                if (!string.IsNullOrWhiteSpace(atualizar.Titulo)) existing.Titulo = atualizar.Titulo!;
                if (atualizar.Descricao != null) existing.Descricao = atualizar.Descricao;
                if (!string.IsNullOrWhiteSpace(atualizar.Cidade)) existing.Cidade = atualizar.Cidade!;
                if (atualizar.Preco.HasValue) existing.Preco = atualizar.Preco.Value;
                if (atualizar.Quartos.HasValue) existing.Quartos = atualizar.Quartos.Value;
                return existing;
            }) != null;
        }
    }
}
