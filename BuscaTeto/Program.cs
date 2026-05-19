using System;
using System.Linq;
using BuscaTeto.Repositories;
using BuscaTeto.Models;
using BuscaTeto.Data;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Força a API a escutar numa porta HTTP específica e limpa
builder.WebHost.UseUrls("http://localhost:5005");

// 1. Adicionar os serviços necessários
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔥 ESSENCIAL: Ativa a leitura do seu arquivo UsuarioController.cs!
builder.Services.AddControllers();

// Configuração da Base de Dados (Entity Framework Core com MySQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 30)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        )
    ));

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

// 2. Ativar a interface visual do Swagger
app.UseSwagger();
app.UseSwaggerUI();

// 3. Configura o login.html como a página inicial padrão do sistema
var options = new DefaultFilesOptions();
options.DefaultFileNames.Clear();
options.DefaultFileNames.Add("login.html");
app.UseDefaultFiles(options);

// Permite ler arquivos da pasta wwwroot
app.UseStaticFiles();

// Redireciona a raiz direto para o login
app.MapGet("/", () => Results.Redirect("/login.html"));

// 🔥 ESSENCIAL: Mapeia as rotas do UsuarioController
app.MapControllers();

// =======================================================================
// ROTAS DE IMÓVEIS (MINIMAL APIS) COM LÓGICA COMPLEXA DE SEGURANÇA
// =======================================================================

// 1. LISTAR IMÓVEIS COM FILTROS
app.MapGet("/imoveis", async (AppDbContext db, string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin) =>
{
    var query = db.Imoveis.AsQueryable();

    if (!string.IsNullOrWhiteSpace(cidade))
        query = query.Where(i => i.Cidade.Contains(cidade));
    if (precoMin.HasValue)
        query = query.Where(i => i.Preco >= precoMin.Value);
    if (precoMax.HasValue)
        query = query.Where(i => i.Preco <= precoMax.Value);
    if (quartosMin.HasValue)
        query = query.Where(i => i.Quartos >= quartosMin.Value);

    var resultados = await query.ToListAsync();
    return Results.Ok(resultados);
});

// 2. BUSCAR UM IMÓVEL PELO ID (INT) - Corrigido para evitar erro de Guid
// Corrigido de Guid id para int id
app.MapGet("/imoveis/{id}", async (AppDbContext db, int id) =>
{
    var imovel = await db.Imoveis.FindAsync(id);
    return imovel is null ? Results.NotFound() : Results.Ok(imovel);
});

// 3. CADASTRAR IMÓVEL COM REGRA DE NEGÓCIO COMPLEXA (Controle de Perfil)
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    // REGRA DE NEGÓCIO 1: Verifica se o usuário que está tentando associar o imóvel realmente existe
    var usuarioDono = await db.Usuarios.FindAsync(criar.UsuarioId);
    if (usuarioDono == null)
    {
        return Results.BadRequest(new { mensagem = "Operação negada: O usuário vinculado a este cadastro não existe no sistema." });
    }

    // REGRA DE NEGÓCIO 2: Apenas contas cadastradas como 'Anunciante' podem postar imóveis
    if (usuarioDono.TipoUsuario != "Anunciante")
    {
        return Results.Json(new { mensagem = "Acesso Negado: Apenas contas do tipo 'Anunciante' possuem permissão para publicar imóveis." }, statusCode: 403);
    }

    // Se passar pelas validações, o objeto é construído e salvo no MySQL Workbench local
    var criado = new Imovel
    {
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Logradouro = criar.Logradouro,
        Numero = criar.Numero,
        Bairro = criar.Bairro,
        Cidade = criar.Cidade,
        CEP = criar.CEP,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        UsuarioId = criar.UsuarioId,
        CriadoEm = DateTime.UtcNow
    };

    db.Imoveis.Add(criado);
    await db.SaveChangesAsync();

    return Results.Created($"/imoveis/{criado.Id}", new { mensagem = "Imóvel cadastrado com sucesso!", id = criado.Id, imovel = criado });
});

// 4. ATUALIZAR UM IMÓVEL EXISTENTE COM PROTEÇÃO
app.MapPut("/imoveis/{id}", async (AppDbContext db, int id, AtualizarImovelRequest atualizar) =>
{
    var imovel = await db.Imoveis.FindAsync(id);
    if (imovel is null) return Results.NotFound(new { mensagem = "Imóvel não encontrado." });

    // Atualização segura: evita sobrescrever dados por campos nulos do formulário
    if (!string.IsNullOrWhiteSpace(atualizar.Titulo)) imovel.Titulo = atualizar.Titulo;
    if (!string.IsNullOrWhiteSpace(atualizar.Descricao)) imovel.Descricao = atualizar.Descricao;
    if (!string.IsNullOrWhiteSpace(atualizar.Cidade)) imovel.Cidade = atualizar.Cidade;

    if (atualizar.Preco.HasValue) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos.HasValue) imovel.Quartos = atualizar.Quartos.Value;
    if (!string.IsNullOrWhiteSpace(atualizar.Imagem)) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync();
    return Results.Ok(new { mensagem = "Imóvel atualizado com segurança!" });
});

app.Run();