# Bases do projeto BuscaTeto

Este documento resume as bases técnicas do backend e frontend simples que foram implementados no projeto BuscaTeto.

## Objetivo
Criar um back-end mínimo para listar, buscar, criar e (inicialmente) remover imóveis, junto com um frontend básico para visualização.

## Arquitetura
- Aplicação ASP.NET Core Minimal API (.NET 10) — entradas definidas diretamente em `Program.cs` usando `app.MapGet/MapPost/...`.
- Repositório em memória (`InMemoryPropertyRepository`) para facilidade de desenvolvimento e testes.
- Frontend estático (HTML + JS) servido pela pasta `wwwroot`.

## Endpoints principais
- `GET /imoveis` — lista e filtra por `cidade`, `precoMin`, `precoMax`, `quartosMin`.
- `GET /imoveis/{id}` — obtém detalhes de um imóvel.
- `POST /imoveis` — cria um novo imóvel (aceita JSON com campos como `titulo`, `descricao`, `cidade`, `preco`, `quartos`, `imagem`).
- `PUT /imoveis/{id}` — atualiza um imóvel existente.
- A rota `DELETE /imoveis/{id}` foi removida por segurança / pedido.

## Modelos (resumido)
- `Imovel` (model): `Id`, `Titulo`, `Descricao`, `Cidade`, `Preco`, `Quartos`, `Imagem`, `CriadoEm`.
- `CriarImovelRequest`: campos para criar (inclui `Imagem` como URL).
- `AtualizarImovelRequest`: campos opcionais para atualização.

## Repositório
- Interface `IRepositorioImovel` com métodos em português (`Obter`, `Criar`, `Atualizar`, `Remover`, `Buscar`).
- Implementação `InMemoryPropertyRepository` usa `ConcurrentDictionary<Guid, Imovel>` e contém dados de seed com URLs de imagens públicas.
- Vantagem: simplicidade e zero dependências externas. Desvantagem: dados não persistem entre execuções.

## Frontend
- `wwwroot/index.html` fornece uma UI mínima para:
  - Buscar e filtrar imóveis.
  - Criar novos imóveis (a imagem é fornecida por URL).
  - Originalmente havia botão de exclusão; a rota DELETE foi removida do backend, mas o frontend ainda continha o botão — pode ser atualizado ou removido.

## Como rodar
1. No diretório do projeto (`BuscaTeto`), executar:
   ```
   dotnet run
   ```
2. Abrir no navegador a URL informada pelo `dotnet run` (por padrão http://localhost:5000).

## Segurança e produção
- Atualmente não há autenticação, autorização, validação forte nem proteção contra CSRF.
- Para produção, recomenda-se:
  - Adicionar autenticação (JWT, Identity) e autorizar rotas sensíveis.
  - Validar e sanitizar entradas no servidor (DataAnnotations / FluentValidation).
  - Utilizar HTTPS e políticas CORS apropriadas.
  - Registrar e monitorar (logs, métricas).

## Persistência e escopo futuro
- Trocar o repositório em memória por uma camada persistente (EF Core com SQLite, PostgreSQL, etc.).
- Adicionar paginação nos endpoints de listagem.
- Reabilitar upload de imagens (armazenar em blob storage / filesystem) ou continuar usando URLs externas.

## Conversão para PDF
Se desejar um PDF deste documento localmente, duas opções comuns:
- Usando `pandoc`:
  ```bash
  pandoc Docs/Bases-BuscaTeto.md -o Docs/Bases-BuscaTeto.pdf
  ```
- Usando um editor que exporte Markdown para PDF (VS Code + extensão, ou Impressão para PDF).

---

Se quiser, eu posso:
- Gerar diretamente um PDF no workspace (preciso usar uma ferramenta instalada no ambiente ou produzir o PDF manualmente),
- Atualizar o frontend para mostrar imagens e remover o botão de excluir,
- Implementar persistência com SQLite e EF Core.

Qual próximo passo prefere?
