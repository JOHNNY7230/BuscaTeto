using System;
using BuscaTeto.Repositories;
using BuscaTeto.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Serviços mínimos
builder.Services.AddSingleton<IRepositorioImovel, InMemoryPropertyRepository>();

var app = builder.Build();

// Serve arquivos estáticos em wwwroot (index.html será a interface básica)
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/", () => Results.Redirect("/index.html"));

app.MapGet("/imoveis", (IRepositorioImovel repositorio, string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin) =>
{
    var resultados = repositorio.Buscar(cidade, precoMin, precoMax, quartosMin);
    return Results.Ok(resultados);
});

app.MapGet("/imoveis/{id}", (IRepositorioImovel repositorio, Guid id) =>
{
    var imovel = repositorio.Obter(id);
    return imovel is null ? Results.NotFound() : Results.Ok(imovel);
});

app.MapPost("/imoveis", (IRepositorioImovel repositorio, CriarImovelRequest criar) =>
{
    var criado = repositorio.Criar(new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Cidade = criar.Cidade,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        CriadoEm = DateTime.UtcNow
    });

    return Results.Created($"/imoveis/{criado.Id}", criado);
});

app.MapPut("/imoveis/{id}", (IRepositorioImovel repositorio, Guid id, AtualizarImovelRequest atualizar) =>
{
    var sucesso = repositorio.Atualizar(id, atualizar);
    return sucesso ? Results.NoContent() : Results.NotFound();
});

// Rota de exclusão removida — alterações devem ser feitas via backend seguro ou soft-delete

app.Run();
