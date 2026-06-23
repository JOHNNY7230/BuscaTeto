using BuscaTeto.Data;
using BuscaTeto.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BuscaTeto.Repositories
{
    public class RepositorioImovel : IRepositorioImovel
    {
        private readonly AppDbContext _context;

        public RepositorioImovel(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // LISTAR TODOS
        // ==========================================
        public IEnumerable<Imovel> ObterTodos()
        {
            return _context.Imoveis.ToList();
        }

        // ==========================================
        // BUSCAR POR ID
        // ==========================================
        public Imovel? Obter(int id)
        {
            return _context.Imoveis.FirstOrDefault(i => i.Id == id);
        }

        // ==========================================
        // CRIAR
        // ==========================================
        public Imovel Criar(Imovel imovel)
        {
            _context.Imoveis.Add(imovel);
            _context.SaveChanges();
            return imovel;
        }

        // ==========================================
        // ATUALIZAR
        // ==========================================
        public bool Atualizar(int id, AtualizarImovelRequest atualizar)
        {
            var imovelExistente = _context.Imoveis.FirstOrDefault(i => i.Id == id);
            if (imovelExistente == null) return false;

            imovelExistente.Titulo = atualizar.Titulo;
            imovelExistente.Preco = atualizar.Preco;

            _context.SaveChanges();
            return true;
        }

        // ==========================================
        // REMOVER
        // ==========================================
        public bool Remover(int id)
        {
            var imovel = _context.Imoveis.FirstOrDefault(i => i.Id == id);
            if (imovel == null) return false;

            _context.Imoveis.Remove(imovel);
            _context.SaveChanges();
            return true;
        }

        // ==========================================
        // BUSCAR COM FILTROS
        // Quartos foi removido do banco — filtro por quartosMin removido também
        // ==========================================
        public IEnumerable<Imovel> Buscar(string? cidade, decimal? precoMin, decimal? precoMax)
        {
            var query = _context.Imoveis.AsQueryable();

            if (!string.IsNullOrEmpty(cidade))
                query = query.Where(i => i.Cidade != null && i.Cidade.Contains(cidade));

            if (precoMin.HasValue)
                query = query.Where(i => i.Preco >= precoMin.Value);

            if (precoMax.HasValue)
                query = query.Where(i => i.Preco <= precoMax.Value);

            return query.ToList();
        }

        // ==========================================
        // MARCAR COMO ALUGADO
        // ==========================================
        public async Task<bool> MarcarComoAlugado(int imovelId, int inquilinoId, int diaVencimento)
        {
            var imovel = _context.Imoveis.FirstOrDefault(i => i.Id == imovelId);
            if (imovel == null) return false;

            imovel.StatusImovel = "Alugado";
            imovel.InquilinoId = inquilinoId;
            imovel.DiaVencimento = diaVencimento;
            imovel.StatusPagamento = "Pendente";

            await _context.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // PAGAR MENSALIDADE
        // ==========================================
        public bool PagarMensalidade(int imovelId)
        {
            var imovel = _context.Imoveis.FirstOrDefault(i => i.Id == imovelId);
            if (imovel == null) return false;

            imovel.StatusPagamento = "Pago";

            _context.SaveChanges();
            return true;
        }

        // ==========================================
        // IMÓVEIS ALUGADOS DE UM ANUNCIANTE
        // Overload com string foi removido — use só int
        // ==========================================
        public async Task<IEnumerable<Imovel>> ObterImoveisAlugadosDoAnunciante(int usuarioId)
        {
            return await Task.FromResult(
                _context.Imoveis
                    .Where(i => i.StatusImovel == "Alugado" && i.AnuncianteId == usuarioId)
                    .ToList()
            );
        }
    }
}