using BuscaTeto.Data;
using BuscaTeto.Models;
using System.Collections.Generic;
using System.Linq;

namespace BuscaTeto.Repositories
{
    public class RepositorioImovel : IRepositorioImovel
    {
        private readonly AppDbContext _context;

        // Construtor injetando o contexto do MySQL
        public RepositorioImovel(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Imovel> ObterTodos()
        {
            return _context.Imoveis.ToList();
        }

        public Imovel? Obter(int id)
        {
            return _context.Imoveis.FirstOrDefault(i => i.Id == id);
        }

        public Imovel Criar(Imovel imovel)
        {
            _context.Imoveis.Add(imovel);
            _context.SaveChanges();
            return imovel;
        }

        public bool Atualizar(int id, AtualizarImovelRequest atualizar)
        {
            var imovelExistente = _context.Imoveis.FirstOrDefault(i => i.Id == id);
            if (imovelExistente == null) return false;

            imovelExistente.Titulo = atualizar.Titulo;
            imovelExistente.Preco = atualizar.Preco;

            _context.SaveChanges();
            return true;
        }

        public bool Remover(int id)
        {
            var imovel = _context.Imoveis.FirstOrDefault(i => i.Id == id);
            if (imovel == null) return false;

            _context.Imoveis.Remove(imovel);
            _context.SaveChanges();
            return true;
        }

        public IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin)
        {
            var query = _context.Imoveis.AsQueryable();

            if (!string.IsNullOrEmpty(cidade))
                query = query.Where(i => i.Cidade != null && i.Cidade.Contains(cidade));

            if (precoMin.HasValue)
                query = query.Where(i => i.Preco >= precoMin.Value);

            if (precoMax.HasValue)
                query = query.Where(i => i.Preco <= precoMax.Value);

            if (quartosMin.HasValue)
                query = query.Where(i => i.Quartos >= quartosMin.Value);

            return query.ToList();
        }

        // ==========================================
        // NOVOS MÉTODOS: CONTROLE FINANCEIRO / ALUGUEL
        // ==========================================

        public bool MarcarComoAlugado(int imovelId, int inquilinoId, int diaVencimento)
        {
            var imovel = _context.Imoveis.FirstOrDefault(i => i.Id == imovelId);
            if (imovel == null) return false;

            imovel.StatusImovel = "Alugado";
            imovel.InquilinoId = inquilinoId;
            imovel.DiaVencimento = diaVencimento;
            imovel.StatusPagamento = "Pendente";

            _context.SaveChanges();
            return true;
        }

        public IEnumerable<Imovel> ObterImoveisAlugadosDoAnunciante(string anuncianteId)
        {
            // Busca apenas os imóveis alugados daquele anunciante específico
            return _context.Imoveis
                .Where(i => i.UsuarioId == anuncianteId && i.StatusImovel == "Alugado")
                .ToList();
        }
        public bool PagarMensalidade(int imovelId)
        {
            var imovel = _context.Imoveis.FirstOrDefault(i => i.Id == imovelId);
            if (imovel == null) return false;

            // Muda o status no banco de dados real
            imovel.StatusPagamento = "Pago";

            _context.SaveChanges();
            return true;
        }
    }
}