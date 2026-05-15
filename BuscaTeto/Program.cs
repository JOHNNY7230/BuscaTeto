using System;
using System.Linq;
using BuscaTeto.Models;
using BuscaTeto.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Força a execução em HTTP na porta 5005 para evitar conflitos de socket e HTTPS local
builder.WebHost.UseUrls("http://localhost:5005");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração do MySQL com versão explícita
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30)))
);

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

// Servir arquivos estáticos do frontend (declarado apenas uma vez)
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/", () => Results.Redirect("/index.html"));

// --- ROTAS DE IMÓVEIS ---

// Buscar imóveis com relacionamentos (Endereço e Usuário) e filtros
app.MapGet("/imoveis", async (AppDbContext db, string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin) =>
{
    var query = db.Imoveis
        .Include(i => i.Endereco)
        .Include(i => i.Usuario)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(cidade))
        query = query.Where(i => i.Endereco != null && i.Endereco.Cidade.Contains(cidade));
        query = query.Where(i => i.Endereco != null && i.Endereco.Cidade.Contains(cidade));
    if (precoMin.HasValue)
        query = query.Where(i => i.Preco >= precoMin.Value);
    if (precoMax.HasValue)
        query = query.Where(i => i.Preco <= precoMax.Value);
    if (quartosMin.HasValue)
        query = query.Where(i => i.Quartos >= quartosMin.Value);

    var resultados = await query.ToListAsync();
    return Results.Ok(resultados);
});

// Buscar imóvel singular pelo ID trazendo os relacionamentos
app.MapGet("/imoveis/{id}", async (AppDbContext db, Guid id) =>
{
    var imovel = await db.Imoveis
        .Include(i => i.Endereco)
        .Include(i => i.Usuario)
        .FirstOrDefaultAsync(i => i.Id == id);

    var imovel = await db.Imoveis
        .Include(i => i.Endereco)
        .Include(i => i.Usuario)
        .FirstOrDefaultAsync(i => i.Id == id);

    return imovel is null ? Results.NotFound() : Results.Ok(imovel);
});

// Cadastrar Imóvel e seu Endereço associado
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    // Valida se o usuário dono do imóvel realmente existe
    var usuarioExiste = await db.Usuarios.AnyAsync(u => u.Id == criar.UsuarioId);
    if (!usuarioExiste) return Results.BadRequest("O usuário especificado para o imóvel não foi encontrado.");

    // 1. Persiste o Endereço primeiro
    var novoEndereco = new Endereco
    {
        Id = Guid.NewGuid(),
        Logradouro = criar.Endereco.Logradouro,
        Numero = criar.Endereco.Numero,
        Bairro = criar.Endereco.Bairro,
        Cidade = criar.Endereco.Cidade,
        Estado = criar.Endereco.Estado,
        CEP = criar.Endereco.CEP
    };
    db.Enderecos.Add(novoEndereco);

    // 2. Persiste o Imóvel com a FK apontando para o Endereço recém-criado
    var novoImovel = new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        UsuarioId = criar.UsuarioId,
        EnderecoId = novoEndereco.Id,
        CriadoEm = DateTime.UtcNow
    };
    db.Imoveis.Add(novoImovel);

    await db.SaveChangesAsync();

    // Retorna o objeto completo montado para o client
    var imovelCompleto = await db.Imoveis
        .Include(i => i.Endereco)
        .FirstOrDefaultAsync(i => i.Id == novoImovel.Id);

    return Results.Created($"/imoveis/{novoImovel.Id}", imovelCompleto);
});

// Atualizar Imóvel
app.MapPut("/imoveis/{id}", async (AppDbContext db, Guid id, AtualizarImovelRequest atualizar) =>
{
    var imovel = await db.Imoveis.FindAsync(id);
    if (imovel is null) return Results.NotFound();

    if (atualizar.Titulo != null) imovel.Titulo = atualizar.Titulo;
    if (atualizar.Descricao != null) imovel.Descricao = atualizar.Descricao;
    if (atualizar.Preco.HasValue) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos.HasValue) imovel.Quartos = atualizar.Quartos.Value;
    if (atualizar.Imagem != null) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

// --- ROTAS DE USUÁRIOS ---

app.MapGet("/usuarios", async (AppDbContext db) =>

    var usuarios = await db.Usuarios.ToListAsync();
    return Results.Ok(usuarios);
});

app.MapGet("/usuarios/{id}", async (AppDbContext db, Guid id) =>
{
    var usuario = await db.Usuarios.FindAsync(id);
    return usuario is null ? Results.NotFound() : Results.Ok(usuario);
});

app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    // 1. Primeiro, criamos o objeto de Endereço baseado no registro aninhado
    var novoEndereco = new Endereco
    {
        Id = Guid.NewGuid(),
        Logradouro = criar.Endereco.Logradouro, // Acesso corrigido
        Numero = criar.Endereco.Numero,
        Bairro = criar.Endereco.Bairro,
        Cidade = criar.Endereco.Cidade,
        CEP = criar.Endereco.CEP
    };
    db.Enderecos.Add(novoEndereco);

    // 2. Depois, criamos o Imóvel associando o ID do endereço acima
    var criado = new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        UsuarioId = criar.UsuarioId,
        EnderecoId = novoEndereco.Id, // Vinculação da nova chave estrangeira
        CriadoEm = DateTime.UtcNow
    };

    db.Imoveis.Add(criado);
    await db.SaveChangesAsync();

    return Results.Created($"/imoveis/{criado.Id}", criado);
});

app.MapPut("/usuarios/{id}", async (AppDbContext db, Guid id, AtualizarUsuarioRequest atualizar) =>
{
    var usuario = await db.Usuarios.FindAsync(id);
    if (usuario is null) return Results.NotFound();

    if (atualizar.Nome != null) usuario.Nome = atualizar.Nome;
    if (atualizar.Email != null) usuario.Email = atualizar.Email;
    if (atualizar.Senha != null) usuario.Senha = atualizar.Senha;
    if (atualizar.Telefone != null) usuario.Telefone = atualizar.Telefone;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();