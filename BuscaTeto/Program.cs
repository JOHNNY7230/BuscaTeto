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

// 1. Adicionar os serviços do Swagger 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração da Base de Dados (Entity Framework Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 2. Ativar a interface visual do Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Serve ficheiros estáticos em wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// Serve ficheiros estáticos em wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/", () => Results.Redirect("/index.html"));

// Buscar imóveis na Base de Dados com filtros
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

// Buscar um único imóvel pelo ID
app.MapGet("/imoveis/{id}", async (AppDbContext db, Guid id) =>
{
    var imovel = await db.Imoveis.FindAsync(id);
    return imovel is null ? Results.NotFound() : Results.Ok(imovel);
});

// Guardar um novo imóvel na Base de Dados
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    var criado = new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Cidade = criar.Cidade,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        CriadoEm = DateTime.UtcNow
    };

    db.Imoveis.Add(criado);
    await db.SaveChangesAsync(); // Grava fisicamente no SQL Server

    return Results.Created($"/imoveis/{criado.Id}", criado);
});

// Atualizar um imóvel existente
app.MapPut("/imoveis/{id}", async (AppDbContext db, Guid id, AtualizarImovelRequest atualizar) =>
{
    var imovel = await db.Imoveis.FindAsync(id);
    if (imovel is null) return Results.NotFound();

    if (atualizar.Titulo != null) imovel.Titulo = atualizar.Titulo;
    if (atualizar.Descricao != null) imovel.Descricao = atualizar.Descricao;
    if (atualizar.Cidade != null) imovel.Cidade = atualizar.Cidade;

    // As duas linhas corrigidas com a extração do .Value
    if (atualizar.Preco != null) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos != null) imovel.Quartos = atualizar.Quartos.Value;

    if (atualizar.Imagem != null) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync(); // Atualiza fisicamente no SQL Server
    return Results.NoContent();
});
app.Run();