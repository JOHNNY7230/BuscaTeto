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

// Força a API a escutar numa porta HTTP específica e limpa, contornando bloqueios do Windows
builder.WebHost.UseUrls("http://localhost:5005");

// 1. Adicionar os serviços do Swagger 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração da Base de Dados (Entity Framework Core com MySQL) atualizada com Resiliência
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 30)), // Versão padrão estável do MySQL
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,               // Tenta reconectar até 5 vezes se a rede oscilar
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

// Guardar um novo imóvel na Base de Dados (COM REGRA DE NEGÓCIO)
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    // Verifica quem é o utilizador a tentar criar o imóvel
    var usuario = await db.Usuarios.FindAsync(criar.UsuarioId);

    if (usuario == null)
    {
        return Results.NotFound("Utilizador criador não encontrado no sistema.");
    }

    // Se o utilizador não for proprietário, bloqueia a operação!
    if (usuario.Tipo != TipoUsuario.Proprietario)
    {
        return Results.BadRequest("Acesso negado. Apenas proprietários podem anunciar imóveis.");
    }

    var criado = new Imovel
    {
        Id = Guid.NewGuid(),
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
    await db.SaveChangesAsync(); // Grava fisicamente no MySQL

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

    if (atualizar.Preco != null) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos != null) imovel.Quartos = atualizar.Quartos.Value;
    if (atualizar.Imagem != null) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync(); // Atualiza fisicamente no MySQL
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

// Guardar um novo utilizador na Base de Dados (COM REGRA DE NEGÓCIO)
app.MapPost("/usuarios", async (AppDbContext db, CriarUsuarioRequest criar) =>
{
    // Regra de Negócio: O sistema não pode aceitar um tipo que não exista
    if (criar.Tipo != TipoUsuario.Cliente && criar.Tipo != TipoUsuario.Proprietario)
    {
        return Results.BadRequest("Tipo de utilizador inválido. Escolha 0 para Cliente ou 1 para Proprietário.");
    }

    var criado = new Usuario
    {
        Id = Guid.NewGuid(),
        Nome = criar.Nome,
        Email = criar.Email,
        Senha = criar.Senha,
        Telefone = criar.Telefone,
        Tipo = criar.Tipo, // Guarda o tipo na base de dados
        CriadoEm = DateTime.UtcNow
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

app.Run();