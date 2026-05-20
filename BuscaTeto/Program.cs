using System;
using System.Linq;
using BuscaTeto.Repositories;
using BuscaTeto.Models;
using BuscaTeto.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Força a API a escutar numa porta HTTP específica e limpa
builder.WebHost.UseUrls("http://localhost:5005");

// 1. Adicionar os serviços do Swagger 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

// Configuração da Base de Dados (Entity Framework Core com MySQL) com Resiliência
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

// Serve ficheiros estáticos na pasta wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/", () => Results.Redirect("/login.html"));

// Buscar imóveis filtrados
app.MapGet("/imoveis", async (AppDbContext db, string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin) =>
{
    var query = db.Imoveis.Include(i => i.Endereco).AsQueryable();

    if (!string.IsNullOrWhiteSpace(cidade))
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

// Guardar um novo imóvel na Base de Dados
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    var novoEnderecoId = Guid.NewGuid();

    var criado = new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        UsuarioId = criar.UsuarioId, // Mapeado como Guid corretamente
        CriadoEm = DateTime.UtcNow,

        EnderecoId = novoEnderecoId,
        Endereco = new Endereco
        {
            Id = novoEnderecoId,
            Logradouro = criar.Logradouro,
            Numero = criar.Numero,
            Bairro = criar.Bairro,
            Cidade = criar.Cidade,
            CEP = criar.CEP
        }
    };

    db.Imoveis.Add(criado);
    await db.SaveChangesAsync();

    return Results.Created($"/imoveis/{criado.Id}", criado);
});

// Atualizar um imóvel existente
app.MapPut("/imoveis/{id}", async (AppDbContext db, Guid id, AtualizarImovelRequest atualizar) =>
{
    var imovel = await db.Imoveis.Include(i => i.Endereco).FirstOrDefaultAsync(i => i.Id == id);
    if (imovel is null) return Results.NotFound();

    if (atualizar.Titulo != null) imovel.Titulo = atualizar.Titulo;
    if (atualizar.Descricao != null) imovel.Descricao = atualizar.Descricao;

    if (atualizar.Cidade != null && imovel.Endereco != null)
        imovel.Endereco.Cidade = atualizar.Cidade;

    if (atualizar.Preco != null) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos != null) imovel.Quartos = atualizar.Quartos.Value;
    if (atualizar.Imagem != null) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Buscar todos os utilizadores
app.MapGet("/usuarios", async (AppDbContext db) =>
{
    var usuarios = await db.Usuarios.ToListAsync();
    return Results.Ok(usuarios);
});

// Buscar um único utilizador pelo ID
app.MapGet("/usuarios/{id}", async (AppDbContext db, Guid id) =>
{
    var usuario = await db.Usuarios.FindAsync(id);
    return usuario is null ? Results.NotFound() : Results.Ok(usuario);
});

// Guardar um novo utilizador na Base de Dados
app.MapPost("/usuarios", async (AppDbContext db, CriarUsuarioRequest criar) =>
{
    var criado = new Usuario
    {
        Id = Guid.NewGuid(),
        Nome = criar.Nome,
        Email = criar.Email,
        Senha = criar.Senha,
        Telefone = criar.Telefone,
        TipoUsuario = criar.TipoUsuario
    };

    db.Usuarios.Add(criado);
    await db.SaveChangesAsync();

    return Results.Created($"/usuarios/{criado.Id}", criado);
});

// Atualizar um utilizador existente
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

app.MapControllers();

app.Run();

// =========================================================================
// CLASSES DE CONTEXTO E TRANSFERÊNCIA DE DADOS (RECORDS)
// =========================================================================
public record CriarImovelRequest(
    string Titulo,
    string? Descricao,
    decimal Preco,
    int Quartos,
    string? Imagem,
    Guid UsuarioId, // Voltou para Guid para casar com Imovel.cs
    string Logradouro,
    string? Numero,
    string? Bairro,
    string Cidade,
    string CEP
);

public record RespostaImovelDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    decimal Preco,
    int Quartos,
    string? Imagem,
    Guid UsuarioId,
    string Cidade
);

public record AtualizarImovelRequest(string? Titulo, string? Descricao, string? Cidade, decimal? Preco, int? Quartos, string? Imagem);
public record CriarUsuarioRequest(string Nome, string Email, string Senha, string Telefone, string TipoUsuario);
public record AtualizarUsuarioRequest(string? Nome, string? Email, string? Senha, string? Telefone);